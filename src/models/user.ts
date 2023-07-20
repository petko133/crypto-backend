import mongoose, { Types } from 'mongoose';
const Schema = mongoose.Schema;

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  password: string;
  authToken: string;
  watchlist: [string];
}

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  authToken: {
    type: String,
    required: false,
  },
  watchlist: {
    type: Array,
    required: false,
  },
});

export const User = mongoose.model<IUser>('User', userSchema);
