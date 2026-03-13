require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const paperRoutes = require('./routes/paperRoutes');
const aiRoutes = require('./routes/aiRoutes');
const contactRoute = require('./routes/contactRoute');

// Initialize Express app
const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration (flexible for localhost during development)
const allowedOriginsEnv = (process.env.FRONTEND_URL || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
    origin: (origin, callback) => {
        // Allow non-browser requests (no origin)
        if (!origin) return callback(null, true);

        // Allow localhost in development on any port
        if ((process.env.NODE_ENV || 'development') === 'development') {
            if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
                return callback(null, true);
            }
        }

        // Allow specific origins from env (comma-separated)
        if (allowedOriginsEnv.length > 0 && allowedOriginsEnv.includes(origin)) {
            return callback(null, true);
        }

        // Otherwise block
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    optionsSuccessStatus: 200
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/papers', paperRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/contact', contactRoute);

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Root route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'MSBTE PaperHub API Server',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            papers: '/api/papers',
            ai: '/api/ai',
            health: '/api/health'
        }
    });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Server configuration
const PORT = process.env.PORT || 8000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║          MSBTE PaperHub Backend Server                 ║
║                                                        ║
║  Server is running in ${NODE_ENV.toUpperCase()} mode              
║  Port: ${PORT}                                          
║  URL: http://localhost:${PORT}                         
║                                                        ║
║  API Endpoints:                                        ║
║  - Auth:   http://localhost:${PORT}/api/auth           
║  - Papers: http://localhost:${PORT}/api/papers         
║  - AI:     http://localhost:${PORT}/api/ai             
║                                                        ║
╚════════════════════════════════════════════════════════╝
    `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error(`Uncaught Exception: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});

module.exports = app;
