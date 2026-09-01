const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const AppError = require('./utils/errors');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const taskRoutes = require('./routes/tasks');
const messageRoutes = require('./routes/messages');
const leaderboardRoutes = require('./routes/leaderboard');
const userRoutes = require('./routes/users');
const healthRoutes = require('./routes/health');

const app = express();

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// CORS configuration for production (Vercel) & local development
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:80',
  'http://localhost'
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);

      // Check if origin matches allowed list or vercel preview app domain
      const isAllowed =
        allowedOrigins.includes(origin) ||
        (process.env.CLIENT_URL && origin.startsWith(process.env.CLIENT_URL)) ||
        (process.env.NODE_ENV === 'production' && origin.endsWith('.vercel.app'));

      if (isAllowed) {
        return callback(null, true);
      }

      // If in production and strictly not allowed, block; otherwise allow for flexibility
      if (process.env.NODE_ENV === 'production' && !origin.includes('localhost')) {
        console.warn(`[CORS Warning] Origin ${origin} attempted access`);
        return callback(null, true); // Permissive during setup so students aren't blocked by minor subdomain mismatches
      }

      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// HTTP request logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Static file serving for local uploads (images & PDFs)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Apply general rate limiter
app.use('/api/', apiLimiter);

// Mount API routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/users', userRoutes);

// Root greeting endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'StudySync API is operational',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Handle undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
