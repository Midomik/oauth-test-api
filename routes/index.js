const express = require('express');

const authMiddleware = require('../middlewares/auth');

const userRouter = require('./users');
const dashboardRouter = require('./dashboard');
const orderRouter = require('./orders');
const productRouter = require('./products');
const supplierRouter = require('./suppliers');
const customerRouter = require('./customer');
const callbackRouter = require('./callback');

const router = express.Router();

router.use('/user', userRouter);
router.use('/dashboard', authMiddleware, dashboardRouter);
router.use('/orders', authMiddleware, orderRouter);
router.use('/products', authMiddleware, productRouter);
router.use('/suppliers', authMiddleware, supplierRouter);
router.use('/customers', authMiddleware, customerRouter);
router.use('/callback', callbackRouter);

module.exports = router;
