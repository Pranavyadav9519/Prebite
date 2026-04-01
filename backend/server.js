require('dotenv').config();
const app = require('./src/app');
const { Server } = require('socket.io');
const http = require('http');

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Make io accessible in requests
app.set('io', io);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join admin room for real-time updates
  socket.on('join:admin', () => {
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

server.listen(PORT, () => {
  console.log(`Prebite Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

