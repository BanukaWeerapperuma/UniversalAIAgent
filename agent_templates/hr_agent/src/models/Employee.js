const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  department: { type: String },
  role: { type: String },
  onboardingStatus: { type: String, default: 'Pending' },
  leaveBalance: { type: Number, default: 20 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);
