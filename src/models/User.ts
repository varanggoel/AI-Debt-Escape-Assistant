import bcrypt from "bcryptjs";
import mongoose, { type Model } from "mongoose";

export interface IUserDocument extends mongoose.Document {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  avatar?: string;
  createdAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUserDocument>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: {
    type: String,
    required: function (this: IUserDocument) {
      return !this.googleId;
    },
    select: false,
  },
  googleId: { type: String, sparse: true },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password as string);
};

const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model("User", userSchema);

export default User;
