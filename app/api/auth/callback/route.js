import { NextResponse } from 'next/server';
import { getTokenFromCode } from '@/lib/google';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    try {
        await getTokenFromCode(code);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Callback Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
