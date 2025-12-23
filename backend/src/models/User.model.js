import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    // later: CP platform handles
    codeforcesHandle: {
      type: String,
      default: "",
    },
    leetcodeHandle: {
      type: String,
      default: "",
    },
    codechefHandle: {
      type: String,
      default: "",
    },
    gfgHandle: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);
//here is the main for(int i=0;i<n;i++)

const User = mongoose.model("User", userSchema);

export default User;
