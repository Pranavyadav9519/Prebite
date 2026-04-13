require('dotenv').config();
const app = require('./src/app');
const { Server } = require('socket.io');
const http = require('http');
const prisma = require('./src/config/db');

const jwt = require('jsonwebtoken');

const PORT = process.env.PORT || 4000;

const ALLOWED_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:5173'];

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.io JWT authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    // Allow unauthenticated connections — they just can't join privileged rooms
    socket.userId = null;
    socket.userRole = null;
    return next();
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    socket.userRole = decoded.role;
    next();
  } catch {
    // Invalid token — treat as unauthenticated
    socket.userId = null;
    socket.userRole = null;
    next();
  }
});

// Make io accessible in requests
app.set('io', io);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join admin room — only verified admin users may join
  socket.on('join:admin', () => {
    if (socket.userRole !== 'admin') {
      socket.emit('error', { message: 'Unauthorized' });
      return;
    }
    socket.join('admin');
    console.log('Admin joined:', socket.id);
  });

  // Join user room for order updates
  socket.on('join:order', (orderId) => {
    socket.join(`order:${orderId}`);
    console.log(`User joined order room: ${orderId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Handle graceful shutdown - only for non-serverless environments
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`Prebite Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;

process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  const forceExit = setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
  forceExit.unref();
  try {
    await prisma.$disconnect();
  } catch (err) {
    console.error('Error disconnecting Prisma:', err);
  }
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down...');
  const forceExit = setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
  forceExit.unref();
  try {
    await prisma.$disconnect();
  } catch (err) {
    console.error('Error disconnecting Prisma:', err);
  }
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

