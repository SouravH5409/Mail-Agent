const { google } = require('googleapis');

async function createCalendarEvent(auth, eventDetails) {
    const calendar = google.calendar({ version: 'v3', auth });

    const timezone = 'Asia/Kolkata'; // Default for the user
    const event = {
        summary: eventDetails.summary,
        location: eventDetails.location || '',
        description: eventDetails.description || '',
        start: {
            dateTime: eventDetails.startDateTime.replace('Z', ''), // Remove Z to respect timezone
            timeZone: timezone,
        },
        end: {
            dateTime: eventDetails.endDateTime.replace('Z', ''), // Remove Z to respect timezone
            timeZone: timezone,
        },
        reminders: {
            useDefault: false,
            overrides: [
                { method: 'email', minutes: 24 * 60 },
                { method: 'popup', minutes: 10 },
            ],
        },
    };

    console.log('Sending event to Google Calendar:', JSON.stringify(event, null, 2));

    try {
        const res = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
        });
        console.log('Event created successfully, ID:', res.data.id);
        return res.data;
    } catch (error) {
        console.error('Error creating calendar event:', error);
        throw error;
    }
}

module.exports = {
    createCalendarEvent,
};
