const { google } = require('googleapis');
const path = require('path');
const fs = require('fs').promises;

const SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/calendar.events',
];

const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// Memory cache for tokens (for Vercel execution context)
let memoryToken = null;

async function getCredentials() {
    // 1. Try environment variables (Vercel)
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        return {
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.NEXT_PUBLIC_BASE_URL + '/api/auth/callback'
        };
    }

    // 2. Fallback to local file (Local Dev)
    try {
        const content = await fs.readFile(CREDENTIALS_PATH);
        const keys = JSON.parse(content);
        const config = keys.installed || keys.web;
        return {
            client_id: config.client_id,
            client_secret: config.client_secret,
            redirect_uri: config.redirect_uris[0]
        };
    } catch (err) {
        throw new Error('Google Credentials not found. Set GOOGLE_CLIENT_ID/SECRET env vars or add credentials.json');
    }
}

async function loadSavedCredentialsIfExist() {
    try {
        let credentials;

        // 1. Try memory cache (hot lambda)
        if (memoryToken) {
            credentials = memoryToken;
        }
        // 2. Try file system (Local Dev)
        else {
            const content = await fs.readFile(TOKEN_PATH);
            credentials = JSON.parse(content);
        }

        const creds = await getCredentials();
        const oAuth2Client = new google.auth.OAuth2(
            creds.client_id,
            creds.client_secret,
            creds.redirect_uri
        );
        oAuth2Client.setCredentials(credentials);
        return oAuth2Client;
    } catch (err) {
        return null;
    }
}

async function saveCredentials(tokens) {
    const creds = await getCredentials();
    const payload = {
        type: 'authorized_user',
        client_id: creds.client_id,
        client_secret: creds.client_secret,
        refresh_token: tokens.refresh_token,
        access_token: tokens.access_token,
    };

    // Update memory cache
    memoryToken = payload;

    // Try to save to file for local dev (will fail silently on Vercel)
    try {
        await fs.writeFile(TOKEN_PATH, JSON.stringify(payload));
    } catch (e) {
        console.warn('Could not save token to file system (expected on Vercel)');
    }
}

async function getAuthUrl() {
    const creds = await getCredentials();
    const oAuth2Client = new google.auth.OAuth2(
        creds.client_id,
        creds.client_secret,
        creds.redirect_uri
    );

    return oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent',
    });
}

async function getTokenFromCode(code) {
    const creds = await getCredentials();
    const oAuth2Client = new google.auth.OAuth2(
        creds.client_id,
        creds.client_secret,
        creds.redirect_uri
    );

    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    await saveCredentials(tokens);

    return oAuth2Client;
}

async function authorize() {
    const client = await loadSavedCredentialsIfExist();
    if (client) {
        return client;
    }
    throw new Error('NOT_AUTHENTICATED');
}

module.exports = {
    authorize,
    saveCredentials,
    getAuthUrl,
    getTokenFromCode,
};
