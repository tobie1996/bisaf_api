const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bisaf_db';
    await mongoose.connect(uri);
    console.log('MongoDB connecté');
  } catch (err) {
    console.error('Erreur MongoDB:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
