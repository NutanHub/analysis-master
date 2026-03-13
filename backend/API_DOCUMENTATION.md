# API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```

## Endpoints

### 1. Authentication

#### 1.1 Signup
**POST** `/auth/signup`

Create a new user account.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "Password123",
  "confirmPassword": "Password123",
  "institution": "MSBTE College (optional)",
  "course": "Computer Engineering (optional)"
}
```

**Validation Rules:**
- firstName: min 2 characters
- lastName: min 2 characters
- username: min 3 characters, alphanumeric + underscore only
- email: valid email format
- password: min 6 characters, must contain uppercase, lowercase, and number
- confirmPassword: must match password

**Success Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64abc123...",
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "student",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 1.2 Login
**POST** `/auth/login`

Login with email/username and password.

**Request Body:**
```json
{
  "emailOrUsername": "johndoe",
  "password": "Password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64abc123...",
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "lastLogin": "2024-01-01T12:00:00.000Z"
  }
}
```

#### 1.3 Get Current User
**GET** `/auth/me` 🔒

Get logged in user's details.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "64abc123...",
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "student",
    "institution": "MSBTE College",
    "course": "Computer Engineering"
  }
}
```

#### 1.4 Logout
**POST** `/auth/logout` 🔒

Logout the current user.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### 1.5 Update Profile
**PUT** `/auth/updatedetails` 🔒

Update user profile details.

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "institution": "New College",
  "course": "IT Engineering"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "user": { /* updated user object */ }
}
```

### 2. Question Papers

#### 2.1 Upload Paper
**POST** `/papers/upload` 🔒

Upload a new question paper.

**Headers:**
```
Content-Type: multipart/form-data
Authorization: Bearer YOUR_JWT_TOKEN
```

**Form Data:**
```
file: [PDF or Image file]
title: "MSBTE Summer 2023 - Computer Networks"
subject: "Computer Networks"
year: 2023
totalMarks: 100
course: "Computer Engineering"
semester: "5"
duration: "3 hours"
tags: "networking,msbte,summer"
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Question paper uploaded successfully",
  "data": {
    "_id": "64xyz...",
    "title": "MSBTE Summer 2023 - Computer Networks",
    "subject": "Computer Networks",
    "year": 2023,
    "fileUrl": "https://res.cloudinary.com/...",
    "uploadedBy": "64abc123...",
    "status": "pending"
  }
}
```

#### 2.2 Get All Papers
**GET** `/papers`

Get all public question papers with optional filters.

**Query Parameters:**
- `subject` (optional): Filter by subject
- `year` (optional): Filter by year
- `course` (optional): Filter by course
- `semester` (optional): Filter by semester
- `search` (optional): Search in title, subject, tags
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page

**Example:**
```
GET /papers?subject=Computer&year=2023&page=1&limit=10
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 50,
  "totalPages": 5,
  "currentPage": 1,
  "data": [
    {
      "_id": "64xyz...",
      "title": "MSBTE Summer 2023",
      "subject": "Computer Networks",
      "year": 2023,
      "uploadedBy": {
        "firstName": "John",
        "lastName": "Doe",
        "username": "johndoe"
      },
      "views": 120,
      "downloads": 45
    }
  ]
}
```

#### 2.3 Get Single Paper
**GET** `/papers/:id`

Get details of a specific paper.

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64xyz...",
    "title": "MSBTE Summer 2023",
    "subject": "Computer Networks",
    "year": 2023,
    "totalMarks": 100,
    "fileUrl": "https://res.cloudinary.com/...",
    "analysis": {
      "aiAnalysis": "...",
      "topics": [],
      "questionTypes": []
    },
    "uploadedBy": {
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "..."
    }
  }
}
```

#### 2.4 Get My Papers
**GET** `/papers/user/my-papers` 🔒

Get all papers uploaded by the logged-in user.

**Success Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [ /* array of papers */ ]
}
```

#### 2.5 Delete Paper
**DELETE** `/papers/:id` 🔒

Delete a question paper (only by uploader or admin).

**Success Response (200):**
```json
{
  "success": true,
  "message": "Question paper deleted successfully"
}
```

### 3. AI Analysis

#### 3.1 Analyze Paper
**POST** `/ai/analyze/:paperId` 🔒

Analyze a question paper using Gemini AI.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Paper analyzed successfully",
  "data": {
    "analysis": "AI-generated analysis text...",
    "paper": { /* paper object with updated analysis */ }
  }
}
```

#### 3.2 Get Study Recommendations
**POST** `/ai/recommendations/:paperId` 🔒

Get personalized study recommendations based on paper analysis.

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "recommendations": "AI-generated recommendations...",
    "paper": {
      "id": "64xyz...",
      "title": "MSBTE Summer 2023",
      "subject": "Computer Networks"
    }
  }
}
```

#### 3.3 Ask Question
**POST** `/ai/ask` 🔒

Ask AI a question about any topic.

**Request Body:**
```json
{
  "question": "Explain the OSI model layers",
  "context": "Computer Networks (optional)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "question": "Explain the OSI model layers",
    "answer": "The OSI model consists of 7 layers..."
  }
}
```

#### 3.4 Get Analysis History
**GET** `/ai/history` 🔒

Get user's AI analysis history.

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)

**Success Response (200):**
```json
{
  "success": true,
  "count": 20,
  "totalPages": 2,
  "currentPage": 1,
  "data": [
    {
      "_id": "64hist...",
      "questionPaper": {
        "title": "MSBTE Summer 2023",
        "subject": "Computer Networks"
      },
      "analysisType": "full",
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

## Error Codes

- **400** - Bad Request (validation errors)
- **401** - Unauthorized (invalid/missing token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **429** - Too Many Requests (rate limit exceeded)
- **500** - Internal Server Error

## Rate Limiting

- **Window**: 15 minutes
- **Max Requests**: 100 per window
- Applies to all `/api/*` routes

## Notes

- 🔒 indicates protected routes requiring authentication
- All timestamps are in ISO 8601 format
- File upload limit: 10MB for papers, 5MB for avatars
- Supported file formats: PDF, JPG, JPEG, PNG
