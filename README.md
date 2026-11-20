# Date-Reminder

A modern, intelligent full-stack SaaS reminder application designed to track birthdays, anniversaries, bill deadlines, and cultural observances with automated alerts and cross-platform synchronization.

## Features

- **Personal Date Reminders**: Custom reminder creation with countdown timers, priority tags, and recurrence scheduling.
- **Global Events Catalog**: Curated directory of international celebrations, national holidays, and observances across 9 categories.
- **Interactive Calendar**: Unified chronological schedule offering Month, 7-Day Week, Day, and Year views with distinct color-coded indicators.
- **Modern SaaS UI**: Built with React 19, Tailwind CSS v4, custom floating dropdown menus, and responsive mobile-first navigation.
- **Secure Authentication**: Firebase Authentication (Google SSO + Email/Password) integrated with server-side Firebase Admin SDK verification.
- **Cloud Database Sync**: Real-time cloud persistence powered by MongoDB Atlas.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons, React Router DOM
- **Backend**: Node.js, Express, MongoDB Atlas (Mongoose), Firebase Admin SDK
- **Authentication**: Firebase Authentication (Web Client & Admin SDK)

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB Atlas cluster
- Firebase Project credentials

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/IndrajitOD/Date-Reminder.git
   cd Date-Reminder
   ```

2. **Install Client Dependencies**:
   ```bash
   cd client
   npm install
   ```

3. **Install Server Dependencies**:
   ```bash
   cd ../server
   npm install
   ```

4. **Environment Setup**:
   - Create `.env` in `client/` following `client/.env.example`
   - Create `.env` in `server/` following `server/.env.example`

5. **Run Locally**:
   - Start backend: `npm run dev` in `server/`
   - Start frontend: `npm run dev` in `client/`
