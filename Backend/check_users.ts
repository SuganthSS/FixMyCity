import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: 'c:/Suganth/Project/CivicReportApp/Updated 1/Backend/.env' });

const checkUsers = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fixmycity';
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const User = mongoose.model('User', new mongoose.Schema({
            email: String,
            role: String,
            isApproved: Boolean,
            isBanned: Boolean
        }));

        const users = await User.find({}, 'email role isApproved isBanned');
        console.log('Current Users:', JSON.stringify(users, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUsers();
