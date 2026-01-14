import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/google';

export async function GET() {
    try {
        const url = await getAuthUrl();
        return NextResponse.redirect(url);
    } catch (error) {
        console.error('Auth Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
