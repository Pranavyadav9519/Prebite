const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const apiResponse = require('../utils/apiResponse');

const JWT_SECRET = process.env.JWT_SECRET || 'prebite_jwt_secret_key_2025';
const JWT_EXPIRES_IN = '15m';
const JWT_REFRESH_EXPIRES_IN = '7d';


const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    
    if (!name || !email || !password) {
      return apiResponse.badRequest(res, 'Please provide name, email and password');
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return apiResponse.badRequest(res, 'User with this email already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user (default role is student)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || JWT_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );

    return apiResponse.created(res, {
      user,
      accessToken,
      refreshToken
    }, 'Registration successful');
  } catch (error) {
    next(error);
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return apiResponse.badRequest(res, 'Please provide email and password');
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return apiResponse.unauthorized(res, 'Invalid email or password');
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return apiResponse.unauthorized(res, 'Invalid email or password');
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || JWT_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );

    // Remove password hash from response
    const { passwordHash, ...userWithoutPassword } = user;

    return apiResponse.ok(res, {
      user: userWithoutPassword,
      accessToken,
      refreshToken
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

// Refresh token
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return apiResponse.badRequest(res, 'Refresh token is required');
    }

    // Verify refresh token
    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || JWT_SECRET
    );

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return apiResponse.unauthorized(res, 'User not found');
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return apiResponse.ok(res, { accessToken }, 'Token refreshed');
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return apiResponse.unauthorized(res, 'Invalid or expired refresh token');
    }
    next(error);
  }
};

// Get current user
const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return apiResponse.notFound(res, 'User not found');
    }

    return apiResponse.ok(res, { user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  getMe,
};
