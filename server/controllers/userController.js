const User = require('../models/User.js');
const bcrypt = require('bcryptjs');


const createChildUser = async (req, res) => {
    const { username, password } = req.body;
    const parentId = req.user._id;


    const userExists = await User.findOne({ username });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }


    const parent = await User.findById(parentId);
    if (!parent) {
        return res.status(404).json({ message: 'Parent not found' });
    }

    let newPath = parent.path;
    if (!newPath) {

        newPath = `,${parentId},`;
    } else {

        newPath = `${newPath}${parentId},`;
    }

    const user = await User.create({
        username,
        password,
        role: 'user', // Default role
        parent: parentId,
        path: newPath
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            username: user.username,
            parent: user.parent,
            path: user.path
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};


const getDirectChildren = async (req, res) => {
    const children = await User.find({ parent: req.user._id }).select('-password');
    res.json(children);
};


const getDownline = async (req, res) => {
    const currentUserId = req.user._id;

    const regex = new RegExp(`,${currentUserId},`);

    const downline = await User.find({ path: regex }).select('-password');
    res.json(downline);
};

const changeChildPassword = async (req, res) => {
    const { userId, newPassword } = req.body;

    const userToUpdate = await User.findById(userId);

    if (!userToUpdate) {
        return res.status(404).json({ message: 'User not found' });
    }


    if (userToUpdate.parent.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to change this user password. Must be immediate parent.' });
    }
    userToUpdate.password = newPassword;
    await userToUpdate.save();

    res.json({ message: 'Password updated successfully' });
};


const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
        res.json({
            _id: user._id,
            username: user.username,
            role: user.role,
            balance: user.balance
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

const getGlobalStats = async (req, res) => {
    const totalUsers = await User.countDocuments({ role: 'user' });

    const balanceStats = await User.aggregate([
        { $match: { role: 'user' } },
        { $group: { _id: null, totalBalance: { $sum: '$balance' } } }
    ]);

    const totalBalance = balanceStats.length > 0 ? balanceStats[0].totalBalance : 0;

    res.json({
        totalUsers,
        totalUserBalance: totalBalance
    });
};

module.exports = {
    createChildUser,
    getDirectChildren,
    getDownline,
    changeChildPassword,
    getUserProfile,
    getGlobalStats
};
