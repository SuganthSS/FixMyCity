import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './server/models/User.js';

dotenv.config();

const verifyAdminUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fixmycity');
        console.log('MongoDB Connected');

        const adminEmail = 'admin@example.com';
        let admin = await User.findOne({ email: adminEmail }).select('+password');

        if (!admin) {
            console.log('Admin user not found! Creating one...');
            admin = await User.create({
                name: 'Admin',
                email: adminEmail,
                password: 'admin123',
                role: 'admin',
                isApproved: true,
                isBanned: false
            });
            console.log('Admin user created successfully.');
        } else {
            console.log('Admin user found.');
            console.log('Role:', admin.role);
            console.log('isApproved:', admin.isApproved);
            console.log('isBanned:', admin.isBanned);
            console.log('Password hash starts with $2b$ or $2a$:', admin.password.startsWith('$2b$') || admin.password.startsWith('$2a$'));

            const isMatch = await bcrypt.compare('admin123', admin.password);
            if (!isMatch) {
                console.log('Password does not match, resetting it.');
                admin.password = 'admin123'; // Will be hashed by pre-save hook
                await admin.save();
                console.log('Admin password reset successfully.');
            } else {
                console.log('Admin password matches admin123. All good.');
            }
        }
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

verifyAdminUser();
