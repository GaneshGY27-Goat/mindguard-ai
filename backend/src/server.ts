import express, { Request, Response } from 'express';
import cors from 'cors';
import apiRouter from './routes/api';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Root / Health Check
app.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    service: 'MindGuard AI - Early Mental Wellness Backend API',
    version: '1.0.0-prototype',
    disclaimer: 'Prototype Risk Model – Not a Medical Diagnostic Device'
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Mount main API
app.use('/api', apiRouter);

// Start server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 MindGuard AI Backend running on http://localhost:${PORT}`);
  console.log(`🩺 Disclaimer: Prototype Model – Not a Medical Device`);
  console.log(`====================================================`);
});

export default app;
