const express = require('express');

const authMiddleware = require('../middlewares/auth');
const callbackController = require('../controllers/callback');

const router = express.Router();

router.get('/', callbackController.getCallback);
router.post('/start', authMiddleware, callbackController.startFacebookLogin);
router.get('/profile', authMiddleware, callbackController.getProfile);
router.get('/friends', authMiddleware, callbackController.getFriends);

module.exports = router;
