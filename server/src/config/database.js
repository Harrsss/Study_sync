const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/studysync';
  
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection Error: ${error.message}`);
    if (process.env.NODE_ENV !== 'test') {
      // In production/dev, we log and retry or exit
      console.error('[MongoDB] Retrying in 5 seconds...');
      setTimeout(connectDB, 5000);
    }
  }
};

module.exports = {
  connectDB,
  mongooseConnection: mongoose.connection
};
