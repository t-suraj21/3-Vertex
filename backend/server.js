const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const path = require('path');

const app = express();

// Security & Middleware
app.use(helmet());

// CORS - Allow ALL origins during development (mobile apps don't send Origin header anyway)
app.use(cors());

app.use(express.json());

// Request logger - so we can see EVERY request hitting the server
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path} from ${req.ip}`);
  next();
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // Increased for development
  message: 'Too many requests, please try again later.'
});
app.use('/api/', limiter);

// Route Imports
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiRoutes = require('./routes/aiRoutes');
const newsRoutes = require('./routes/newsRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Health check - hit this from phone browser to test connectivity
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'TalentSync API is running', time: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Backend reachable' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/messages', messageRoutes);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
const PORT = process.env.PORT || 8001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/talentsync1';

let server;

const shutdown = (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);

  const forceExitTimer = setTimeout(() => {
    console.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 5000);

  forceExitTimer.unref();

  if (server) {
    server.close(() => {
      mongoose.connection.close()
        .then(() => {
          console.log('HTTP server and MongoDB connection closed.');
          process.exit(0);
        })
        .catch((err) => {
          console.error('Error while closing MongoDB connection:', err);
          process.exit(1);
        });
    });
    return;
  }

  mongoose.connection.close()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
};

const http = require('http');
const { Server } = require('socket.io');

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // AUTO-SEED: Ensure mock companies exist for testing in new databases (like Atlas)
    try {
      const User = require('./models/User');
      const bcrypt = require('bcryptjs');
      const companyCount = await User.countDocuments({ role: 'company' });
      if (companyCount === 0) {
        console.log('No companies found in database. Auto-seeding mock companies...');
        const hashedPassword = await bcrypt.hash('Company@123', 10);
        await User.create([
          { role: 'company', email: 'google@talentsync.dev', password: hashedPassword, companyName: 'Google India', govRegId: 'REG-GIN-2023', gstCin: 'U72900KA2004', verifiedStatus: 'verified' },
          { role: 'company', email: 'infosys@talentsync.dev', password: hashedPassword, companyName: 'Infosys Ltd', govRegId: 'REG-INF-1993', gstCin: 'L85110KA1981', verifiedStatus: 'verified' }
        ]);
        console.log('✅ Auto-seeded mock companies (google@talentsync.dev / Company@123)');
      }
    } catch(err) {
      console.error('Auto-seed failed:', err.message);
    }

    // Create HTTP server wrapping Express
    server = http.createServer(app);

    // Initialize Socket.io and attach it to the server
    const io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // Make io globally accessible over the app for controllers
    global.io = io;

    io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);

      socket.on('join-room', (applicationId) => {
        socket.join(applicationId);
        console.log(`Socket ${socket.id} joined room ${applicationId}`);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server and Socket.io running on http://0.0.0.0:${PORT}`);
    });

    server.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use.`);
        process.exit(1);
      } else {
        console.error('Server startup error:', err);
      }
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// 404 Handler - MUST BE AT THE END OF ROUTES
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'API route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[GlobalError]', err);
  const status = err.name === 'CastError' ? 400 : 500;
  res.status(status).json({ 
    success: false, 
    error: err.message || 'Internal Server Error'
  });
});

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer();
