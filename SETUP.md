# Quick Setup Guide

## Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in the `server` directory with:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_random
OPENAI_API_KEY=your_openai_api_key_here
```

4. Seed the database:
```bash
npm run seed
```

5. Start the server:
```bash
npm run dev
```

## Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file in the `client` directory with:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

## Access

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Notes

- Make sure MongoDB is running before starting the backend
- OpenAI API key is optional (AI feedback will be disabled if not provided)
- JWT_SECRET should be a long random string for security
