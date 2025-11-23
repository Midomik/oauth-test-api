const express = require('express');

const authMiddleware = require('../middlewares/auth');
const callbackController = require('../controllers/callback');

const router = express.Router();

router.post('/start', authMiddleware, callbackController.startFacebookLogin);
router.get('/', callbackController.getCallback);
router.get('/profile', authMiddleware, callbackController.getProfile);
router.get('/feed', authMiddleware, callbackController.getFeed);
router.get('/friends', authMiddleware, callbackController.getFriends);

module.exports = router;
