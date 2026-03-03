import { pool } from "../db/connect_db.js";
import { google } from "googleapis";
import Gmail from "../services/gmailService.js";

/**
 * Get whether the contact email is authenticated to access inbox
 * Frontend calls to see if it should show authenticate screen or can get messages
 */
export async function getState(req, res) {
    try {
        const gmail = await Gmail.create({auth: false});
        const {authenticated, registered} = await gmail.checkAuth();
        res.json({
            authenticated,
            registered,
            email: gmail.email
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
        const wrapper = new Gmail(profile.data.emailAddress);
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
        const count = Math.min(req.query.count || 20, 40);
        const gmail = await Gmail.create();
        const {threads} = await gmail.fetchThreads({maxResults: count});
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
        const {id} = req.body;
        if (!id) {
            return res.status(400).json({ error: "Missing required field id" });
        }
        const gmail = await Gmail.create();
        const thread = await gmail.fetchThread(id);
        res.json(thread);

    } catch (err) {
        console.error("Error getting thread:", err);
        res.status(500).json({ error: "Error getting thread"} );
    }
}