import { pool } from "../db/connect_db.js";
import { google } from "googleapis";
import { getEmailClient, GmailClient, ImapClient } from "../services/gmailService.js";
import { getSubmissions } from "../services/settingsService.js";

/**
 * Get whether the contact email is authenticated to access inbox
 * Frontend calls to see if it should show authenticate screen or can get messages
 */
export async function getState(req, res) {
    try {
        const {authenticated, registered, email} = await getEmailClient();
        res.json({
            authenticated,
            registered,
            email
        });

    } catch (err) {
        console.error("Error getting authentication state:", err);
        res.status(500).json({
            error: "Error getting authentication state"
        });
    }
}

/**
 * Create auth url to authenticate with google on frontend
 * Redirects to url to allow user to give access to the gmail account
 */
export async function createAuthUrl(req, res) {
    try {
        const oauth2Client = new google.auth.OAuth2({
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            redirectUri: process.env.REDIRECT_URI
        });

        const url = oauth2Client.generateAuthUrl({
            access_type: "offline",
            prompt: "consent",
            scope: [
                "https://www.googleapis.com/auth/gmail.modify",
                "https://www.googleapis.com/auth/gmail.send",
            ]
        });
        res.redirect(url);

    } catch (err) {
        console.error("Error creating google auth url:", err);
        res.status(500).json({
            error: "Error creating google auth url"
        });
    }
};

/**
 * Google redirects here with oauth2 tokens after user authenticates
 * Tokens are logged to database to access the gmail account
 */
export async function finishAuth(req, res) {
    try {
        const { code } = req.query;

        const oauth2Client = new google.auth.OAuth2({
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            redirectUri: process.env.REDIRECT_URI
        });

        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        const gmail = google.gmail({
            version: "v1",
            auth: oauth2Client,
        });
        const profile = await gmail.users.getProfile({
            userId: "me",
        });
        const wrapper = new GmailClient(profile.data.emailAddress);
        await wrapper.saveTokens(tokens);

        res.send(`
            <html>
                <body>
                <script>
                    window.opener.postMessage("gmail-connected", "*");
                    window.close();
                </script>
                Connected. You can close this window.
                </body>
            </html>
        `);

    } catch (err) {
        console.error("Error completing oauth:", err);
        res.status(500).json({
            error: "Error completing oauth"
        });
    }
};

/**
 * Get list of thread previews that can be selected
 */
export async function getThreads(req, res) {
    try {
        const maxResults = Math.min(req.query?.maxResults || 10, 40);
        const pageToken = req.query?.pageToken;
        const {client, authenticated} = await getEmailClient();
        if (!authenticated) return res.status(401).json({ error: "Not authenticated to access gmail" });
        const threads = await client.fetchThreads({maxResults, pageToken});
        res.json(threads);

    } catch (err) {
        console.error("Error getting threads:", err);
        res.status(500).json({ error: "Error getting threads "});
    }
}

/**
 * Get messages in a selected thread
 */
export async function getThread(req, res) {
    try {
        const {id} = req.params;
        const {forceRefresh} = req.query;
        if (!id) {
            return res.status(400).json({ error: "Missing required field id" });
        }
        const {client, authenticated} = await getEmailClient();
        if (!authenticated) return res.status(401).json({ error: "Not authenticated to access gmail" });
        const thread = await client.fetchThread(id, {forceRefresh});
        res.json(thread);

    } catch (err) {
        console.error("Error getting thread:", err);
        res.status(500).json({ error: "Error getting thread" });
    }
}

/**
 * Mark thread as read
 */
export async function markRead(req, res) {
    try {
        const {id} = req.params;
        const {db} = req.query;
        if (!id) {
            return res.status(400).json({ error: "Missing required field id" });
        }
        if (db) {
            await pool.query(
                `
                UPDATE contact_submissions
                SET is_read=1
                WHERE id=?
                `,
                [id]
            );
            return res.status(200).json({ ok: true });
        }
        const {client, authenticated} = await getEmailClient();
        if (!authenticated) return res.status(401).json({ error: "Not authenticated to access gmail" });
        await client.markRead(id);
        res.status(200).json({ ok: true });

    } catch (err) {
        console.error("Error marking thread as read:", err);
        res.status(500).json({ error: "Error marking thread as read" });
    }
}

/**
 * Mark thread as unread
 */
export async function markUnread(req, res) {
    try {
        const {id} = req.params;
        const {db} = req.query;
        if (!id) {
            return res.status(400).json({ error: "Missing required field id" });
        }
        if (db) {
            await pool.query(
                `
                UPDATE contact_submissions
                SET is_read=0
                WHERE id=?
                `,
                [id]
            );
            return res.status(200).json({ ok: true });
        }
        const {client, authenticated} = await getEmailClient();
        if (!authenticated) return res.status(401).json({ error: "Not authenticated to access gmail" });
        await client.markUnread(id);
        res.status(200).json({ ok: true });

    } catch (err) {
        console.error("Error marking thread as unread:", err);
        res.status(500).json({ error: "Error marking thread as unread" });
    }
}

/**
 * Reply to thread
 */
export async function reply(req, res) {
    try {
        const {id} = req.params;
        const {body} = req.body;
        if (!id) {
            return res.status(400).json({ error: "Missing required field id" });
        }
        if (!body) {
            return res.status(400).json({ error: "Missing required field body" });
        }
        const {client, authenticated} = await getEmailClient();
        if (!authenticated) return res.status(401).json({ error: "Not authenticated to access gmail" });
        await client.reply(id, body);
        res.status(200).json({ ok: true });

    } catch (err) {
        console.error("Error replying to thread:", err);
        res.status(500).json({ error: "Error replying to thread" });
    }
}

/**
 * Gmail is not authenticated. Get submissions from database instead
 */
export async function getSavedThreads(req, res) {
    try {
        const submissions = await getSubmissions();
        const threads = submissions.map((s => {
            const d = new Date(s.submitted_at);
            const correctDate = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());
            return {
                id: `${s.id}`,
                messages: [
                    {
                        id: `${s.id}`,
                        threadId: `${s.id}`,
                        isUnread: !s.is_read,
                        snippet: s.message,
                        body: s.message,
                        date: correctDate,
                        subject: "",
                        fromName: s.name,
                        fromEmail: s.email,
                        fromSelf: false,
                        isPreview: false,
                        isGmail: false
                    }
                ],
                isUnread: !s.is_read,
                date: correctDate,
                snippet: s.message,
                people: [s.name],
                isPreview: false,
                isGmail:false
            };
        }));

        res.json({
            threads,
            nextPageToken: undefined
        });

    } catch (err) {
        console.error("Error getting saved threads:", err);
        res.status(500).json({ error: "Error getting saved threads" });
    }
}