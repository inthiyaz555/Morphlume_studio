import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'db.json');

// Initialize JSON Database
interface DBStructure {
  users: any[];
  transformations: any[];
}

function getDB(): DBStructure {
  if (!fs.existsSync(DB_FILE)) {
    const initialDB: DBStructure = { users: [], transformations: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2));
    return initialDB;
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return { users: [], transformations: [] };
  }
}

function saveDB(db: DBStructure) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// Seed default user if none exists
const dbData = getDB();
if (dbData.users.length === 0) {
  const adminId = 'admin-user';
  const adminEmail = 'admin@example.com';
  const adminPassword = 'password123';
  const hashedAdminPassword = bcrypt.hashSync(adminPassword, 10);
  dbData.users.push({
    id: adminId,
    email: adminEmail,
    password: hashedAdminPassword,
    displayName: 'Admin User',
    createdAt: new Date().toISOString()
  });
  saveDB(dbData);
  console.log('Default admin user created: admin@example.com / password123');
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use(cors());
  app.use(cookieParser());

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: 'Forbidden' });
      req.user = user;
      next();
    });
  };

  // Auth Routes
  app.post('/api/auth/signup', async (req, res) => {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const db = getDB();

    if (db.users.find(u => u.email === normalizedEmail)) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const id = Math.random().toString(36).substring(2, 15);
      
      const newUser = {
        id,
        email: normalizedEmail,
        password: hashedPassword,
        displayName: name,
        createdAt: new Date().toISOString()
      };
      
      db.users.push(newUser);
      saveDB(db);

      const token = jwt.sign({ id, email: normalizedEmail, displayName: name }, JWT_SECRET);
      res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
      res.json({ user: { id, email: normalizedEmail, displayName: name } });
    } catch (err: any) {
      console.error('Signup error:', err);
      res.status(500).json({ error: 'Failed to create account' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const db = getDB();

    try {
      const user = db.users.find(u => u.email === normalizedEmail);
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = jwt.sign({ id: user.id, email: user.email, displayName: user.displayName }, JWT_SECRET);
      res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
      res.json({ user: { id: user.id, email: user.email, displayName: user.displayName } });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.get('/api/auth/me', (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.json({ user: null });

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) return res.json({ user: null });
      res.json({ user: decoded });
    });
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
  });

  // Transformation Routes
  app.get('/api/transformations', authenticateToken, (req: any, res) => {
    const db = getDB();
    const rows = db.transformations
      .filter(t => t.userId === req.user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(rows);
  });

  app.post('/api/transformations', authenticateToken, (req: any, res) => {
    const { type, originalUrl, transformedUrl, style, styleDescription, config } = req.body;
    const id = Math.random().toString(36).substring(2, 15);
    const db = getDB();
    
    const newTransformation = {
      id,
      userId: req.user.id,
      type,
      originalUrl,
      transformedUrl,
      style,
      styleDescription,
      config,
      createdAt: new Date().toISOString()
    };
    
    db.transformations.push(newTransformation);
    saveDB(db);
    
    res.json(newTransformation);
  });

  app.delete('/api/transformations/:id', authenticateToken, (req: any, res) => {
    const db = getDB();
    const initialLength = db.transformations.length;
    db.transformations = db.transformations.filter(t => !(t.id === req.params.id && t.userId === req.user.id));
    
    if (db.transformations.length === initialLength) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    saveDB(db);
    res.json({ success: true });
  });

  // Profile Update
  app.put('/api/auth/profile', authenticateToken, async (req: any, res) => {
    const { displayName, email, password, photoURL } = req.body;
    const userId = req.user.id;
    const db = getDB();
    const userIndex = db.users.findIndex(u => u.id === userId);

    if (userIndex === -1) return res.status(404).json({ error: 'User not found' });

    try {
      if (displayName) db.users[userIndex].displayName = displayName;
      if (photoURL !== undefined) db.users[userIndex].photoURL = photoURL;
      
      if (email) {
        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = db.users.find(u => u.email === normalizedEmail && u.id !== userId);
        if (existingUser) return res.status(400).json({ error: 'Email already in use' });
        db.users[userIndex].email = normalizedEmail;
      }

      if (password) {
        db.users[userIndex].password = await bcrypt.hash(password, 10);
      }

      saveDB(db);
      const updatedUser = db.users[userIndex];
      
      const token = jwt.sign({ 
        id: updatedUser.id, 
        email: updatedUser.email, 
        displayName: updatedUser.displayName, 
        photoURL: updatedUser.photoURL 
      }, JWT_SECRET);
      
      res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
      res.json({ user: { id: updatedUser.id, email: updatedUser.email, displayName: updatedUser.displayName, photoURL: updatedUser.photoURL } });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // Delete Account
  app.delete('/api/auth/account', authenticateToken, (req: any, res) => {
    const userId = req.user.id;
    const db = getDB();
    
    db.transformations = db.transformations.filter(t => t.userId !== userId);
    db.users = db.users.filter(u => u.id !== userId);
    
    saveDB(db);
    res.clearCookie('token');
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
