require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
const app = express();
const port = process.env.PORT || 3000;
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});

app.use(limiter);
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
connectDB();
app.get("/", (req, res) => {
  res.send("Finance Dashboard API running")
});
app.use(express.json());
app.use("/api/auth", authRoutes);

const userRoutes = require('./routes/user.routes');
app.use("/api/users", userRoutes);

const recordRoutes = require('./routes/record.routes');
app.use("/api/records", recordRoutes);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`http://localhost:${port}`);
});