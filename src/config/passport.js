import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as GitHubStrategy } from 'passport-github2';
import bcrypt from 'bcryptjs';
import prisma from './database.js';

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        provider: true,
        createdAt: true,
      },
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Local Strategy (Email/Password)
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        if (!user.password) {
          return done(null, false, { message: 'Account registered via OAuth. Please use OAuth to login.' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Google OAuth Strategy (only if configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const providerId = profile.id;
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName || profile.name?.givenName || 'User';

        if (!email) {
          return done(new Error('No email found in Google profile'), null);
        }

        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { email },
              { providerId, provider: 'google' },
            ],
          },
        });

        if (user) {
          // Update existing user if needed
          if (user.provider !== 'google' || user.providerId !== providerId) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                provider: 'google',
                providerId,
                name,
              },
            });
          }
        } else {
          // Create new user
          user = await prisma.user.create({
            data: {
              email,
              name,
              provider: 'google',
              providerId,
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
  );
}

// Facebook OAuth Strategy (only if configured)
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL,
        profileFields: ['id', 'displayName', 'emails'],
      },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const providerId = profile.id;
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName || 'User';

        if (!email) {
          return done(new Error('No email found in Facebook profile'), null);
        }

        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { email },
              { providerId, provider: 'facebook' },
            ],
          },
        });

        if (user) {
          if (user.provider !== 'facebook' || user.providerId !== providerId) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                provider: 'facebook',
                providerId,
                name,
              },
            });
          }
        } else {
          user = await prisma.user.create({
            data: {
              email,
              name,
              provider: 'facebook',
              providerId,
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
  );
}

// GitHub OAuth Strategy (only if configured)
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
        scope: ['user:email'],
      },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const providerId = profile.id.toString();
        const email = profile.emails?.[0]?.value || profile.username + '@github.user';
        const name = profile.displayName || profile.username || 'User';

        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { email },
              { providerId, provider: 'github' },
            ],
          },
        });

        if (user) {
          if (user.provider !== 'github' || user.providerId !== providerId) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                provider: 'github',
                providerId,
                name,
              },
            });
          }
        } else {
          user = await prisma.user.create({
            data: {
              email,
              name,
              provider: 'github',
              providerId,
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
  );
}

export default passport;

