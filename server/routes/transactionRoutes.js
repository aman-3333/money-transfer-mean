const express = require('express');
const router = express.Router();
const { transferBalance, selfRecharge, getTransactions } = require('../controllers/transactionController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

router.use(protect);

router.post('/transfer', transferBalance);
router.post('/recharge', admin, selfRecharge); // Only admin/owner can self recharge
router.get('/', getTransactions);

module.exports = router;
