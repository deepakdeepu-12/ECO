# EcoSync – Smart Waste Management App

A full-stack, AI-powered smart waste management web application that helps users classify waste, locate recycling bins, track environmental impact, earn rewards, and engage with their community.

---

## Table of Contents

- [Features](#features)
- [📱 App Downloads](#-app-downloads)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the App](#running-the-app)
- [API Overview](#api-overview)
- [Deployment](#deployment)
- [License](#license)

---

## Features

| Feature | Description |
|---|---|
| **AI Waste Scanner** | Upload or capture a photo of waste; Google Gemini AI classifies it and provides disposal instructions |
| **Smart Bin Locator** | Interactive Leaflet map showing nearby recycling and waste bins |
| **Recycling Rewards** | Points and badge system that rewards responsible waste disposal |
| **Impact Dashboard** | Charts and metrics showing personal/community environmental impact |
| **Community Challenges** | Join or create recycling and clean-up challenges |
| **Illegal Dump Reporting** | Report illegal dumping sites with location and photo evidence |
| **User Authentication** | Secure sign-up / sign-in with JWT and email OTP verification |
| **Notifications** | Configurable alerts for reminders, badges, challenges, and weekly summaries |
| **Profile Dashboard** | Personal stats, achievements, and account management |
| **Help & Support** | In-app FAQ and support ticket submission |
| **Privacy & Security** | Account privacy controls and security settings |

---

## 📱 App Downloads

EcoSync supports **native Android app downloads** (APK) in addition to the web version!

### 🚀 For Users

The app can be installed directly on Android devices:
- Click "Install App" on the landing page
- Download and install the APK
- Works offline with full native app experience

### 🛠️ For Developers

To enable APK downloads for your users:

1. **Build the Android APK**
   ```bash
   ./build-apk.bat  # Windows
   # OR
   npm run build && npx cap add android && npx cap open android
   ```

2. **Host it online** (GitHub Releases, S3, Google Drive, etc.)

3. **Configure the download URL** in `src/lib/download.ts`:
   ```typescript
   const APK_DOWNLOAD_URL = 'https://your-url.com/EcoSync-v2.1.0.apk';
   ```

4. **Redeploy** your web app

**📖 Detailed Guides:**
- **Quick Start:** [ENABLE_APP_DOWNLOADS.md](ENABLE_APP_DOWNLOADS.md)
- **Complete Guide:** [APK_BUILD_GUIDE.md](APK_BUILD_GUIDE.md)
- **Build Script:** `build-apk.bat` (Windows automated builder)

### ✨ Features

- ✅ Auto device detection (Android/iOS/Desktop)
- ✅ Smart download button (APK for Android, PWA for others)
- ✅ Download counter & statistics
- ✅ Offline support via Progressive Web App
- ✅ Platform-specific installation instructions

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 19 + TypeScript | UI framework |
| Vite 7 | Build tool & dev server |
| Tailwind CSS 4 | Utility-first styling |
| Framer Motion | Animations & transitions |
| React Router DOM 7 | Client-side routing |
| Recharts | Data visualisation charts |
| Leaflet | Interactive maps |
| Lucide React | Icon library |

### Backend

| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB Atlas + Mongoose | Database & ODM |
| Google Gemini AI (`@google/generative-ai`) | AI waste classification |
| JSON Web Tokens (jsonwebtoken) | Authentication |
| bcryptjs | Password hashing |
| Nodemailer | Email OTP delivery |

---

## Project Structure

```
smart-waste-management-app/
├── index.html
├── package.json          # Frontend dependencies
├── tsconfig.json
├── vite.config.ts
├── capacitor.config.ts   # Mobile app configuration
├── start.bat             # One-click launcher (Windows)
├── build-apk.bat         # APK builder script (Windows)
├── .env                  # Frontend environment variables
├── README.md             # This file
├── ENABLE_APP_DOWNLOADS.md   # Quick guide to enable APK downloads
├── APK_BUILD_GUIDE.md    # Complete APK build & distribution guide
│
├── src/
│   ├── main.tsx
│   ├── App.tsx           # Root component & page routing
│   ├── index.css
│   ├── components/       # Feature modal components
│   │   ├── WasteScanner.tsx
│   │   ├── SmartBinLocator.tsx
│   │   ├── RecyclingRewards.tsx
│   │   ├── ImpactDashboard.tsx
│   │   ├── CommunityChallenges.tsx
│   │   ├── IllegalDumpReporting.tsx
│   │   ├── ProfileDashboard.tsx
│   │   ├── NotificationsModal.tsx
│   │   ├── HelpSupportModal.tsx
│   │   ├── PrivacySecurityModal.tsx
│   │   └── VideoModal.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── SignIn.tsx
│   │   └── SignUp.tsx
│   ├── lib/
│   │   ├── auth.ts       # Auth helpers
│   │   └── download.ts   # App download logic
│   └── utils/
│       └── cn.ts         # Tailwind class merging utility
│
└── backend/
    ├── server.js         # Express app entry point
    ├── package.json      # Backend dependencies
    ├── models/
    │   └── User.js       # Mongoose User model
    ├── routes/
    │   └── authRoutes.js # Auth & feature API routes
    └── middleware/
        └── authMiddleware.js  # JWT protection middleware
```

---

## Getting Started

### Prerequisites

- **Node.js** v18 or later
- **npm** v9 or later
- A **MongoDB Atlas** cluster (free tier works)
- A **Google Gemini API** key ([get one here](https://aistudio.google.com/app/apikey))
- A **Gmail account** with an [App Password](https://myaccount.google.com/apppasswords) for OTP emails

---

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd smart-waste-management-app
   ```

2. **Install frontend dependencies**

   ```bash
   npm install
   ```

3. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   cd ..
   ```

---

### Environment Variables

**Frontend** – create `.env` in the project root:

```env
VITE_API_URL=https://your-backend-url.com
```

**Backend** – create `.env` inside the `backend/` folder:

```env
PORT=3001
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/ecosync
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_16_char_gmail_app_password
```

---

### Running the App

#### Option A – One-click launcher (Windows)

Double-click `start.bat`. It will automatically install any missing dependencies, then launch both the backend and frontend servers.

#### Option B – Manual

Open two terminals:

**Terminal 1 – Backend**
```bash
cd backend
npm start
```
The API will be available at `http://localhost:3001`.

**Terminal 2 – Frontend**
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

---

## API Overview

All API routes are prefixed with `/api`.

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Register a new user | No |
| `POST` | `/api/auth/signin` | Sign in and receive JWT | No |
| `POST` | `/api/auth/verify-otp` | Verify email OTP | No |
| `GET` | `/api/auth/profile` | Get current user profile | Yes |
| `PUT` | `/api/auth/profile` | Update profile | Yes |
| `POST` | `/api/scan` | AI waste classification | Yes |
| `GET` | `/api/notifications/prefs` | Get notification preferences | Yes |
| `PUT` | `/api/notifications/prefs` | Update notification preferences | Yes |
| `POST` | `/api/support/ticket` | Submit a support ticket | No |
| `GET` | `/api/support/faqs` | Fetch FAQ list | No |

> Protected routes require the `Authorization: Bearer <token>` header.

---

## Deployment

The backend is deployed on **Render**: `https://eco-h6c4.onrender.com`

The frontend can be built for production with:

```bash
npm run build
```

The output in `dist/` can be deployed to any static hosting service (Vercel, Netlify, GitHub Pages, etc.). Set the `VITE_API_URL` environment variable on your hosting platform to point to your deployed backend.

---

## License

This project is licensed under the **MIT License** – see [LICENSE](LICENSE) for details.
