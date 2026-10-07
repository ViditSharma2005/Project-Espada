import { MongoClient } from "mongodb";
import { env } from "./env.js";

let client = null;
let collection = null;


export async function connectDb() {
  client = new MongoClient(env.mongoUri, { serverSelectionTimeoutMS: 10000 });
  await client.connect();
  collection = client.db(env.dbName).collection(env.collectionName);
  console.log(`[db] Connected — ${env.dbName}.${env.collectionName}`);
}


export function getCollection() {
  if (!collection) {
    throw new Error("Database is not connected yet.");
  }
  return collection;
}


export async function closeDb() {
  if (client) {
    await client.close();
    client = null;
    collection = null;
  }
}
