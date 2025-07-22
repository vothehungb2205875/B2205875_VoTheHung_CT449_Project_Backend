const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();

// 3
passport.use(
  // Cấu hình chiến lược Google OAuth 2.0
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    // Verify callback, dùng code gửi từ Google để lấy thông tin người dùng
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = {
          googleId: profile.id,
          email: profile.emails?.[0]?.value,
          name: profile.displayName,
          avatar: profile.photos?.[0]?.value,
          provider: "google",
        };

        return done(null, user);
      } catch (err) {
        console.error("Error in Google Strategy:", err);
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
