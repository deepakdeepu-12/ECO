import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../features/auth/auth.model';

// Configure Google OAuth Strategy
export const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email found in Google profile'), undefined);
          }

          // Check if user exists
          let user = await User.findOne({ email: email.toLowerCase() });

          if (user) {
            // User exists - update googleId if not set
            if (!user.googleId) {
              user.googleId = profile.id;
              user.isVerified = true; // Google accounts are pre-verified
              if (profile.photos?.[0]?.value && !user.avatar) {
                user.avatar = profile.photos[0].value;
              }
              await user.save();
            }
          } else {
            // Create new user
            user = await User.create({
              googleId: profile.id,
              email: email.toLowerCase(),
              name: profile.displayName || email.split('@')[0],
              avatar: profile.photos?.[0]?.value || null,
              isVerified: true, // Google accounts are pre-verified
              greenPoints: 100,
              totalRecycled: 0,
              carbonSaved: 0,
              level: 'Eco Beginner',
            });
          }

          return done(null, user);
        } catch (error) {
          console.error('Google OAuth error:', error);
          return done(error as Error, undefined);
        }
      }
    )
  );

  // Serialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user._id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};
