const jwtSecret = 'your_jwt_secret';

const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport');

/**
 * Returns a signed jtw token based on the user
 * @param {Object} user
 * @returns {string} token
 */
let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username,
    expiresIn: '7d', // specifes when the token expires, in 7 days
    algorithm: 'HS256', // algorithm used to "sign" or encode the values of JWT
  });
};

/**
 * This is the route for logging in the user
 * @param {*} router
 */
module.exports = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Something went wrong.',
          user: user,
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          req.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
};
