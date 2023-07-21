import 'dotenv/config';
import { Request, Response } from 'express';
import { User } from '../models/user.js';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';

const secret: string | undefined = process.env.SECRET;

export const home = (req: Request, res: Response) => {
  res.status(201).json({
    message: 'Yoooo',
  });
};

export const signup = async (req: Request, res: Response) => {
  const email: string = req.body.email;
  const password: string = req.body.password;
  const confirmPassword: string = req.body.confirmPassword;

  const userCheck = await User.findOne({ email: email });
  const errors: any = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: errors.errors[0].msg,
    });
  }

  if (!userCheck && errors.isEmpty() && password === confirmPassword) {
    const hashedPassword = await bcrypt.hash(password, 12);
    const token = jwt.sign(
      {
        email: email,
      },
      secret!,
      { expiresIn: '1h' }
    );
    const user = new User({
      email: email,
      password: hashedPassword,
      authToken: token,
    });
    await user.save();
    res.status(201).json({
      message: 'Success',
      userId: user._id.toString(),
      token: token,
      email: email,
      watchlist: '',
    });
  }
};

export const login = async (req: Request, res: Response) => {
  const email: string = req.body.email;
  const password: string = req.body.password;
  const errors: any = validationResult(req);

  try {
    const user = await User.findOne({ email: email });

    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: errors.errors[0].msg,
      });
    }

    if (!user) {
      return res.status(422).json({
        message: 'No User found.',
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(422).json({
        message: 'Wrong password. Please try again.',
      });
    }

    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      secret!,
      { expiresIn: '1h' }
    );
    user.authToken = token;
    await user.save();

    res.status(200).json({
      message: 'Successfully logged in.',
      token: token,
      email: user.email,
      userId: user._id.toString(),
      watchlist: user.watchlist,
    });
  } catch (err) {
    console.log(err);
  }
};

export const addToWatchlist = async (req: Request, res: Response) => {
  const userId: string = req.body.userId;
  const coinId: string = req.body.coinId;

  const user = await User.findById(userId);
  const exist = user?.watchlist.includes(coinId);
  if (exist) {
    return res.status(201).json({
      message: 'Coin is already in the watchlist',
    });
  }
  user?.watchlist.push(coinId);
  await user?.save();

  res.status(201).json({
    message: 'Successfully added to the Watchlist',
  });
};

export const getWatchlist = async (req: Request, res: Response) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return;
    }
    res.status(200).json({
      message: 'User watchlist',
      watchlist: user.watchlist,
    });
  } catch (err) {
    res.status(404).json({
      message: 'User not found',
    });
  }
};

export const deleteFromWatchlist = async (req: Request, res: Response) => {
  const userId: string = req.body.userId;
  const coinId: string = req.body.coinId;

  const user = await User.findById(userId);
  const result = user?.watchlist.filter((coin) => coin !== coinId);
  if (!user) {
    return;
  }
  user.watchlist = result as any;

  await user?.save();
  res.status(200).json({
    message: 'Successfully deleted coin from watchlist.',
    watchlist: result,
  });
};

export const logout = async (req, res: Response) => {
  const userId = req.body.userId;
  console.log(userId);

  const user = await User.findById(userId);
  if (!user) {
    return res.status(400).json({
      message: 'No access',
      errorMessage: true,
    });
  }
  user.authToken = '';
  await user.save();

  res.status(201).json({
    message: 'Successful logout.',
    errorMessage: false,
  });
};
