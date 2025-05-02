import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.js";
import generateTokens from "../utils/generateToken.js";
import env from "../config/env.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8080/api/v1/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          user = new User({
            email: profile.emails[0].value,
            username: profile.emails[0].value,
            avatarPath: profile.photos[0].value,
          });
          await user.save();
        }

        await User.findByIdAndUpdate(
          user._id,
          {
            $set: {
              googleId: profile.id,
            },
          },
          { new: true }
        );

        done(null, user);
      } catch (err) {
        console.log(err.message);
        done(null, false);
      }
    }
  )
);

export default passport;
