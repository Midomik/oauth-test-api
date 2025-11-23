const express = require('express');


const callbackController = require('../controllers/callback');

const router = express.Router();

router.get('/', callbackController.getCallback);
router.get('/profile', callbackController.getProfile);
router.get('/feed', callbackController.getFeed);
router.get('/friends', callbackController.getFriends);

module.exports = router;
