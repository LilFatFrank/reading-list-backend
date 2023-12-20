import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      requrired: true,
    },
    url: {
      type: String,
      requrired: true,
    },
    type: {
      type: String,
      requrired: true,
    },
    category: {
      type: String,
      requrired: true,
    },
    upVotes: Number,
  },
  {
    timestamps: true,
  }
);

const Resource = mongoose.model("Resource", resourceSchema);

export default Resource;
