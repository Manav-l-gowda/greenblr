import express from 'express';
import cookieParser from 'cookie-parser';
import serverless from 'serverless-http';
import paymentRouter from '../../server/routes/payment';
import couponRouter from '../../server/routes/coupon';
import adminRouter from '../../server/routes/admin';

const app = express();

app.use(express.json());
app.use(cookieParser());

// Routes are mounted without /api prefix — Netlify strips that via the redirect rule
app.use('/payment', paymentRouter);
app.use('/coupon', couponRouter);
app.use('/admin', adminRouter);

export const handler = serverless(app);
