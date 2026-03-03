import { pool } from "../db/connect_db.js";
import { google } from "googleapis";
import { getSettings } from "./settingsService.js";

export default class Gmail {
    static async create({email = undefined, auth = true} = {}) {
        if (!email) {
            const settings = await getSettings();
            email = settings.contact.notificationEmail;
            // const [rows] = await pool.query(`
            //     SELECT contact_email
            //     FROM contact_info
            //     LIMIT 1
            // `);
            // email = rows[0].contact_email;
        }

        const gmail = new this(email);
        if (auth) await gmail.connect();
        return gmail;
    }

    constructor(email) {
        this.email = email;
    }

    async getTokens() {
        const [rows] = await pool.query(
            `SELECT * FROM gmail_accounts WHERE email = ?`,
            [this.email]
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
        const {
            access_token,
            refresh_token,
            scope,
            token_type,
            expiry_date,
        } = tokens;

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
            [
                this.email,
                access_token,
                refresh_token,
                scope,
                token_type,
                expiry_date,
            ]
        );
    }

    async connect() {
        const tokens = await this.getTokens(this.email);
        if (!tokens) throw new Error(`Email ${this.email} does not have authentication tokens stored in db`);

        const oauth2Client = new google.auth.OAuth2({
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            redirectUri: process.env.REDIRECT_URI
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
    }

    async checkAuth() {
        const tokens = await this.getTokens();
        if (!tokens) return {authenticated: false, registered: false};

        try {
            await this.connect();
            await this.gmail.users.getProfile({
                userId: "me",
            });
        } catch (err) {
            return {authenticated: false, registered: true}
        }

        return {authenticated: true, registered: true}
    }

    async fetchThreads({pageToken = undefined, maxResults = 20} = {}) {
        // Get basic thread info from gmail
        const response = await this.gmail.users.threads.list({
            userId: "me",
            maxResults,
            pageToken
        });

        // Get more detailed thread information for each thread
        const threads = await Promise.all(response.data.threads.map((thread) =>
            this.fetchThread(thread.id, {historyId: thread.historyId, preview: true})
        ));

        return {
            threads,
            nextPageToken: response.data.nextPageToken
        };
    }

    async fetchThread(id, {historyId = undefined, preview = false} = {}) {
        // Check if thread is cached and cache is up to date
        const [cacheRows] = await pool.query("SELECT * FROM gmail_threads WHERE email=? AND thread_id=?", [this.email, id]);
        
        if (cacheRows.length == 0 || (historyId && historyId != cacheRows[0].history_id)) {
            // Thread is not cached or cache is not up to date

            // Fetch newest thread data
            const response = await this.gmail.users.threads.get({
                userId: "me",
                id,
                format: "metadata",
                metadataHeaders: ["Subject", "From", "Date", "Reply-To"]
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
                [this.email, id, response.data.historyId]
            );

            // Cache message data
            await Promise.all(response.data.messages.map(async (message) => {
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
                    [this.email, message.id, id, message.historyId, true, parsed.isUnread, parsed.snippet, null, new Date(parsed.date), parsed.subject, parsed.fromName, parsed.fromEmail]
                );
            }));
        }

        // Get messages from cache
        const [rows] = await pool.query(
            "SELECT * FROM gmail_messages WHERE email=? AND thread_id=?",
            [this.email, id]
        );
        
        // Reformat messages
        const messages = await Promise.all(rows.map(async (row) => {
            // If full message requested and only a preview is saved, need to fetch and parse body
            let body = row.body;
            if (!preview && row.is_preview) {
                // Get raw message
                const response = await this.gmail.users.messages.get({
                    userId: "me",
                    id: row.message_id,
                    format: "raw"
                });

                // Parse raw message
                body = "UNFINISHED";

                // Save parsed body to cache
                await pool.query(
                    `
                    UPDATE gmail_messages
                    WHERE email=? AND message_id=?
                    SET body=?
                    `,
                    [this.email, row.message_id, body]
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
                fromSelf: (row.from_email === this.email)
            };
        }));

        return {
            id,
            messages
        }
    }

    async sendMessage({
        to, subject, message, fromName=undefined, replyTo=undefined
    }) {
        const parts = [];

        parts.push(`To: ${to}`);
        if (fromName) parts.push(`From: "${fromName}" <${this.email}>`);
        else parts.push(`From: ${this.email}`);
        if (replyTo) parts.push(`Reply-To: ${replyTo}`);
        parts.push(`Subject: ${subject}`);
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
            userId: 'me',
            requestBody: {
                raw: encodedMessage
            },
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

    snippet = snippet.split(/On [A-z]{3}, [A-z]{3} [0-9]{1,2}, [0-9]{1,4} at [0-9]{1,2}:[0-9]{2} (A|P)M .*? wrote: /)[0].trimEnd()

    for (const {name, value} of message.payload.headers) {
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
            fromName = fromName.substring(0, fromName.length - " via Contact Form".length);
            if (snippet.startsWith("Message from ")) {
                const splits = snippet.split(" via Pho City Website Contact Form: ");
                if (splits.length > 1) {
                    snippet = splits.slice(1).join(" via Pho City Website Contact Form: ");
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
        fromSelf: (fromEmail == clientEmail),
        date,
        subject,
        snippet,
        isUnread: message.labelIds.includes('UNREAD')
    }
}