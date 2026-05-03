const pineconeService = require('../services/pineconeService');
const employeeService = require('../services/employeeService');
const payrollService = require('../services/payrollService');

exports.runWorkflow = async (req, res) => {
  try {
    const { workflowType, data } = req.body;

    if (!workflowType) {
      return res.status(400).json({ error: 'workflowType is required' });
    }

    console.log(`Initiating workflow: ${workflowType}`);
    let result = { message: `Workflow ${workflowType} initiated successfully.` };

    if (workflowType === 'hiring') {
      result.details = 'Hiring pipeline triggered. Candidate evaluation in progress.';
    } else if (workflowType === 'onboarding') {
      const newEmployee = await employeeService.createEmployee(data);
      const payrollProfile = await payrollService.initializePayrollProfile(newEmployee);
      
      result.details = 'Onboarding started. Payroll profile initialized.';
      result.employee = newEmployee;
      result.payroll = payrollProfile;
      result.checklist = ['Email setup', 'Hardware allocation', 'Welcome meeting', 'Payroll verification'];
    } else if (workflowType === 'leave_request') {
      const leaveResult = await employeeService.submitLeaveRequest(data.employeeId, data.days);
      result.details = 'Leave request processed.';
      result.status = leaveResult.status;
      result.remainingBalance = leaveResult.remainingBalance;
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in runWorkflow:', error);
    res.status(500).json({ error: 'Internal server error during workflow execution' });
  }
};
