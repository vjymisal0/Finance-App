import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { getDatabase } from '../config/database.js';
import { generateAvatarUrl } from '../utils/helpers.js';

export class User {
  constructor(userData) {
    this.name = userData.name;
    this.email = userData.email;
    this.password = userData.password;
    this.role = userData.role || 'user';
    this.avatar = userData.avatar || generateAvatarUrl(userData.name);
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.isActive = true;
    this.lastLogin = null;
    this.emailVerified = false;
  }

  static getCollection() {
    const db = getDatabase();
    return db.collection('users');
  }

  async save() {
    const collection = User.getCollection();
    const result = await collection.insertOne(this);
    return result;
  }

  static async findByEmail(email) {
    const collection = User.getCollection();
    return await collection.findOne({ email: email.toLowerCase().trim() });
  }

  static async findById(id) {
    const collection = User.getCollection();
    return await collection.findOne({ _id: new ObjectId(id) });
  }

  static async updateById(id, updateData) {
    const collection = User.getCollection();
    return await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
  }

  static async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  static async createDemoUser() {
    const collection = User.getCollection();
    let demoUser = await collection.findOne({ email: 'admin@example.com' });
    
    if (!demoUser) {
      const hashedPassword = await User.hashPassword('password');
      const demoUserData = {
        name: 'Demo Admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        lastLogin: new Date(),
        emailVerified: true
      };
      
      const result = await collection.insertOne(demoUserData);
      demoUser = { ...demoUserData, _id: result.insertedId };
    }
    
    return demoUser;
  }
}