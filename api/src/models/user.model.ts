import type { User_Server } from '@shared/user.js';
import mongoose from 'mongoose';
import type { OrganizationDoc } from './org.model.js';

export interface Session {
  /** Can be seen as a session id */
  refreshToken: string;
  /** Epoch in milliseconds */
  expiredAt: number;
}
const sessionSchema = new mongoose.Schema<Session>({
  refreshToken: {
    type: String,
    required: true,
  },
  expiredAt: {
    type: Number,
    requried: true,
  },
});

export interface User extends User_Server {
  org?: mongoose.Types.ObjectId;
  session?: Session;
}
export interface User_Populated {
  org?: OrganizationDoc;
}
const userSchema = new mongoose.Schema<User>(
  {
    email: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    org: {
      type: mongoose.Types.ObjectId,
      ref: 'Organization',
    },
    session: sessionSchema,
  },
  { timestamps: true }
);
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ 'session.refreshToken': 1 }, { unique: true, sparse: true });

export const userModel = mongoose.model<User>('User', userSchema);
export type UserDoc = ConstructorReturnType<typeof userModel>;
/** Hydrated */
export type UserSubDocs = {
  session: mongoose.Types.Subdocument<
    mongoose.Types.ObjectId,
    object,
    Session
  > &
    Session;
};
