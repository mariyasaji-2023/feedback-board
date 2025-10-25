# Developer Feedback Board

A full-stack web application where users can post, view, and vote on feedback/feature requests.

## 🚀 Features

- User authentication (Register/Login)
- Create feedback with title and description
- Vote on feedback (toggle vote)
- Filter feedback by status (Planned, In Progress, Completed, Rejected)
- Responsive design

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite
- React Router DOM
- Axios
- CSS3

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## 🔧 Installation

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd feedback-board
```

### 2. Backend Setup
```bash
cd feedback-board-backend
npm install
```

Create `.env` file in `feedback-board-backend`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/feedback-board
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
```

Start backend:
```bash
npm run dev
```

Backend runs on: `http://localhost:5000`

### 3. Frontend Setup
```bash
cd feedback-board-frontend
npm install
```

Create `.env` file in `feedback-board-frontend`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm run dev
```

Frontend runs on: `http://localhost:5173`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Feedbacks
- `GET /api/feedbacks` - Get all feedbacks
- `POST /api/feedbacks` - Create feedback (protected)
- `POST /api/feedbacks/:id/vote` - Toggle vote (protected)
- `PUT /api/feedbacks/:id` - Update status (protected)
- `GET /api/feedbacks/user/votes` - Get user's votes (protected)

## 🌐 Deployment

### Backend (Render)
1. Push code to GitHub
2. Go to render.com
3. Create new Web Service
4. Connect repository
5. Set Root Directory: `feedback-board-backend`
6. Build Command: `npm install`
7. Start Command: `npm start`
8. Add environment variables

### Frontend (Vercel)
1. Go to vercel.com
2. Import project
3. Framework: Vite
4. Root Directory: `feedback-board-frontend`
5. Add environment variable: `VITE_API_URL=<your-backend-url>/api`
6. Deploy

## 📝 Usage

1. Register a new account
2. Login with your credentials
3. Create new feedback by clicking "+ New Feedback"
4. Vote on existing feedback by clicking the arrow
5. Filter feedback by status using the filter buttons

## 🗄️ Database Schema

### Users
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Feedbacks
```javascript
{
  title: String,
  description: String,
  status: String (enum: ['Planned', 'In Progress', 'Completed', 'Rejected']),
  votes_count: Number,
  created_by: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Votes
```javascript
{
  user_id: ObjectId (ref: User),
  feedback_id: ObjectId (ref: Feedback),
  createdAt: Date,
  updatedAt: Date
}
```
