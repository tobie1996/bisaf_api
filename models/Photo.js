const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  description: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Photo', photoSchema);
