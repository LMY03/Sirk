const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Configure Google OAuth 2.0 strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: 'your-client-id',
            clientSecret: 'your-client-secret',
            callbackURL: 'http://localhost:3000/auth/google/callback',
        },
        (accessToken, refreshToken, profile, done) => {
            // Check if the user's email is in the organization's domain
            if (profile._json.hd === 'dlsu.edu.ph') {
                return done(null, profile);
            } else {
                return done(new Error('Access denied'));
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

module.exports = passport;