# Complete Setup Guide

## Backend Setup

### 1. Navigate to server directory:
```bash
cd server
```

### 2. Install dependencies:
```bash
npm install
```

### 3. Configure Judge0 API

You have three options for Judge0 API:

#### Option 1: Judge0 Cloud (Recommended for Development)
1. Go to [Judge0.com](https://judge0.com)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add to `.env`:
   ```
   JUDGE0_API_URL=https://api.judge0.com
   JUDGE0_API_KEY=your_api_key_here
   ```

#### Option 2: Judge0 via RapidAPI
1. Go to [RapidAPI Judge0](https://rapidapi.com/judge0-official/api/judge0-ce)
2. Subscribe to the API
3. Get your RapidAPI key
4. Add to `.env`:
   ```
   JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
   JUDGE0_RAPIDAPI_KEY=your_rapidapi_key_here
   JUDGE0_RAPIDAPI_HOST=judge0-ce.p.rapidapi.com
   ```

#### Option 3: Self-hosted Judge0 (Advanced - Using Docker Compose)
1. **Prerequisites**: Ensure Docker and Docker Compose are installed
2. **Start Judge0 services**:
   ```bash
   docker compose -f docker-compose.judge0.yml up -d
   ```
   This will start:
   - Judge0 server (port 2358)
   - Judge0 worker
   - PostgreSQL database
   - Redis cache
3. **Verify Judge0 is running**:
   ```bash
   curl http://localhost:2358/health
   ```
   Should return: `{"status":"OK"}`
4. **Configure your backend** - Add to `server/.env`:
   ```
   JUDGE0_API_URL=http://localhost:2358
   ```
   (No API key needed for self-hosted)
5. **Stop Judge0** (when needed):
   ```bash
   docker compose -f docker-compose.judge0.yml down
   ```
6. **View logs**:
   ```bash
   docker compose -f docker-compose.judge0.yml logs -f
   ```

### 4. Create `.env` file in the `server` directory:

Copy from `.env.example` and fill in your values:
```bash
cp .env.example .env
```

Required environment variables:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_random
OPENAI_API_KEY=your_openai_api_key_here (optional)

# Judge0 Configuration (choose one option above)
JUDGE0_API_URL=https://api.judge0.com
JUDGE0_API_KEY=your_judge0_api_key_here
```

### 5. Seed the database:
```bash
npm run seed
```

### 6. Start the server:
```bash
npm run dev
```

## Frontend Setup

### 1. Navigate to client directory:
```bash
cd client
```

### 2. Install dependencies:
```bash
npm install
```

### 3. Create `.env.local` file in the `client` directory:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Start the development server:
```bash
npm run dev
```

## Access

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## Features

### Code Execution
- **Run Code**: Test your code against sample test cases (doesn't save to database)
- **Submit Code**: Submit solution against all test cases (saves to database)
- **Supported Languages**: JavaScript, Python, C, C++, Java
- **Timeout**: 5 seconds per test case

### Judge0 Integration
- Safe code execution via Judge0 API
- Automatic result polling
- Detailed error reporting (Compilation Error, Runtime Error, Time Limit Exceeded)
- Execution time and memory usage tracking

## Troubleshooting

### Judge0 API Issues

1. **"Failed to submit code" error**:
   - Check your `JUDGE0_API_KEY` is correct
   - Verify `JUDGE0_API_URL` is correct
   - For cloud: Ensure you have remaining API quota
   - For self-hosted: Ensure Judge0 service is running

2. **"Submission timeout" error**:
   - Check your internet connection
   - Verify Judge0 API is accessible
   - For self-hosted: Check Judge0 service logs

3. **"Unsupported language" error**:
   - Ensure language name matches: `javascript`, `python`, `c`, `cpp`, or `java`
   - Check language is supported by your Judge0 instance

4. **Docker Compose errors**:
   - **"Image judge0/judge0-ce not found"**: The correct image name is `judge0/judge0` (not `judge0/judge0-ce`). Use the provided `docker-compose.judge0.yml` file.
   - **"Pull access denied"**: Ensure you're using the correct image name `judge0/judge0:latest`
   - **Port already in use**: If port 2358 is already in use, change it in `docker-compose.judge0.yml`
   - **Permission errors**: On Linux, you may need to run with `sudo` or add your user to the docker group

### Database Issues

1. **MongoDB connection error**:
   - Verify `MONGODB_URI` is correct
   - Ensure MongoDB is running (for local) or accessible (for cloud)
   - Check network connectivity

### Code Execution Issues

1. **Code not executing**:
   - Check backend logs for errors
   - Verify Judge0 API is configured correctly
   - Test with a simple "Hello World" program

2. **Wrong results**:
   - Ensure test cases are properly formatted
   - Check input/output format matches expected format
   - Verify code handles edge cases

## Testing the Setup

### Test Run Code (Sample Tests)
1. Go to any problem page
2. Write code in the editor
3. Click "Run Code"
4. Should see results for sample test cases

### Test Submit Code (Full Tests)
1. Go to any problem page
2. Write code in the editor
3. Click "Submit"
4. Should see results for all test cases (public + hidden)
5. Submission should be saved to database

## Notes

- **Judge0 Free Tier**: Limited requests per day. Consider upgrading for production.
- **Self-hosted Judge0**: Requires Docker and more setup, but unlimited usage.
- **MongoDB**: Can use MongoDB Atlas (cloud) or local MongoDB.
- **JWT_SECRET**: Should be a long random string for security (minimum 32 characters).
- **OPENAI_API_KEY**: Optional - only needed if using AI features.

## Production Deployment

### Environment Variables
- Use secure environment variable management (e.g., AWS Secrets Manager, Azure Key Vault)
- Never commit `.env` files to version control
- Use different Judge0 API keys for production vs development

### Judge0 Production Setup
- Consider self-hosting Judge0 for production to avoid rate limits
- Or upgrade to Judge0 paid plan for higher limits
- Monitor API usage and costs

### Security
- Use strong JWT_SECRET
- Enable CORS properly for production domain
- Use HTTPS in production
- Rate limit API endpoints
- Validate and sanitize all inputs

## Support

For issues with:
- **Judge0 API**: Check [Judge0 Documentation](https://judge0.com/docs)
- **This Codebase**: Check backend logs and error messages
- **MongoDB**: Check MongoDB connection and database logs
