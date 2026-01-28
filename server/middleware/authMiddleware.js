const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

const protect = async (req, res, next) => {
    let token;

    token = req.cookies.jwt;

    if (token) {
        try {

            const decoded = jwt.verify(token, "NJNNLNKLNJHIBJNKBHVG");

            req.user = await User.findById(decoded.userId).select('-password');

            if (!req.user) {
                console.error('User not found for userId:', decoded.userId);
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            next();
        } catch (error) {
            console.error('JWT verification error:', error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        console.log('No JWT token found in cookies');
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
}

module.exports = { protect, admin };
