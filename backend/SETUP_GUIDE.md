# Quick Setup Guide

## Step-by-Step Setup Instructions

### 1. Prerequisites Check
- [ ] Node.js 16+ installed (`node --version`)
- [ ] npm or yarn installed (`npm --version`)
- [ ] Git installed (optional)

### 2. Install Dependencies
```bash
cd backend
npm install
```

Wait for all dependencies to install. This may take a few minutes.

### 3. Setup Environment Variables

#### Create .env file
```bash
cp .env.example .env
```

#### Get MongoDB Atlas Connection String
1. Visit https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a new cluster (M0 Free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database user password
7. Paste in `.env` as `MONGODB_URI`

Example:
```
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/msbte-paperhub?retryWrites=true&w=majority
```

#### Get Cloudinary Credentials
1. Visit https://cloudinary.com/users/register/free
2. Sign up for free account
3. Go to Dashboard
4. Copy:
   - Cloud Name
   - API Key
   - API Secret
5. Paste in `.env`:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Get Google Gemini API Key
1. Visit https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key
5. Paste in `.env`:
```
GEMINI_API_KEY=your_gemini_api_key
```

#### Set JWT Secret
Generate a random secret (or use any long random string):
```
JWT_SECRET=your_very_long_and_random_secret_key_here_123456
```

#### Update Frontend URL
If your frontend runs on a different port, update:
```
FRONTEND_URL=http://localhost:5173
```

### 4. Verify .env File
Your `.env` should look like this:
```env
PORT=8000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/msbte-paperhub
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=your_gemini_key
FRONTEND_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 5. Start the Server

#### Development Mode (with auto-reload):
```bash
npm run dev
```

#### Production Mode:
```bash
npm start
```

### 6. Test the Server

Open browser and visit:
```
http://localhost:8000
```

You should see:
```json
{
  "success": true,
  "message": "MSBTE PaperHub API Server",
  "version": "1.0.0"
}
```

### 7. Test Health Endpoint
```
http://localhost:8000/api/health
```

Should return:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Troubleshooting

### MongoDB Connection Error
```
Error: MongoServerError: bad auth
```
**Solution:** 
- Check username and password in connection string
- Ensure database user is created in MongoDB Atlas
- Whitelist your IP in Network Access

### Cloudinary Upload Fails
```
Error: Invalid credentials
```
**Solution:**
- Verify Cloud Name, API Key, and API Secret
- Check for extra spaces in .env file
- Ensure account is active

### Gemini AI Error
```
Error: Invalid API key
```
**Solution:**
- Verify API key is correct
- Check you have quota remaining
- Ensure API is enabled for your project

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::8000
```
**Solution:**
- Change PORT in .env to 3000 or 5000
- Or kill the process using port 8000:
  ```bash
  # Windows
  netstat -ano | findstr :8000
  taskkill /PID <PID> /F
  
  # Linux/Mac
  lsof -ti:8000 | xargs kill -9
  ```

## Testing with Frontend

1. Update frontend's `auth.js` baseURL:
```javascript
this.baseURL = 'http://localhost:8000/api';
```

2. Start both servers:
   - Backend: `npm run dev` (in backend folder)
   - Frontend: `npm run dev` (in frontend folder)

3. Test signup/login from frontend

## Next Steps

1. ✅ Server running
2. ✅ Database connected
3. ✅ APIs responding
4. → Test signup endpoint
5. → Test login endpoint
6. → Test file upload
7. → Test AI analysis

## Useful Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# Check Node version
node --version

# Check npm version
npm --version
```

## Support

If you encounter issues:
1. Check all environment variables are set correctly
2. Ensure all services (MongoDB, Cloudinary, Gemini) are configured
3. Verify Node.js version is 16 or higher
4. Check server logs for specific errors

## Security Notes

⚠️ **Important:**
- Never commit `.env` file to version control
- Change JWT_SECRET in production
- Use strong passwords for MongoDB
- Enable IP whitelisting in MongoDB Atlas for production
- Keep API keys secure

---

**Ready to build! 🚀**
