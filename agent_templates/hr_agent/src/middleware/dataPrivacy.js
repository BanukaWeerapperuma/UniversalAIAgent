/**
 * Data Privacy Middleware
 * Ensures sensitive PII (Personally Identifiable Information) like 
 * SSN, Credit Card numbers, or Passwords are masked in logs or rejected
 * if sent in plain text to non-secure endpoints.
 */
module.exports = (req, res, next) => {
  const sensitiveFields = ['ssn', 'password', 'credit_card', 'salary'];
  
  const maskPII = (data) => {
    if (typeof data !== 'object' || data === null) return data;
    
    const maskedData = Array.isArray(data) ? [...data] : { ...data };
    
    for (const key in maskedData) {
      if (sensitiveFields.includes(key.toLowerCase())) {
        maskedData[key] = '********';
      } else if (typeof maskedData[key] === 'object') {
        maskedData[key] = maskPII(maskedData[key]);
      }
    }
    return maskedData;
  };

  // Mask PII in the body for logging purposes (simulated)
  const sanitizedBody = maskPII(req.body);
  
  // In a real scenario, you might log this sanitized version
  // console.log('Sanitized Request Body:', sanitizedBody);

  // If a critical field like SSN is present, we might want to reject it
  // if the environment is not secure enough.
  if (req.body.ssn) {
    return res.status(403).json({
      success: false,
      error: 'Data Privacy Violation: Plain text SSN submission is prohibited by BMAD HR policies.'
    });
  }

  next();
};
