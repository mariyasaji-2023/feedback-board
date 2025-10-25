# Feedback Board - Backend

Node.js + Express + MongoDB backend for the Developer Feedback Board.

## Installation
```bash
npm install
```

## Environment Variables

Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/feedback-board
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

## Run

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

## API Endpoints

- POST /api/auth/register - Register
- POST /api/auth/login - Login
- GET /api/feedbacks - Get all feedbacks
- POST /api/feedbacks - Create feedback
- POST /api/feedbacks/:id/vote - Vote
- PUT /api/feedbacks/:id - Update status
- GET /api/feedbacks/user/votes - Get user votes