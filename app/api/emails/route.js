import { NextResponse } from 'next/server';
import { authorize } from '@/lib/google';
import { listStarredMessages, getMessageDetails } from '@/lib/gmail';
import fs from 'fs';
import path from 'path';

export async function GET() {
    const hasEnv = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;
    const credentialsPath = path.join(process.cwd(), 'credentials.json');

    if (!hasEnv && !fs.existsSync(credentialsPath)) {
        return NextResponse.json({
            error: 'Google credentials missing. Please set environment variables or add credentials.json.'
        }, { status: 500 });
    }

    try {
        const auth = await authorize();
        const messages = await listStarredMessages(auth);

        const emailDetails = await Promise.all(
            messages.slice(0, 10).map(msg => getMessageDetails(auth, msg.id))
        );

        return NextResponse.json({ emails: emailDetails });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
