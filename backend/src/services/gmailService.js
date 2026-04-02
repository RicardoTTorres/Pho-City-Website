import { pool } from "../db/connect_db.js";
import { google } from "googleapis";
import { getSettings } from "./settingsService.js";
import { simpleParser } from "mailparser";
import { htmlToText } from "html-to-text";
import EmailReplyParser from "email-reply-parser";
import { ImapFlow } from "imapflow";
import nodemailer from "nodemailer";
import { text as streamToText } from "node:stream/consumers";

const clientCache = new Map();

export async function getEmailClient({
  email = undefined,
  send = true,
  inbox = true,
} = {}) {
  if (!email) {
    const settings = await getSettings();
    email = settings.contact.notificationEmail;
  }

  let client = clientCache.get(email);
  if (client) {
    let { authenticated } = await client.checkAuth({ send, inbox });
    if (authenticated) {
      return { client, authenticated: true, registered: true, email };
    } else {
      clientCache.delete(email);
    }
  }

  client = new GmailClient(email);
  let { authenticated: gmailAuthenticated, registered: gmailRegistered } =
    await client.checkAuth({ send, inbox });
  if (gmailAuthenticated) {
    limitClientCache();
    clientCache.set(email, client);
    return { client, authenticated: true, registered: true, email };
  }

  client = new ImapClient(email);
  let { authenticated: imapAuthenticated, registered: imapRegistered } =
    await client.checkAuth({ send, inbox });
  if (imapAuthenticated) {
    limitClientCache();
    clientCache.set(email, client);
    return { client, authenticated: true, registered: true, email };
  }

  return {
    client: undefined,
    authenticated: false,
    registered: gmailRegistered || imapRegistered,
    email,
  };
}

function limitClientCache() {
  if (clientCache.size >= 10) {
    let minTime = Infinity;
    let minEmail = undefined;
    clientCache.forEach((client, email) => {
      if (client.createTime < minTime) {
        minTime = client.createTime;
        minEmail = email;
      }
    });
    clientCache.delete(minEmail);
  }
}

export class GmailClient {
  constructor(email) {
    this.email = email;
    this.createTime = Date.now();
    this.gmail = undefined;
    this.connected = false;
  }

  async getTokens() {
    const [rows] = await pool.query(
      `SELECT * FROM gmail_accounts WHERE email = ?`,
      [this.email],
    );

    if (rows.length == 0) return null;

    const row = rows[0];

    return {
      access_token: row.access_token,
      refresh_token: row.refresh_token,
      scope: row.scope,
      token_type: row.token_type,
      expiry_date: row.expiry_date,
    };
  }

  async saveTokens(tokens) {
    const { access_token, refresh_token, scope, token_type, expiry_date } =
      tokens;

    await pool.query(
      `
            INSERT INTO gmail_accounts
                (email, access_token, refresh_token, scope, token_type, expiry_date)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                access_token = VALUES(access_token),
                refresh_token = VALUES(refresh_token),
                scope = VALUES(scope),
                token_type = VALUES(token_type),
                expiry_date = VALUES(expiry_date)
            `,
      [this.email, access_token, refresh_token, scope, token_type, expiry_date],
    );
  }

  async connect() {
    if (this.connected) return;

    const tokens = await this.getTokens(this.email);
    if (!tokens)
      throw new Error(
        `Email ${this.email} does not have authentication tokens stored in db`,
      );

    const oauth2Client = new google.auth.OAuth2({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      redirectUri: process.env.REDIRECT_URI,
    });
    oauth2Client.setCredentials(tokens);

    oauth2Client.on("tokens", async (newTokens) => {
      await this.saveTokens({
        ...tokens,
        ...newTokens,
      });
    });

    this.gmail = google.gmail({
      version: "v1",
      auth: oauth2Client,
    });

    this.connected = true;
  }

  async checkAuth({ send = true, inbox = true } = {}) {
    const tokens = await this.getTokens();
    if (!tokens) return { authenticated: false, registered: false };

    try {
      await this.connect();
      await this.gmail.users.getProfile({
        userId: "me",
      });
    } catch (err) {
      return { authenticated: false, registered: true };
    }

    return { authenticated: true, registered: true };
  }

  async fetchThreads({ pageToken = undefined, maxResults = 10 } = {}) {
    await this.connect();

    // Get basic thread info from gmail
    const response = await this.gmail.users.threads.list({
      userId: "me",
      maxResults,
      pageToken,
    });

    // Get more detailed thread information for each thread
    const threads = await Promise.all(
      response.data.threads.map((thread) =>
        this.fetchThread(thread.id, {
          historyId: thread.historyId,
          preview: true,
        }),
      ),
    );

    return {
      threads,
      nextPageToken: response.data.nextPageToken,
    };
  }

  async fetchThread(
    id,
    { historyId = undefined, preview = false, forceRefresh = false } = {},
  ) {
    await this.connect();

    // Check if thread is cached and cache is up to date
    const [cacheRows] = await pool.query(
      "SELECT * FROM gmail_threads WHERE email=? AND thread_id=?",
      [this.email, id],
    );

    if (
      cacheRows.length == 0 ||
      (historyId && historyId != cacheRows[0].history_id) ||
      forceRefresh
    ) {
      // Thread is not cached or cache is not up to date

      // Fetch newest thread data
      const response = await this.gmail.users.threads.get({
        userId: "me",
        id,
        format: "metadata",
        metadataHeaders: ["Subject", "From", "Date", "Reply-To"],
      });

      // Cache thread data
      await pool.query(
        `
                INSERT INTO gmail_threads
                    (email, thread_id, history_id)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    history_id = VALUES(history_id)
                `,
        [this.email, id, response.data.historyId],
      );

      // Cache message data
      await Promise.all(
        response.data.messages.map(async (message) => {
          const parsed = parseMessage(message, this.email);
          await pool.query(
            `
                    INSERT INTO gmail_messages
                        (email, message_id, thread_id, history_id, is_preview, is_unread, snippet, body, date, subject, from_name, from_email)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                        history_id=VALUES(history_id),
                        is_unread=VALUES(is_unread)
                    `,
            [
              this.email,
              message.id,
              id,
              message.historyId,
              true,
              parsed.isUnread,
              parsed.snippet,
              null,
              new Date(parsed.date),
              parsed.subject,
              parsed.fromName,
              parsed.fromEmail,
            ],
          );
        }),
      );
    }

    // Get messages from cache
    const [rows] = await pool.query(
      `
            SELECT * FROM gmail_messages
            WHERE email=? AND thread_id=?
            ORDER BY date ASC
            `,
      [this.email, id],
    );

    // Reformat messages
    const messages = await Promise.all(
      rows.map(async (row) => {
        // If full message requested and only a preview is saved, need to fetch and parse body
        let body = row.body;
        if (!preview && row.is_preview) {
          // Get raw message
          const response = await this.gmail.users.messages.get({
            userId: "me",
            id: row.message_id,
            format: "raw",
          });

          // Parse raw message
          body = await parseBody(response.data.raw);

          // Save parsed body to cache
          await pool.query(
            `
                    UPDATE gmail_messages
                    SET body=?
                    WHERE email=? AND message_id=?
                    `,
            [body, this.email, row.message_id],
          );
        }

        return {
          id: row.message_id,
          threadId: row.thread_id,
          isUnread: row.is_unread,
          snippet: row.snippet,
          body,
          date: row.date,
          subject: row.subject,
          fromName: row.from_name,
          fromEmail: row.from_email,
          fromSelf: row.from_email === this.email,
          isPreview: body == undefined,
          isGmail: true,
        };
      }),
    );

    let threadSnippet = messages.at(-1).body || messages.at(-1).snippet;
    if (messages.at(-1).fromSelf) threadSnippet = `You: ${threadSnippet}`;

    let threadPeople = [
      ...new Set(
        messages.map((m) => (m.fromSelf ? "You" : m.fromName || m.fromEmail)),
      ),
    ];

    return {
      id,
      messages,
      isUnread: messages.map((m) => m.isUnread).reduce((x, y) => x || y),
      date: messages.at(-1).date,
      snippet: threadSnippet,
      people: threadPeople,
      isPreview: messages.some((m) => m.isPreview),
      isGmail: true,
    };
  }

  async sendMessage({
    to,
    subject,
    message,
    fromName = undefined,
    replyTo = undefined,
    inReplyTo = undefined,
    references = undefined,
    threadId = undefined,
  }) {
    await this.connect();

    const parts = [];

    parts.push(`To: ${to}`);
    if (fromName) parts.push(`From: "${fromName}" <${this.email}>`);
    else parts.push(`From: ${this.email}`);
    if (replyTo) parts.push(`Reply-To: ${replyTo}`);
    parts.push(`Subject: ${subject}`);
    if (inReplyTo) parts.push(`In-Reply-To: ${inReplyTo}`);
    if (references) parts.push(`References: ${references}`);
    parts.push(`Content-Type: text/plain; charset=utf-8`);
    parts.push(``);
    parts.push(message);

    const msg = parts.join("\n");

    const encodedMessage = Buffer.from(msg)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    await this.gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
        threadId,
      },
    });
  }

  async markRead(threadId) {
    await this.connect();

    await this.gmail.users.threads.modify({
      id: threadId,
      userId: "me",
      requestBody: {
        removeLabelIds: ["UNREAD"],
      },
    });
  }

  async markUnread(threadId) {
    await this.connect();

    await this.gmail.users.threads.modify({
      id: threadId,
      userId: "me",
      requestBody: {
        addLabelIds: ["UNREAD"],
      },
    });
  }

  async trash(threadId) {
    await this.gmail.users.threads.trash({
      userId: "me",
      id: threadId,
    });
    await pool.query(
      `DELETE FROM gmail_messages WHERE email=? AND thread_id=?`,
      [this.email, threadId],
    );
    await pool.query(
      `DELETE FROM gmail_threads WHERE email=? AND thread_id=?`,
      [this.email, threadId],
    );
  }

  async reply(threadId, body) {
    await this.connect();

    const thread = await this.fetchThread(threadId, { preview: true });
    const lastMessage = thread.messages.at(-1);

    const response = await this.gmail.users.messages.get({
      userId: "me",
      id: lastMessage.id,
      format: "metadata",
      metadataHeaders: ["Message-ID"],
    });
    const internalMessageId = response.data.payload.headers.find(
      ({ name, value }) => name.toLowerCase() == "Message-ID".toLowerCase(),
    ).value;
    if (!internalMessageId) throw new Error("Internal Message-ID not found");

    const allEmails = thread.messages
      .filter((m) => !m.fromSelf)
      .map((m) => m.fromEmail);

    await this.sendMessage({
      to: (allEmails.length > 0 ? allEmails : [this.email]).join(", "),
      subject: `Re: ${lastMessage.subject}`,
      message: body,
      inReplyTo: internalMessageId,
      references: internalMessageId,
      threadId,
    });
  }
}

export class ImapClient {
  constructor(email) {
    this.email = email;
    this.createTime = Date.now();
    this.client = undefined;
    this.clientConnected = false;
    this.transporter = undefined;
    this.transporterConnected = false;
  }

  async getAppPass() {
    const [rows] = await pool.query(
      `SELECT * FROM imap_accounts WHERE email = ?`,
      [this.email],
    );
    if (rows.length == 0) return null;
    return rows[0].app_pass;
  }

  async setAppPass(appPass) {
    await pool.query(
      `
            INSERT INTO imap_accounts
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE
                app_pass = VALUES(app_pass)
            `,
      [this.email, appPass],
    );
  }

  async connectInbox() {
    if (!this.client) {
      this.client = new ImapFlow({
        host: "imap.gmail.com",
        port: 993,
        secure: true,
        auth: {
          user: this.email,
          pass: await this.getAppPass(),
        },
        logger: false,
      });
    }
    if (!this.clientConnected || !this.client.usable) {
      await this.client.connect();
      this.clientConnected = true;
    }
  }

  async connectSend() {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: this.email,
          pass: await this.getAppPass(),
        },
      });
      this.transporterConnected = true;
    }
  }

  async disconnect() {
    if (this.client && this.clientConnected) {
      await this.client.logout();
      this.clientConnected = false;
    }
  }

  async checkAuth({ send = true, inbox = true } = {}) {
    try {
      const pass = await this.getAppPass();
      if (!pass) return { authenticated: false, registered: false };
    } catch (err) {
      return { authenticated: false, registered: false };
    }

    if (send) {
      try {
        await this.connectSend();
        await this.transporter.verify();
      } catch (err) {
        return { authenticated: false, registered: true };
      }
    }

    if (inbox) {
      try {
        await this.connectInbox();
        if (!this.client.usable)
          return { authenticated: false, registered: true };
      } catch (err) {
        return { authenticated: false, registered: true };
      }
    }

    return { authenticated: true, registered: true };
  }

  async fetchThreads({ pageToken = undefined, maxResults = 20 } = {}) {
    await this.connectInbox();

    const lock = await this.client.getMailboxLock("INBOX");
    try {
      let n = this.client.mailbox?.exists || 0;
      let last = n - (pageToken || 0);
      let first = n - maxResults + 1 - (pageToken || 0);
      if (first < 1) first = 1;
      if (last - first < 0) {
        lock.release();
        return {
          threads: [],
          nextPageToken: undefined,
        };
      }
      const messages = await this.client.fetchAll(`${first}:${last}`, {
        threadId: true,
      });
      lock.release();

      const threadIds = [...new Set(messages.map((m) => m.threadId).reverse())];
      const threads = await Promise.all(
        threadIds.map((id) =>
          this.fetchThread(id, {
            preview: true,
            allContent: false,
            recentContent: true,
          }),
        ),
      );

      return {
        threads,
        nextPageToken: first == 1 ? undefined : (pageToken || 0) + maxResults,
      };
    } finally {
      lock.release();
    }
  }

  async downloadMessageContent(uid, part, maxBytes = undefined) {
    const download = await this.client.download(`${uid}`, part, {
      uid: true,
      maxBytes: part === undefined ? undefined : maxBytes,
    });
    let text = await streamToText(download.content);
    text = text.replaceAll("\r", "");
    if (part === undefined) {
      text = text.split("\n\n").slice(1).join("\n\n");
      if (maxBytes) text = text.substring(0, maxBytes);
    }
    return text;
  }

  async fetchThread(
    id,
    {
      historyId = undefined,
      preview = false,
      forceRefresh = false,
      allContent = true,
      recentContent = false,
    } = {},
  ) {
    await this.connectInbox();

    const lock = await this.client.getMailboxLock("INBOX");
    try {
      const rawMessages = await this.client.fetchAll(
        { threadId: id },
        { uid: true, flags: true, envelope: true, bodyStructure: true },
      );
      const messages = await Promise.all(
        rawMessages.map(async (message, index) => {
          const parsed = parseImapMessage(message, this.email);

          let body;
          let snippet;
          if (
            allContent ||
            (recentContent && index == rawMessages.length - 1)
          ) {
            snippet = "";

            const [rows] = await pool.query(
              `
                        SELECT *
                        FROM imap_messages
                        WHERE email = ? AND message_id = ?
                        `,
              [this.email, message.emailId],
            );

            if (rows.length == 0 || (rows[0].is_preview && !preview)) {
              if (preview) {
                // download snippet
                const { found, part } = bodyStructureFindPart(
                  message.bodyStructure,
                  false,
                );
                if (found) {
                  snippet = await this.downloadMessageContent(
                    message.uid,
                    part,
                    300,
                  );
                  snippet = snippet
                    .split(
                      /On [A-z]{3}, [A-z]{3} [0-9]{1,2}, [0-9]{1,4} at [0-9]{1,2}:[0-9]{2}.(A|P)M .*? wrote:/,
                    )[0]
                    .trimEnd();
                  if (
                    parsed.contactForm &&
                    snippet.startsWith("Message from ")
                  ) {
                    snippet = snippet.replace(
                      /Message from .*? \(.*?\) via Pho City Website Contact Form:/,
                      "",
                    );
                  }
                }
              } else {
                // download full body
                const { found, part, type } = bodyStructureFindPart(
                  message.bodyStructure,
                  true,
                );
                body = "";
                if (found) {
                  body = await this.downloadMessageContent(message.uid, part);
                  if (type == "text/html") {
                    body = htmlToText(body, { wordwrap: false });
                  }
                  body = new EmailReplyParser().parseReply(body);
                  if (body.startsWith("Message from "))
                    body = body.replace(
                      /Message from .*? \(.*?\) via Pho City Website Contact Form:/,
                      "",
                    );
                  body = body.trim();
                  snippet = body.substring(0, 300);
                }
              }

              // save downloaded content to cache
              await pool.query(
                `
                            INSERT INTO imap_messages
                            VALUES (?, ?, ?, ?, ?)
                            ON DUPLICATE KEY UPDATE
                                is_preview = VALUES(is_preview),
                                snippet = COALESCE(VALUES(snippet), snippet),
                                body = COALESCE(VALUES(body), body)
                            `,
                [
                  this.email,
                  message.emailId,
                  body === undefined,
                  snippet,
                  body,
                ],
              );
            } else {
              snippet = rows[0].snippet;
              body = rows[0].body;
            }
          }

          return {
            id: parsed.id,
            threadId: parsed.threadId,
            isUnread: parsed.isUnread,
            snippet: snippet,
            body: body,
            date: parsed.date,
            subject: parsed.subject,
            fromName: parsed.fromName,
            fromEmail: parsed.fromEmail,
            fromSelf: parsed.fromSelf,
            isPreview: body === undefined,
            isGmail: true,
            internalMessageId: message.envelope.messageId,
          };
        }),
      );

      lock.release();

      let threadSnippet = messages.at(-1).body || messages.at(-1).snippet;
      if (messages.at(-1).fromSelf) threadSnippet = `You: ${threadSnippet}`;

      let threadPeople = [
        ...new Set(
          messages.map((m) => (m.fromSelf ? "You" : m.fromName || m.fromEmail)),
        ),
      ];

      return {
        id,
        messages,
        isUnread: messages.map((m) => m.isUnread).reduce((x, y) => x || y),
        date: messages.at(-1).date,
        snippet: threadSnippet,
        people: threadPeople,
        isPreview: messages.some((m) => m.isPreview),
        isGmail: true,
      };
    } finally {
      lock.release();
    }
  }

  async sendMessage({
    to,
    subject,
    message,
    fromName = undefined,
    replyTo = undefined,
    inReplyTo = undefined,
    references = undefined,
    threadId = undefined,
  }) {
    await this.connectSend();
    this.transporter.sendMail({
      to,
      from: fromName ? `"${fromName}" <${this.email}>` : this.email,
      replyTo,
      subject,
      inReplyTo,
      references,
      text: message,
    });
  }

  async markRead(threadId) {
    await this.connectInbox();
    const lock = await this.client.getMailboxLock("INBOX");
    try {
      const messageIds = await this.client.search({ threadId });
      await this.client.messageFlagsAdd(messageIds, ["\\Seen"]);
    } finally {
      lock.release();
    }
  }

  async markUnread(threadId) {
    await this.connectInbox();
    const lock = await this.client.getMailboxLock("INBOX");
    try {
      const messageIds = await this.client.search({ threadId });
      await this.client.messageFlagsRemove(messageIds, ["\\Seen"]);
    } finally {
      lock.release();
    }
  }

  async reply(threadId, body) {
    const thread = await this.fetchThread(threadId, {
      preview: true,
      allContent: false,
    });
    const lastMessage = thread.messages.at(-1);
    const internalMessageId = lastMessage.internalMessageId;
    const allEmails = thread.messages
      .filter((m) => !m.fromSelf)
      .map((m) => m.fromEmail);
    await this.sendMessage({
      to: (allEmails.length > 0 ? allEmails : [this.email]).join(", "),
      subject: `Re: ${lastMessage.subject}`,
      message: body,
      inReplyTo: internalMessageId,
      references: internalMessageId,
      threadId,
    });
  }
}

function parseMessage(message, clientEmail) {
  let from;
  let fromName;
  let fromEmail;
  let replyTo;
  let date;
  let subject;
  let snippet = message.snippet;

  snippet = snippet
    .split(
      /On [A-z]{3}, [A-z]{3} [0-9]{1,2}, [0-9]{1,4} at [0-9]{1,2}:[0-9]{2}.(A|P)M .*? wrote:/,
    )[0]
    .trimEnd();

  for (const { name, value } of message.payload.headers) {
    if (name == "Date") date = value;
    else if (name == "From") from = value;
    else if (name == "Reply-To") replyTo = value;
    else if (name == "Subject") subject = value;
  }
  if (from && from.endsWith(">") && from.includes("<")) {
    from = from.substring(0, from.length - 1);
    const splits = from.split("<");
    fromEmail = splits.pop();
    fromName = splits.join("<");
    fromName = fromName.substring(0, fromName.length - 1);
  } else {
    fromEmail = from;
  }
  if (replyTo) {
    fromEmail = replyTo;
    if (fromName && fromName.endsWith(" via Contact Form")) {
      fromName = fromName.substring(
        0,
        fromName.length - " via Contact Form".length,
      );
      if (snippet.startsWith("Message from ")) {
        const splits = snippet.split(" via Pho City Website Contact Form: ");
        if (splits.length > 1) {
          snippet = splits
            .slice(1)
            .join(" via Pho City Website Contact Form: ");
        }
      }
    }
  }
  date = new Date(date).toISOString();

  return {
    id: message.id,
    threadId: message.threadId,
    fromEmail,
    fromName,
    fromSelf: fromEmail == clientEmail,
    date,
    subject,
    snippet: snippet.substring(0, 300),
    isUnread: message.labelIds.includes("UNREAD"),
  };
}

function parseImapMessage(message, clientEmail) {
  let from = message.envelope.from[0];
  let fromName = from.name;
  let fromEmail = from.address;
  let replyTo;
  if (message.envelope.replyTo && message.envelope.replyTo.length > 0)
    replyTo = message.envelope.replyTo[0].address;
  let date = new Date(message.envelope.date).toISOString();
  let subject = message.envelope.subject;
  let contactForm = false;

  if (replyTo) {
    fromEmail = replyTo;
    if (fromName && fromName.endsWith(" via Contact Form")) {
      fromName = fromName.substring(
        0,
        fromName.length - " via Contact Form".length,
      );
      contactForm = true;
    }
  }

  return {
    id: message.emailId,
    threadId: message.threadId,
    fromEmail,
    fromName,
    fromSelf: fromEmail == clientEmail,
    date,
    subject,
    isUnread: !message.flags.has("\\Seen"),
    contactForm,
  };
}

async function parseBody(raw) {
  raw = raw.replace(/-/g, "+").replace(/_/g, "/"); // convert base64 url to base 64
  const parsed = await simpleParser(Buffer.from(raw, "base64"));

  let text = "";
  if (parsed.text) {
    text = parsed.text;
  } else if (parsed.html) {
    text = htmlToText(parsed.html, { wordwrap: false });
  }

  text = new EmailReplyParser().parseReply(text);
  if (text.startsWith("Message from "))
    text = text.replace(
      /Message from .*? \(.*?\) via Pho City Website Contact Form:/,
      "",
    );

  return text.trim();
}

function bodyStructureFindPart(node, allowHtml) {
  if (node.type == "text/plain") {
    return { found: true, part: node.part, type: node.type };
  } else if (allowHtml && node.type == "text/html") {
    return { found: true, part: node.part, type: node.type };
  } else if (node.childNodes) {
    for (const c of node.childNodes) {
      const { found, part, type } = bodyStructureFindPart(c, allowHtml);
      if (found) return { found, part, type };
    }
  }
  return { found: false, part: undefined, type: undefined };
}
