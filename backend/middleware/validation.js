const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const customerValidationRules = () => {
  return [
    body('fullName').trim().notEmpty().withMessage('Full Name is required'),
    body('email').trim().isEmail().withMessage('Invalid email format'),
    body('phone').optional({ checkFalsy: true }).isMobilePhone().withMessage('Invalid phone number'),
    body('memberType').isIn(['Standard', 'Premium', 'VIP', 'Member']).withMessage('Invalid member type'),
    body('memberLevel').isIn(['Basic', 'Silver', 'Gold', 'Beginner']).withMessage('Invalid member level'),
    body('memberStartDate').isISO8601().toDate().withMessage('Invalid start date'),
  ];
};

const registerValidationRules = () => {
    return [
        body('fullName').trim().notEmpty().withMessage('Full Name is required'),
        body('email').trim().isEmail().withMessage('Invalid email format'),
        body('phone').optional({ checkFalsy: true }).isMobilePhone().withMessage('Invalid phone number'),
    ];
};

const trainerValidationRules = () => {
    return [
        body('trainerName').trim().notEmpty().withMessage('Trainer Name is required'),
        body('trainerLevel').notEmpty().withMessage('Trainer Level is required'),
        body('phone').optional({ checkFalsy: true }).isMobilePhone().withMessage('Invalid phone number'),
    ];
};

const equipmentValidationRules = () => {
    return [
        body('equipmentName').trim().notEmpty().withMessage('Equipment Name is required'),
        body('status').isIn(['Available', 'Maintenance', 'In Use']).withMessage('Invalid status'),
    ];
};

const sessionValidationRules = () => {
    return [
        body('sessionDate').isISO8601().toDate().withMessage('Invalid session date'),
        body('customerId').isInt().withMessage('Customer ID must be an integer'),
        body('trainerId').optional({ checkFalsy: true }).isInt().withMessage('Trainer ID must be an integer'),
        body('equipmentId').isInt().withMessage('Equipment ID must be an integer'),
    ];
};

module.exports = {
  validate,
  customerValidationRules,
  registerValidationRules,
  trainerValidationRules,
  equipmentValidationRules,
  sessionValidationRules
};
