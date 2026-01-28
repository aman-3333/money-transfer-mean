const mongoose = require('mongoose');
const User = require('../models/User.js');
const Transaction = require('../models/Transaction.js');

const transferBalance = async (req, res) => {
    const { receiverId, amount } = req.body;
    const sender = req.user;



    try {
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            throw new Error('Receiver not found');
        }

        let payerId = sender._id;
        let payer;

        if (sender.role === 'admin') {
            if (receiver.parent) {
                payerId = receiver.parent;
            } else {
                payerId = sender._id;
            }
        } else {
            if (receiver.parent.toString() !== sender._id.toString()) {
                throw new Error('You can only transfer to your direct downline.');
            }
            payerId = sender._id;
        }

        if (payerId.toString() === sender._id.toString()) {
            payer = sender;
            payer = await User.findById(payerId);
        } else {
            payer = await User.findById(payerId);
        }

        if (payer.balance < amount) {
            throw new Error(`Insufficient balance. Payer (${payer.username}) has ${payer.balance}, needed ${amount}.`);
        }

        payer.balance -= amount;
        receiver.balance += Number(amount);

        await payer.save();
        await receiver.save();

        await Transaction.create({
            sender: payerId,
            receiver: receiverId,
            amount,
            type: 'CREDIT',
            description: sender.role === 'admin' && payerId.toString() !== sender._id.toString()
                ? `Admin credited ${receiver.username} (deducted from ${payer.username})`
                : 'Balance Transfer'
        });


        res.status(200).json({ message: 'Transfer successful' });

    } catch (error) {

        res.status(400).json({ message: error.message });
    } finally {

    }
};


const selfRecharge = async (req, res) => {
    const { amount } = req.body;
    const user = await User.findById(req.user._id);
    user.balance += Number(amount);
    await user.save();

    await Transaction.create({
        sender: req.user._id,
        receiver: req.user._id,
        amount: amount,
        type: 'SELF_RECHARGE',
        description: 'Owner Self Recharge'
    });

    res.status(200).json({ message: 'Recharge successful', balance: user.balance });
};


const getTransactions = async (req, res) => {
    const transactions = await Transaction.find({
        $or: [
            { sender: req.user._id },
            { receiver: req.user._id }
        ]
    }).populate('sender', 'username').populate('receiver', 'username').sort({ createdAt: -1 });

    res.json(transactions);
};

module.exports = {
    transferBalance,
    selfRecharge,
    getTransactions
};
