import dotenv from "dotenv";

dotenv.config();


for (const key of ["MONGODB_URI"]) {
  if (!process.env[key]) {
    console.error(`[env] Missing required env var: ${key}`);
    console.error("[env] Copy .env.example to .env and fill in your values, then restart.");
    process.exit(1);
  }
}

export const env = {
  port: parseInt(process.env.PORT || "8000", 10),
  mongoUri: process.env.MONGODB_URI,  dbName: process.env.MONGO_DB_NAME || "News",
  collectionName: process.env.MONGO_COLLECTION_NAME || "releventNews",  corsOrigins: (process.env.CORS_ORIGINS ||
    "http://localhost:3000,https://backspaces-one.vercel.app")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
};
