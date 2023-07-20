import express from 'express';
import {
  home,
  login,
  signup,
  logout,
  addToWatchlist,
  deleteFromWatchlist,
  getWatchlist,
} from '../controller/auth.js';
import { isAuth } from '../middleware/isAuth.js';
import { body } from 'express-validator';
import { User } from '../models/user.js';

export const router = express.Router();

router.get('/', home);

router.post(
  '/signup',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject('E-Mail address already exists!');
          }
        });
      })
      .normalizeEmail(),
    body('password')
      .trim()
      .isLength({ min: 6, max: 50 })
      .withMessage('Password must be between 6 and 50 characters'),
    body('confirmPassword')
      .trim()
      .isLength({ min: 6, max: 50 })
      .withMessage('Passwords do not match'),
  ],
  isAuth,
  signup
);

router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail(),
    body('password')
      .trim()
      .isLength({ min: 6, max: 50 })
      .withMessage('Wrong password'),
  ],
  login
);

router.post('/logout', logout);

router.post('/coin/:id', addToWatchlist);

router.post('/delete', deleteFromWatchlist);

router.get('/watchlist/:id', getWatchlist);
