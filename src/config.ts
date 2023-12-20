import dotenv from "dotenv";

dotenv.config();

export default {
  port: process.env.PORT,
  mongoDbUri: process.env.MONGO_DB_URI,
  botKey: process.env.BOT_KEY,
  metadataApiKey: process.env.METADATA_API_KEY,
};
