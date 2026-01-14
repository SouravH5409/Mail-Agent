import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST() {
    const tokenPath = path.join(process.cwd(), 'token.json');

    try {
        if (fs.existsSync(tokenPath)) {
            fs.unlinkSync(tokenPath);
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
    }
}
