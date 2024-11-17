import dotenv from "dotenv";
dotenv.config();
const config = {
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/chat",
  JWT_SECRET: process.env.JWT_SECRET || "your_jwt_secret_key",
  SOCKET_PORT: process.env.SOCKET_PORT || 3001,
};

export default config;
