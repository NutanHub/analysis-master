const { body, validationResult } = require('express-validator');

// Validation middleware wrapper
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => `${err.path}: ${err.msg}`).join('; ');
        return res.status(400).json({
            success: false,
            message: 'Validation failed: ' + errorMessages,
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

// Signup validation rules
const signupValidation = [
    body('firstName')
        .trim()
        .notEmpty().withMessage('First name is required')
        .isLength({ min: 2 }).withMessage('First name must be at least 2 characters long'),
    
    body('lastName')
        .trim()
        .notEmpty().withMessage('Last name is required')
        .isLength({ min: 2 }).withMessage('Last name must be at least 2 characters long'),
    
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
    
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),
    
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
    body('confirmPassword')
        .notEmpty().withMessage('Please confirm your password')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        })
];

// Login validation rules
const loginValidation = [
    body('emailOrUsername')
        .trim()
        .notEmpty().withMessage('Email or username is required'),
    
    body('password')
        .notEmpty().withMessage('Password is required')
];

// Update profile validation
const updateProfileValidation = [
    body('firstName')
        .optional()
        .trim()
        .isLength({ min: 2 }).withMessage('First name must be at least 2 characters long'),
    
    body('lastName')
        .optional()
        .trim()
        .isLength({ min: 2 }).withMessage('Last name must be at least 2 characters long'),
    
    body('email')
        .optional()
        .trim()
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),
    
    body('institution')
        .optional()
        .trim(),
    
    body('course')
        .optional()
        .trim()
];

// Question paper upload validation
const uploadPaperValidation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Paper title is required'),
    
    body('subject')
        .trim()
        .notEmpty().withMessage('Subject is required'),
    
    body('year')
        .notEmpty().withMessage('Year is required')
        .isInt({ min: 1900, max: 2100 }).withMessage('Please provide a valid year'),
    
    body('totalMarks')
        .notEmpty().withMessage('Total marks is required')
        .isInt({ min: 1 }).withMessage('Total marks must be a positive number')
];

module.exports = {
    validate,
    signupValidation,
    loginValidation,
    updateProfileValidation,
    uploadPaperValidation
};
