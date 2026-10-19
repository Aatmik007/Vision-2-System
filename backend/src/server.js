import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect Database & Start Server with safe logs
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[Vision2System Backend] Server running on PORT ${PORT}`);
    console.log(`[Vision2System Backend] Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});
