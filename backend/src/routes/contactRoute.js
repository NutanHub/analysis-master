const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const Newsletter = require('../models/Newsletter');
const { body, validationResult } = require('express-validator');

// Validation helper
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

// Submit contact form
router.post('/', 
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('name').trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
    body('subject').trim().isLength({ min: 5 }).withMessage('Subject must be at least 5 characters'),
    body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
    validate,
    async (req, res, next) => {
        try {
            const { name, email, subject, message } = req.body;

            const contact = new Contact({
                name,
                email,
                subject,
                message
            });

            await contact.save();

            res.status(201).json({
                success: true,
                message: 'Thank you for contacting us. We will get back to you soon.',
                data: contact
            });
        } catch (error) {
            next(error);
        }
    }
);

// Get all contacts (admin only)
router.get('/', async (req, res, next) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Contacts retrieved successfully',
            data: contacts
        });
    } catch (error) {
        next(error);
    }
});

// Get single contact
router.get('/:id', async (req, res, next) => {
    try {
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Contact retrieved successfully',
            data: contact
        });
    } catch (error) {
        next(error);
    }
});

// Reply to contact
router.put('/:id/reply',
    body('reply').trim().isLength({ min: 10 }).withMessage('Reply must be at least 10 characters'),
    validate,
    async (req, res, next) => {
        try {
            const contact = await Contact.findByIdAndUpdate(
                req.params.id,
                {
                    reply: req.body.reply,
                    status: 'replied',
                    repliedAt: new Date()
                },
                { new: true, runValidators: true }
            );

            if (!contact) {
                return res.status(404).json({
                    success: false,
                    message: 'Contact not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Reply sent successfully',
                data: contact
            });
        } catch (error) {
            next(error);
        }
    }
);

// Newsletter subscription
router.post('/newsletter/subscribe', 
    body('email').isEmail().withMessage('Please provide a valid email'),
    validate,
    async (req, res, next) => {
        try {
            const { email } = req.body;

            // Check if already subscribed
            const existing = await Newsletter.findOne({ email });
            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already subscribed to newsletter'
                });
            }

            const subscription = new Newsletter({ email });
            await subscription.save();

            res.status(201).json({
                success: true,
                message: 'Thank you for subscribing! Check your email for updates.',
                data: subscription
            });
        } catch (error) {
            next(error);
        }
    }
);

// Newsletter unsubscribe
router.post('/newsletter/unsubscribe',
    body('email').isEmail().withMessage('Please provide a valid email'),
    validate,
    async (req, res, next) => {
        try {
            const { email } = req.body;
            
            await Newsletter.findOneAndUpdate(
                { email },
                { subscribed: false },
                { new: true }
            );

            res.status(200).json({
                success: true,
                message: 'You have been unsubscribed from the newsletter'
            });
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
