const jwtSecret = 'your_jwt_secret';

const jwt = require('jsonwebtoken'),
    passport = require('passport');

require('./passport');

let generateJWTToken = (user) => {
    return jwt.sign(user, jwtSecret, {
        subject: user.Username,
        expiresIn: '7d', // specifes when the token expires, in 7 days
        algorithm: 'HS256' // algorithm used to "sign" or encode the values of JWT
    });
}

// LOGIN endpoint, method POST
module.exports = (router) => {
    router.post('/login', (req, res) => {
        passport.authenticate('local', { session: false }, (error, user, info) => {
            if (error || !user) {
                return res.status(400).json({
                    message: 'Something went wrong.',
                    user: user 
                });
            }
            req.login(user, { session: false }, (error) => {
                if (error) {
                    req.send(error);
                }
                let token = generateJWTToken(user.toJSON());
                return res.json({ user, token });
            });
        }) (req, res);
    });
}