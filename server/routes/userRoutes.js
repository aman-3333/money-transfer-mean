const express = require('express');
const router = express.Router();
const {
    createChildUser,
    getDirectChildren,
    getDownline,
    changeChildPassword,
    getUserProfile,
    getGlobalStats
} = require('../controllers/userController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

router.use(protect); // All routes below are protected

router.get('/profile', getUserProfile);
router.post('/create-child', createChildUser);
router.get('/children', getDirectChildren);
router.get('/downline', getDownline);
router.put('/change-password', changeChildPassword);
router.get('/admin/stats', admin, getGlobalStats); // Admin only

module.exports = router;
