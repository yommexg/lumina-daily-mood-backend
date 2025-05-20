# 🌟 Lumina Backend – Mood Journal App

This is the backend for **Lumina**, a mood journaling app built with **Node.js**, **TypeScript**, **Express**, and **MongoDB**. It supports:

- 🔐 Email & Google authentication
- 📥 Mood tracking
- 📦 AWS S3 file uploads
- 🔔 Expo push notifications
- 🧰 Utility helpers

---

## ⚙️ Tech Stack

- **Node.js** + **Express**
- **TypeScript**
- **MongoDB** + **Mongoose**
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Google Sign-In**
- **AWS SDK (S3)**
- **Expo Push Notifications**

---

## 📁 Project Structure

```
lumina-backend/
├── src/
│   ├── config/             # DB & AWS setup
│   ├── controllers/        # Route logic
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express routers
│   ├── middlewares/        # Auth, error handling
│   ├── utils/              # Helper functions (email, S3, tokens, notifications)
│   ├── services/           # Push notifications & Google auth logic
│   └── server.ts            # App entry point
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

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/
JWT_SECRET=your_jwt_secret

AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=your_region
S3_BUCKET_NAME=lumina-media

EXPO_ACCESS_TOKEN=your_expo_access_token
GOOGLE_CLIENT_ID=your_google_client_id
```

---

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
  "password": "password123"
}
```

Register with Google:

```json
{
  "name": "Jane Doe",
  "email": "jane@gmail.com",
  "googleId": "1234567890"
}
```

---

### 🔑 `POST /api/auth/login`

```json
{
  "email": "jane@example.com",
  "password": "password123"
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

- `uploadToS3(file)` – Upload file to AWS S3
- `sendPushNotification(token, title, body)` – Send Expo notification
- `generateJWT(user)` – Sign JWT token
- `hashPassword(password)` – Secure password hash
- `verifyGoogleToken(idToken)` – Google sign-in verification

---

## 📄 Scripts

| Command         | Description                    |
| --------------- | ------------------------------ |
| `npm run dev`   | Start dev server (ts-node-dev) |
| `npm run build` | Compile TypeScript             |
| `npm start`     | Start from compiled JS         |

---

## 🧪 Sample `.env`

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/lumina
JWT_SECRET=supersecretjwt

AWS_ACCESS_KEY_ID=ABC123XYZ
AWS_SECRET_ACCESS_KEY=ABC123XYZSECRET
AWS_REGION=us-east-1
S3_BUCKET_NAME=lumina-media

EXPO_ACCESS_TOKEN=your_expo_access_token
GOOGLE_CLIENT_ID=your_google_client_id
```

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
