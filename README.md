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

