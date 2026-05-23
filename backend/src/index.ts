import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import teamsRoutes from './modules/teams/teams.routes';
import budgetRoutes from './modules/budget/budget.routes';
import expensesRoutes from './modules/expenses/expenses.routes';
import reportsRoutes from './modules/reports/reports.routes';
import settingsRoutes from './modules/settings/settings.routes';
import { errorMiddleware } from './middleware/error.middleware';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5000);
const uploadsPath = path.resolve(process.cwd(), process.env.UPLOAD_PATH || './uploads');
fs.mkdirSync(uploadsPath, { recursive: true });

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      frameAncestors: ["'self'", 'http://localhost:3000'],
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
    },
  },
  frameguard: false, // Disable frameguard, let CSP handle it
}));
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsPath));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/settings', settingsRoutes);

app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export default app;
