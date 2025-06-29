import { ObjectId } from 'mongodb';
import { getDatabase } from '../config/database.js';

export class Transaction {
  constructor(transactionData) {
    this.user_id = transactionData.user_id;
    this.user_name = transactionData.user_name;
    this.amount = transactionData.amount;
    this.category = transactionData.category;
    this.status = transactionData.status || 'Completed';
    this.date = transactionData.date || new Date().toISOString();
    this.user_profile = transactionData.user_profile;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static getCollection() {
    const db = getDatabase();
    return db.collection('data');
  }

  async save() {
    const collection = Transaction.getCollection();
    const result = await collection.insertOne(this);
    return result;
  }

  static async find(query = {}, options = {}) {
    const collection = Transaction.getCollection();
    return await collection.find(query, options).toArray();
  }

  static async findWithPagination(query = {}, page = 1, limit = 10) {
    const collection = Transaction.getCollection();
    const total = await collection.countDocuments(query);
    const transactions = await collection
      .find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return { transactions, total };
  }

  static async countDocuments(query = {}) {
    const collection = Transaction.getCollection();
    return await collection.countDocuments(query);
  }

  static transformForResponse(transaction) {
    return {
      id: transaction._id.toString(),
      name: transaction.user_name || 'Unknown User',
      email: `${transaction.user_id}@example.com`,
      date: transaction.date,
      amount: transaction.amount,
      status: transaction.status || 'Completed',
      type: transaction.category === 'Revenue' ? 'Income' : 'Expense',
      category: transaction.category,
      avatar: transaction.user_profile || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
      userId: transaction.user_id,
      description: `${transaction.category} transaction`
    };
  }
}