const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: String,
  image: { type: String, default: '' }, // URL de l'image du blog
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Blog', blogSchema);
