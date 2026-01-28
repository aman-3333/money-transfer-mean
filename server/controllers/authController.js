const fs = require('fs');
const path = require('path');
const svgCaptcha = require('svg-captcha');
const User = require('../models/User.js');
const generateToken = require('../utils/generateToken.js');

const captchaStore = new Map();


const getCaptcha = (req, res) => {
    const captcha = svgCaptcha.create();
    const captchaId = Math.random().toString(36).substring(7);
    captchaStore.set(captchaId, captcha.text.toLowerCase());


    try {
        fs.writeFileSync(path.join(__dirname, '..', '..', 'captcha.txt'), `${captchaId} ${captcha.text.toLowerCase()}`);
    } catch (err) {
        console.error('Failed to write captcha file', err);
    }


    setTimeout(() => captchaStore.delete(captchaId), 5 * 60 * 1000);

    res.status(200).json({
        captchaId,
        svg: captcha.data
    });
};


const loginUser = async (req, res) => {
    const { username, password, captchaId, captchaValue } = req.body;


    if (!captchaStore.has(captchaId) || captchaStore.get(captchaId) !== captchaValue.toLowerCase()) {
        return res.status(400).json({ message: 'Invalid or expired CAPTCHA' });
    }


    captchaStore.delete(captchaId);

    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
        generateToken(res, user._id);

        res.json({
            _id: user._id,
            username: user.username,
            role: user.role
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};


const registerUser = async (req, res) => {
    console.log('registerUser called with:', req.body);
    const { username, password } = req.body;

    const userExists = await User.findOne({ username });

    if (userExists) {
        res.status(400).json({ message: 'User already exists' });
        return;
    }


    const count = await User.countDocuments({});
    const role = count === 0 ? 'admin' : 'user';

    const user = await User.create({
        username,
        password,
        role
    });

    if (user) {
        generateToken(res, user._id);
        res.status(201).json({
            _id: user._id,
            username: user.username,
            role: user.role,
            balance: user.balance
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};


const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = {
    loginUser,
    registerUser,
    logoutUser,
    getCaptcha
};
