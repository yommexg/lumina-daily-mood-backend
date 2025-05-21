import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  isVerified: boolean;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      minlength: 6,
    },

    avatar: {
      type: String,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
