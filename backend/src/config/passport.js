import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        "https://capstone-backend-c557.onrender.com/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = {
          id: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          photo: profile.photos[0].value,
        };

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;
