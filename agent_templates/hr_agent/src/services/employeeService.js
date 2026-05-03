const mongoose = require('mongoose');

// Mock Employee Schema for the purpose of the automation flow
// In a production app, this would be in a separate models/ folder.
const employeeSchema = new mongoose.Schema({
  name: String,
  email: String,
  department: String,
  role: String,
  onboardingStatus: { type: String, default: 'Pending' },
  leaveBalance: { type: Number, default: 20 },
  createdAt: { type: Date, default: Date.now }
});

const Employee = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);

class EmployeeService {
  async createEmployee(data) {
    console.log(`Creating employee record for: ${data.name}`);
    // Simulate DB creation
    const employee = new Employee({
      name: data.name,
      email: data.email,
      department: data.department || 'HR',
      role: data.role || 'New Hire'
    });
    
    // In development without DB, we just return the object
    return employee;
  }

  async submitLeaveRequest(employeeId, days) {
    console.log(`Processing leave request for employee: ${employeeId}`);
    // Simulate leave quota check
    if (days > 20) {
      throw new Error('Insufficient leave balance');
    }
    return {
      status: 'Approved',
      remainingBalance: 20 - days
    };
  }
}

module.exports = new EmployeeService();
