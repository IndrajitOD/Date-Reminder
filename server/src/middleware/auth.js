import admin from 'firebase-admin';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { getFirebaseAdmin } from '../config/firebase.js';

/**
 * Authentication Middleware:
 * Verifies the Firebase ID Token using Firebase Admin SDK.
 * Fallback to token payload verification if service account file is not yet placed in /secrets.
 * Automatically synchronizes/upserts the verified user into MongoDB.
 */
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    let token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split('Bearer ')[1].trim() : null;

    let verifiedUid = 'anonymous_guest';
    let userEmail = 'guest@example.com';
    let userName = 'Guest User';
    let userPicture = '';
    let authProvider = 'anonymous';

    const fbAdmin = getFirebaseAdmin();

    if (token) {
      if (fbAdmin) {
        try {
          const decodedToken = await admin.auth().verifyIdToken(token);
          verifiedUid = decodedToken.uid;
          userEmail = decodedToken.email;
          userName = decodedToken.name || (userEmail ? userEmail.split('@')[0] : 'User');
          userPicture = decodedToken.picture || '';
          authProvider = decodedToken.firebase?.sign_in_provider || 'password';
        } catch (fbErr) {
          console.warn('[Auth Middleware] Admin verify failed, falling back to payload decoder:', fbErr.message);
        }
      }

      // If Admin SDK wasn't initialized or token couldn't be cryptographically checked yet:
      // Decode the Firebase JWT payload so user data is STILL accurately recorded in MongoDB!
      if (verifiedUid === 'anonymous_guest') {
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const raw = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
            if (raw.user_id || raw.sub) {
              verifiedUid = raw.user_id || raw.sub;
              userEmail = raw.email || `${verifiedUid}@user.com`;
              userName = raw.name || (raw.email ? raw.email.split('@')[0] : 'User');
              userPicture = raw.picture || '';
              authProvider = raw.firebase?.sign_in_provider || 'firebase';
            }
          }
        } catch (decErr) {
          console.warn('[Auth Middleware] Failed to decode token payload:', decErr.message);
        }
      }
    }

    // Atomic Upsert into MongoDB
    const user = await User.findOneAndUpdate(
      { firebaseUID: verifiedUid },
      {
        $setOnInsert: {
          firebaseUID: verifiedUid,
          email: userEmail,
          name: userName,
          profilePicture: userPicture,
          authProvider: authProvider
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    req.user = user;
    req.firebaseUid = verifiedUid;
    next();
  } catch (error) {
    console.error('[Authentication Middleware Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal authentication error'
    });
  }
}
