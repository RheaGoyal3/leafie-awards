const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
module.exports = (passport) => {
    passport.serializeUser((user, done) => {
        done(null, user);
    });
    passport.deserializeUser((user, done) => {
        done(null, user);
    });
    passport.use(new GoogleStrategy({
        clientID: "136134024438-hi6t6ev829k0h3hs5gisruslmla7gpdg.apps.googleusercontent.com",
        clientSecret: "OFHdb04wfWVo8oIZQGfluv0E",
        callbackURL: 'http://localhost:8080/auth/google/callback'
    },
    (token, refreshToken, profile, done) => {
        return done(null, {
            profile: profile,
            token: token
        });
    }));
};
