import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

let db;
const client = new MongoClient(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export const connectToDatabase = async () => {
  try {
    await client.connect();
    db = client.db(process.env.DB_NAME || 'financeappcluster');
    console.log('✅ Connected to MongoDB Atlas');
    
    // Create indexes for better performance and data integrity
    try {
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      await db.collection('data').createIndex({ date: -1 });
      await db.collection('data').createIndex({ user_id: 1 });
      console.log('✅ Database indexes created successfully');
    } catch (indexError) {
      console.log('ℹ️ Indexes may already exist:', indexError.message);
    }
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectToDatabase first.');
  }
  return db;
};

export const closeDatabase = async () => {
  try {
    await client.close();
    console.log('✅ MongoDB connection closed');
  } catch (error) {
    console.error('❌ Error during database shutdown:', error);
  }
};