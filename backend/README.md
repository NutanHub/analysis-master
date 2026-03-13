# MSBTE PaperHub Backend API

Complete backend server for MSBTE PaperHub - MSBTE Question Paper Analysis Platform with MongoDB Atlas, Cloudinary file storage, and Google Gemini AI integration.

## 🚀 Features

- **User Authentication System**
  - Secure signup/login with JWT tokens
  - Password hashing with bcrypt
  - Email and username validation
  - Protected routes with middleware

- **MongoDB Atlas Integration**
  - User management
  - Question paper storage
  - Analysis history tracking

- **Cloudinary File Storage**
  - Image upload (JPG, PNG)
  - PDF upload
  - Automatic optimization
  - Organized folder structure

- **Google Gemini AI Integration**
  - Question paper analysis
  - Study recommendations
  - AI-powered Q&A
  - Personalized insights

## 📋 Prerequisites

- Node.js >= 16.0.0
- MongoDB Atlas account
- Cloudinary account
- Google Gemini API key

## 🛠️ Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your credentials:

```env
# Server Configuration
PORT=8000
NODE_ENV=development

# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/msbte-paperhub?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Google Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Get Required API Keys

#### MongoDB Atlas Setup:
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string and update `MONGODB_URI`

#### Cloudinary Setup:
1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for a free account
3. Get your Cloud Name, API Key, and API Secret from the dashboard
4. Update the Cloudinary variables in `.env`

#### Google Gemini AI Setup:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key for Gemini
3. Update `GEMINI_API_KEY` in `.env`

### 4. Start the Server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:8000`

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)

#### Signup
```http
POST /api/auth/signup
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "Password123",
  "confirmPassword": "Password123",
  "institution": "MSBTE College",
  "course": "Computer Engineering"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "emailOrUsername": "johndoe",
  "password": "Password123"
}
```

#### Get Current User (Protected)
```http
GET /api/auth/me
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Logout (Protected)
```http
POST /api/auth/logout
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Update Profile (Protected)
```http
PUT /api/auth/updatedetails
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "firstName": "Jane",
  "institution": "New College"
}
```

### Question Paper Routes (`/api/papers`)

#### Upload Paper (Protected)
```http
POST /api/papers/upload
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

file: [FILE]
title: "MSBTE Summer 2023 Paper"
subject: "Computer Networks"
year: 2023
totalMarks: 100
course: "Computer Engineering"
semester: "5"
duration: "3 hours"
tags: "networking,msbte,summer"
```

#### Get All Papers
```http
GET /api/papers?subject=Computer&year=2023&page=1&limit=10
```

#### Get Single Paper
```http
GET /api/papers/:id
```

#### Get My Papers (Protected)
```http
GET /api/papers/user/my-papers
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Delete Paper (Protected)
```http
DELETE /api/papers/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

### AI Analysis Routes (`/api/ai`)

#### Analyze Paper (Protected)
```http
POST /api/ai/analyze/:paperId
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Study Recommendations (Protected)
```http
POST /api/ai/recommendations/:paperId
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Ask AI a Question (Protected)
```http
POST /api/ai/ask
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "question": "Explain OSI model layers",
  "context": "Computer Networks"
}
```

#### Get Analysis History (Protected)
```http
GET /api/ai/history?page=1&limit=10
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🗂️ Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   ├── cloudinary.js        # Cloudinary configuration
│   │   └── gemini.js            # Gemini AI configuration
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── paperController.js   # Question paper logic
│   │   └── aiController.js      # AI analysis logic
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── QuestionPaper.js     # Question paper schema
│   │   └── AnalysisHistory.js   # Analysis history schema
│   ├── routes/
│   │   ├── authRoutes.js        # Auth endpoints
│   │   ├── paperRoutes.js       # Paper endpoints
│   │   └── aiRoutes.js          # AI endpoints
│   ├── middleware/
│   │   ├── auth.js              # JWT verification
│   │   ├── errorHandler.js      # Error handling
│   │   └── validators.js        # Input validation
│   ├── utils/
│   │   ├── tokenUtils.js        # JWT utilities
│   │   └── asyncHandler.js      # Async wrapper
│   └── server.js                # Main server file
├── uploads/                      # Temporary upload folder
├── .env.example                  # Environment template
├── .gitignore
├── package.json
└── README.md
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting to prevent abuse
- CORS protection
- Helmet.js security headers
- Input validation with express-validator
- Protected routes middleware

## 📝 Database Models

### User Model
- firstName, lastName, username, email
- Password (hashed)
- Role (student/teacher/admin)
- Institution, course
- Avatar URL
- Timestamps

### QuestionPaper Model
- Title, subject, course, semester, year
- Total marks, duration
- File URL (Cloudinary)
- Upload user reference
- Analysis data (AI insights)
- Views and downloads count
- Tags for search

### AnalysisHistory Model
- User reference
- Question paper reference
- Analysis results
- AI insights and recommendations
- Timestamps

## 🧪 Testing the API

You can test the API using:

1. **Postman**: Import the endpoints and test
2. **cURL**: Use command line
3. **Frontend**: Connect your React frontend

Example cURL request:
```bash
# Signup
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123",
    "confirmPassword": "Test123"
  }'
```

## 🚨 Common Issues

### MongoDB Connection Failed
- Check your MongoDB URI
- Ensure IP is whitelisted in MongoDB Atlas
- Verify database user credentials

### Cloudinary Upload Fails
- Verify API credentials
- Check file size (max 10MB)
- Ensure file format is supported

### Gemini AI Errors
- Verify API key is correct
- Check you have API quota remaining
- Ensure you're using the correct model name

## 📦 Dependencies

### Core
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `dotenv` - Environment variables

### Authentication
- `jsonwebtoken` - JWT tokens
- `bcryptjs` - Password hashing
- `cookie-parser` - Cookie parsing

### File Upload
- `multer` - File upload middleware
- `cloudinary` - Cloud storage
- `multer-storage-cloudinary` - Cloudinary integration

### AI
- `@google/generative-ai` - Google Gemini AI

### Security
- `helmet` - Security headers
- `cors` - CORS handling
- `express-rate-limit` - Rate limiting
- `express-validator` - Input validation

### Utilities
- `morgan` - HTTP logging

## 🔄 Connecting Frontend

Update your frontend's auth.js baseURL:
```javascript
this.baseURL = 'http://localhost:8000/api';
```

Enable CORS by ensuring `FRONTEND_URL` in `.env` matches your frontend URL.

## 📄 License

ISC

## 👨‍💻 Support

For issues or questions, please check:
1. Environment variables are correctly set
2. All services (MongoDB, Cloudinary, Gemini) are configured
3. Dependencies are installed
4. Server is running on the correct port

---

**Built with ❤️ for MSBTE PaperHub**
