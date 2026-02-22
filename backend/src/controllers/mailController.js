import { pool } from "../db/connect_db.js";
import { google } from "googleapis";

async function getContactEmail() {
    const [rows] = await pool.query(`
        SELECT contact_email
        FROM contact_info
        LIMIT 1
    `);
    return rows[0].contact_email;
}

async function getTokens(email) {
    const [rows] = await pool.query(
        `SELECT * FROM gmail_accounts WHERE email = ?`,
        [email]
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

async function saveTokens(email, tokens) {
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
            email,
            access_token,
            refresh_token,
            scope,
            token_type,
            expiry_date,
        ]
    );
}

async function getGmailClient(email=undefined) {
    if (email === undefined) email = await getContactEmail();
    const tokens = await getTokens(email);
    if (!tokens) throw new Error(`Email ${email} does not have authentication tokens stored in db`);

    const oauth2Client = new google.auth.OAuth2({
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        redirectUri: process.env.REDIRECT_URI
    });
    oauth2Client.setCredentials(tokens);

    oauth2Client.on("tokens", async (newTokens) => {
        await saveTokens(email, {
            ...tokens,
            ...newTokens,
        });
    });

    return google.gmail({
        version: "v1",
        auth: oauth2Client,
    });
}



/**
 * Get whether the contact email is authenticated to access inbox
 * Frontend calls to see if it should show authenticate screen or can get messages
 */
export async function getState(req, res) {
    try {
        const email = await getContactEmail();
        const tokens = await getTokens(email);
        if (tokens == null) {
            res.json({
                authenticated: false,
                email: email
            });
        } else {
            try {
                const gmail = await getGmailClient(email);
                res.json({
                    authenticated: true,
                    email: email
                });
            } catch (err) {
                res.json({
                    authenticated: false,
                    email: email
                });
            }
        }

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
        const email = profile.data.emailAddress;

        await saveTokens(email, tokens);

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
        console.error("Erorr completing oauth:", err);
        res.status(500).json({
            error: "Error completing oauth"
        });
    }
};