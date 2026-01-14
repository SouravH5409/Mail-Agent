# Mail Agent AI 📧 📅

An intelligent mail agent that scans your starred emails for placement drives and interviews, extracts date/time details, and automatically schedules them in your Google Calendar.

## ✨ Features
- **Gmail Integration**: Scans only starred emails for focused task extraction.
- **Smart Analysis**: Extracts interview and placement details from email bodies.
- **Auto-Scheduling**: One-click event creation in Google Calendar.
- **Premium UI**: Modern dark-mode interface with glassmorphism effects.

## 🚀 Setup Instructions

### 1. Google Cloud Project Setup
To use this app, you need to enable Gmail and Calendar APIs:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project.
3. Enable **Gmail API** and **Google Calendar API**.
4. Configure the **OAuth Consent Screen** (Internal or External).
5. Go to **Credentials** -> **Create Credentials** -> **OAuth Client ID**.
6. Select **Web Application** (or Desktop app).
7. Download the JSON file and rename it to `credentials.json`.
8. Place `credentials.json` in the root folder of this project.

### 2. Installation
```bash
npm install
```

### 3. Run the App
```bash
npm run dev
```

## ☁️ Vercel Deployment Instructions

### 1. Environment Variables
In your Vercel project settings, add the following environment variables:
- `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID.
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret.
- `NEXT_PUBLIC_BASE_URL`: Your production URL (e.g., `https://your-app.vercel.app`).

### 2. Google Cloud Console Configuration
Update your OAuth client settings:
1.  Add `https://your-app.vercel.app` to **Authorized JavaScript Origins**.
2.  Add `https://your-app.vercel.app/api/auth/callback` to **Authorized Redirect URIs**.

### 3. Note on Token Persistence
Vercel's serverless environment is stateless. For persistent login, it's recommended to integrate a database (like Vercel KV or MongoDB) to store the `token.json` content. The current code includes a memory cache for the current session, but a database is needed for long-term production use.
