# 🌟 Lumina Backend – Mood Journal App

This is the backend for **Lumina**, a mood journaling app built with **Node.js**, **TypeScript**, **Express**, and **MongoDB**. It supports:

- 🔐 Email & Google authentication
- 📥 Mood tracking
<!-- - 📦 AWS S3 file uploads  -->
- 🔔 Expo push notifications
- 🧰 Utility helpers

---

## ⚙️ Tech Stack

- **Node.js** + **Express**
- **TypeScript**
- **MongoDB** + **Mongoose**
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Google Sign-In** for google authentication
<!-- - **AWS SDK (S3)** -->
- **Expo Push Notifications**

---

## 📁 Project Structure

```
lumina-backend/
├── src/
│   ├── config/             # Cors Options and DB connect
│   ├── controllers/        # Route logic
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express routers
│   ├── middlewares/        # Auth, error handling
│   ├── utils/              # Helper functions (email, S3, tokens, notifications)
│   └── server.ts           # App entry point
├── test/
│   ├── auth/               # Test for authentication (login, register and verify email)
│   └── mocks/              # Mock Test for utils (Expo-sdk setup, Send notification and email )
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🛠️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/yommexg/lumina-daily-mood-backend.git
cd lumina-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env` file in the root:

---

## 🧪 Sample `.env`

```env
PORT=5000

DATABASE_URI=mongodb+srv://username:password@cluster0.mongodb.net/dbname?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here

EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password_here

PRO_FRONTEND_URL=https://your-production-frontend.com
DEV_FRONTEND_URL=http://localhost:3000

GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
EXPO_ACCESS_TOKEN=your-expo-access-token
```

## 🚀 Start the App

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

---

## 🔐 Auth Routes

### ➕ `POST /api/auth/register`

Register with email/password:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123",
  "expoPushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

Register with Google:

```json
{
  "name": "Jane Doe",
  "email": "jane@gmail.com",
  "googleId": "1234567890",
  "expoPushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "avatar": "https://lh3.googleusercontent.com/a-/AOh14Ggxxxxxxxxxxxxxxxxxxxxxx"
}
```

---

### 🔑 `POST /api/auth/login`

Login with email/password:

```json
{
  "email": "jane@example.com",
  "password": "password123",
  "expoPushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

Login with Google:

```json
{
  "tokenId": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjY4NzEyMzQ1NiIsInR5cCI6IkpXVCJ9.eyJhenAiOiJleGFtcGxlLWFwcC5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiJleGFtcGxlLWF1ZGllbmNlIiwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwiaXNzIjoihttps://accounts.google.com\",\"exp\":9999999999}",
  "expoPushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

---

## 📥 Mood Routes

### ➕ `POST /api/moods/`

Create a mood log.

```json
{
  "userId": "abc123",
  "mood": "happy",
  "note": "Great morning",
  "triggers": ["music", "sunlight"]
}
```

### 📤 `GET /api/moods/:userId`

Get all moods for a user.

---

## 📦 File Uploads – AWS S3

### `POST /api/upload`

Upload media files (images, videos) to **AWS S3** using `multipart/form-data`.

- Returns a public S3 URL after successful upload.

---

## 🔔 Push Notifications – Expo

### `POST /api/notifications/send`

Send push notifications via Expo:

```json
{
  "to": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "title": "Reminder",
  "body": "Log your mood today!"
}
```

---

## 🧰 Utilities

Located in `src/utils/`, includes:

- `/email/*` – Send Emails to Users using Nodemailer
- `capitalizeLetter` – Capitalize any letter (e.g Capitalize first letter)
- `generateToken` – Generate Tokens (e.g Verification Tokens)
- `pushNotification` – Send Expo notification to the mobile app
- `regex` – Test validity of Requests (e.g. Email and Password Validity)
- `uploadToS3(file)` – Upload file to AWS S3

---

## 📄 Scripts

| Command         | Description                    |
| --------------- | ------------------------------ |
| `npm run dev`   | Start dev server (ts-node-dev) |
| `npm run build` | Compile TypeScript             |
| `npm start`     | Start from compiled JS         |

---

## 🚀 Deployment

Ready for deployment on:

- Render
- Railway
- AWS Elastic Beanstalk
- Heroku
- Vercel (via serverless functions)

---

## 🧑‍💻 Author

Made with ❤️ by Boluwatife Yomi-Olugbodi

---

## 📜 License

MIT
