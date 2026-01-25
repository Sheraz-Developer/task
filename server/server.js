import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express'
import { PrismaClient } from '@prisma/client';
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js"
import workspaceRouter from './routes/workspaceRoutes.js';
import { protect } from './middlewares/authMiddleware.js';

const app = express();
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

app.use(express.json());
app.use(cors())
app.use(clerkMiddleware());

app.get('/', (req, res) => res.send('Server is live!'));

app.use("/api/inngest", serve({ client: inngest, functions }));

//Routes
app.use('/api/workspaces', protect, workspaceRouter);

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

// Gracefully shutdown Prisma connection
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});