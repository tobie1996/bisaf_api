const mongoose = require('mongoose');

const offreEmploiSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  company: String,
  location: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('OffreEmploi', offreEmploiSchema);
