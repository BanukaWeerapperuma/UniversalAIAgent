/**
 * Labor Law Compliance Middleware
 * Ensures HR requests do not contain discriminatory filters based on
 * age, gender, race, religion, etc., keeping in line with the BMAD HR Scope.
 */
module.exports = (req, res, next) => {
  const discriminatoryKeywords = ['age', 'gender', 'race', 'religion', 'marital', 'pregnancy'];
  
  const checkPayload = (data) => {
    if (!data) return false;
    const jsonString = JSON.stringify(data).toLowerCase();
    
    for (const keyword of discriminatoryKeywords) {
      // Use regex with word boundaries to avoid false positives like 'package' or 'manage'
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(jsonString)) {
        return keyword;
      }
    }
    return null;
  };

  // Check body and query parameters
  const bodyViolation = checkPayload(req.body);
  const queryViolation = checkPayload(req.query);

  if (bodyViolation || queryViolation) {
    const keyword = bodyViolation || queryViolation;
    return res.status(400).json({
      success: false,
      error: `Compliance Violation: Request contains potentially discriminatory criteria related to '${keyword}'. This violates the BMAD HR scope.`
    });
  }

  next();
};
