require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
// db connection 
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