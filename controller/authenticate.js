const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

exports.isAuth = function(req, res, next) {
    if (req.isAuthenticated()) return next(); // User is authenticated, continue to the next middleware
    res.redirect('/auth/google'); // User is not authenticated, redirect to the authentication page
};

exports.authenticate = passport.authenticate('google', { scope: ['profile', 'email'] });

exports.handleCallback = passport.authenticate('google', {
    failureRedirect: '/login',
    successRedirect: '/'
});

exports.logout = function(req, res) {
    req.logout();
    res.redirect('/');
}

passport.use(
    new GoogleStrategy({
        clientID: '719062248871-v6hdqo2d07n72aukgfiin8kk3mohka55.apps.googleusercontent.com',
        clientSecret: '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',
        callbackURL: 'http://localhost:3000/auth/google/callback',
    }, (accessToken, refreshToken, profile, done) => {
        // Check if the user's email is in the organization's domain
        if (profile._json.hd === 'dlsu.edu.ph') return done(null, profile);
        else return done(new Error('Access denied'));
    })
);
  
passport.serializeUser((user, done) => {
    done(null, user);
});
  
passport.deserializeUser((user, done) => {
    done(null, user);
});