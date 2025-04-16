
const mongoose = require('mongoose');
const DB_URI = "mongodb+srv://takparasoulemane6:SOUL229@bibliolab.hppu7ke.mongodb.net/BiblioLab"
const connectDB = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log('MongoDB connecté...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
