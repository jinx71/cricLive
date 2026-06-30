require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const cricketRoutes = require('./routes/cricketRoutes');

const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';

const app = express();

app.use(helmet());
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: '1mb' }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Throttle our own routes — even though the backend caches upstream calls,
// we still don't want individual clients hammering us.
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests — slow down a bit.', errors: [] },
});
app.use('/api/', limiter);

app.get('/api/health', (_req, res) =>
  res.json({
    success: true,
    data: {
      status: 'ok',
      uptime: process.uptime(),
      mockMode: !process.env.CRICKETDATA_API_KEY,
    },
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/cricket', cricketRoutes);

app.use(notFound);
app.use(errorHandler);

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[server] CricLive API listening on http://localhost:${PORT}`);
    console.log(`[server] CORS origin: ${CLIENT_ORIGIN}`);
    console.log(`[server] Mock mode: ${!process.env.CRICKETDATA_API_KEY ? 'ON (no API key)' : 'OFF'}`);
  });
};

start();
