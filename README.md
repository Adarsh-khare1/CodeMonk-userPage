# Coding Practice Platform

A full-stack LeetCode-style coding platform with AI feedback, analytics, and social features.

## Features

- 🎯 **Coding Problems**: Solve problems with various difficulty levels
- 🤖 **AI Feedback**: Get AI-powered feedback on your submissions
- 📊 **Analytics**: Track your progress with activity heatmaps, streaks, and charts
- 💬 **Social**: Comment and discuss problems with other users
- 🌐 **Cross-Platform Stats**: Track stats from LeetCode, Codeforces, and CodeChef
- 🔐 **Authentication**: Secure JWT-based authentication

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Recharts
- Lucide React Icons

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- OpenAI API

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- OpenAI API key (optional, for AI feedback)

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_random
OPENAI_API_KEY=your_openai_api_key_here
```

4. Seed the database with sample problems:
```bash
npm run seed
```

5. Start the server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the `client` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Usage

1. Open `http://localhost:3000` in your browser
2. Sign up for a new account or login
3. Browse problems on the dashboard
4. Click on a problem to view details and submit solutions
5. View your analytics and progress on the Analytics page
6. Update your external platform stats (LeetCode, Codeforces, CodeChef)

## Project Structure

```
├── client/                 # Next.js frontend
│   ├── app/               # App router pages
│   ├── components/        # React components
│   ├── lib/               # Utilities and API client
│   └── ...
├── server/                # Express backend
│   ├── controllers/       # Route controllers
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── services/          # Business logic (AI, Judge)
│   ├── middleware/        # Auth middleware
│   └── scripts/           # Seed scripts
└── README.md
```

## API Endpoints

### Auth
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login

### Problems
- `GET /api/problems` - Get all problems
- `GET /api/problems/:id` - Get problem by ID

### Submissions
- `POST /api/submissions` - Submit solution (protected)
- `GET /api/submissions` - Get user submissions (protected)

### Comments
- `GET /api/comments?problemId=:id` - Get comments for problem
- `POST /api/comments` - Create comment (protected)

### Users
- `GET /api/users/profile` - Get user profile (protected)
- `GET /api/users/analytics` - Get analytics (protected)
- `POST /api/users/external-stats` - Update external stats (protected)

## Notes

- The judge service is currently a mock implementation. In production, integrate with a real code execution service.
- AI feedback requires an OpenAI API key. The service will gracefully degrade if the key is not provided.
- The activity heatmap displays the last 365 days of activity.
- Streaks are calculated based on consecutive days with at least one accepted submission.

## License

MIT
