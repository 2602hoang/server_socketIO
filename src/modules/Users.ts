import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  phoneNumber: string;
  email: string;
  password: string;
  createdAt: Date;
  lastLogin?: Date;
  lastLogout?: Date;
  isOnline: boolean;
  refreshToken?: string;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v: string) => /^0\d{9}$/.test(v),
      message: (props) => `${props.value} is not a valid phone number!`, // Improved message
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
  },
  lastLogout: {
    type: Date,
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
  refreshToken: { type: String },
});

const Users = mongoose.model<IUser>("Users", userSchema);

export default Users;
