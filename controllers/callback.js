const crypto = require('crypto');
const User = require('../models/user');

const CLIENT_APP_URL = process.env.APP_CLIENT_URL || 'http://localhost:5173/user-friends';

const startFacebookLogin = async (req, res, next) => {
  try {
    const state = crypto.randomBytes(16).toString('hex');

    await User.findByIdAndUpdate(req.user.id, {
      facebookAuthState: state,
    });

    res.json({ state });
  } catch (error) {
    next(error);
  }
};

const getCallback = async (req, res, next) => {
  try {
    const code = req.query.code;
    const state = req.query.state;

    if (!code) {
      return res.status(400).send('Missing authorization code');
    }

    if (!state) {
      return res.status(400).send('Missing state parameter');
    }

    console.log('Facebook callback code:', code);

    const user = await User.findOne({ facebookAuthState: state });

    if (!user) {
      return res.status(400).send('Invalid state parameter');
    }

    const tokenData = await getAccessToken(code);
    console.log('Facebook token response received');

    if (!tokenData || !tokenData.access_token) {
      console.error('No access_token in token response', tokenData);
      return res.status(500).send('Failed to obtain access token');
    }

    user.facebookAccessToken = tokenData.access_token;
    user.facebookAuthState = null;
    await user.save();

    return res.redirect(CLIENT_APP_URL);
  } catch (error) {
    console.error('Error in Facebook callback:', error);
    next(error);
  }
};

const getAccessToken = async (authorizationCode) => {
  const TOKEN_ENDPOINT = 'https://graph.facebook.com/v2.5/oauth/access_token';
  const REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:3000/api/callback'; // must match what you used in the Facebook redirect
  const CLIENT_ID = process.env.FACEBOOK_APP_ID;
  const CLIENT_SECRET = process.env.FACEBOOK_APP_SECRET;

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Missing FACEBOOK_APP_ID or FACEBOOK_APP_SECRET');
  }

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    code: authorizationCode,
    // grant_type is optional for Facebook, but explicit is fine
    grant_type: 'authorization_code',
  }).toString();

  console.log('Exchanging Facebook code using REDIRECT_URI:', REDIRECT_URI);

  const encodedClientCredentials = Buffer.from(
    `${CLIENT_ID}:${CLIENT_SECRET}`
  ).toString('base64');

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${encodedClientCredentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Facebook token request failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(`Facebook token error: ${data.error.message || 'Unknown error'}`);
  }

  return data; // { access_token, token_type, expires_in }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    console.log('User:', user);
    console.log('User facebookAccessToken:', user.facebookAccessToken);
    if (!user || !user.facebookAccessToken) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    const response = await fetch('https://graph.facebook.com/v2.5/me?fields=name', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${user.facebookAccessToken}`,
      },
    });

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    next(error);
  }
};

const getFriends = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || !user.facebookAccessToken) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    const response = await fetch('https://graph.facebook.com/v2.5/me/friends?limit=25&fields=id,name,picture', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${user.facebookAccessToken}`,
      },
    });

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startFacebookLogin,
  getCallback,
  getAccessToken,
  getProfile,
  getFriends,
};