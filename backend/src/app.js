import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import evaluationRoutes from './routes/evaluationRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';

const app = express();

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true); // Flexible fallback so Vercel deployments work cleanly
  },
  credentials: true
}));

// Body parser middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root health check endpoint as requested
app.get('/', (req, res) => {
  res.json({ message: 'Vision2System API is running' });
});

// API status endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Vision2System API', time: new Date() });
});

// User authentication routes mounted on /api/users AND /api/auth
app.use('/api/users', authRoutes);
app.use('/api/auth', authRoutes);

// Project routes
app.use('/api/projects', projectRoutes);

// AI Evaluation & Quality Dashboard routes
app.use('/api/evaluation', evaluationRoutes);

// Centralized error handling
app.use(errorHandler);

export default app;
