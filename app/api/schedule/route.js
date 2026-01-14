import { NextResponse } from 'next/server';
import { authorize } from '@/lib/google';
import { getMessageDetails } from '@/lib/gmail';
import { createCalendarEvent } from '@/lib/calendar';
import { extractEventDetails } from '@/lib/parser';

export async function POST(request) {
    try {
        const { emailId } = await request.json();
        const auth = await authorize();

        // 1. Get full email details
        const email = await getMessageDetails(auth, emailId);

        // 2. Parse details using AI logic (regex-based for now)
        const eventDetails = extractEventDetails(email);

        // 3. Create Google Calendar event
        const event = await createCalendarEvent(auth, eventDetails);

        return NextResponse.json({
            success: true,
            event,
            details: eventDetails
        });
    } catch (error) {
        console.error('Schedule API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
