const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: 'c:/Suganth/Project/CivicReportApp/Updated 1/Backend/.env' });

async function checkUsers() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fixmycity';
        console.log('Connecting to:', MONGODB_URI);
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
        console.error('Error in script:', error);
        process.exit(1);
    }
}

checkUsers();
