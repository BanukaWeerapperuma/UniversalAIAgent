const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  resumeText: { type: String },
  score: { type: Number },
  reasoning: { type: String },
  status: { type: String, default: 'Screened' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Candidate', candidateSchema);
