const { google } = require('googleapis');

async function listStarredMessages(auth) {
    const gmail = google.gmail({ version: 'v1', auth });
    const res = await gmail.users.messages.list({
        userId: 'me',
        q: 'is:starred',
    });
    const messages = res.data.messages || [];
    return messages;
}

async function getMessageDetails(auth, messageId) {
    const gmail = google.gmail({ version: 'v1', auth });
    const res = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
    });

    const payload = res.data.payload;
    const headers = payload.headers;
    const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
    const from = headers.find(h => h.name === 'From')?.value || 'Unknown sender';
    const date = headers.find(h => h.name === 'Date')?.value || 'Unknown date';

    let body = '';
    if (payload.parts) {
        const textPart = payload.parts.find(p => p.mimeType === 'text/plain');
        if (textPart && textPart.body.data) {
            body = Buffer.from(textPart.body.data, 'base64').toString();
        }
    } else if (payload.body.data) {
        body = Buffer.from(payload.body.data, 'base64').toString();
    }

    return {
        id: messageId,
        subject,
        from,
        date,
        body,
    };
}

module.exports = {
    listStarredMessages,
    getMessageDetails,
};
