const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const keys = require('../config/keys');

// get users model class(collection) from mongoose
const User = mongoose.model('users');

// user is the entity that is returned
// from the callback below (DB record)
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// id from user.id inside cookie
// req.session is used to save cookie data
passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    user && done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: keys.googleClientID,
    clientSecret: keys.googleClientSecret,
    callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    const existingUser = await User.findOne({ googleId: profile.id });
    const { googleId } = existingUser || {};

    if (!googleId) {
        // model instance - record
        const newUser = await new User({ googleId: profile.id }).save();
        done(null, newUser);
    } else {
        // null || error object if any as a first argument
        done(null, existingUser);
    }
}));