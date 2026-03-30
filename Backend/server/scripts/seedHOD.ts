import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.ts';
import User from '../models/User.ts';

dotenv.config();

const HOD_ACCOUNTS = [
  { email: 'hod.road@fixmycity.com', department: 'Road Issue', name: 'HOD Road' },
  { email: 'hod.water@fixmycity.com', department: 'Water Leak', name: 'HOD Water' },
  { email: 'hod.streetlight@fixmycity.com', department: 'Streetlight Issue', name: 'HOD Streetlight' },
  { email: 'hod.garbage@fixmycity.com', department: 'Garbage Issue', name: 'HOD Garbage' },
  { email: 'hod.drainage@fixmycity.com', department: 'Drainage Issue', name: 'HOD Drainage' },
];

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

const seedHOD = async () => {
  try {
    console.log('--- HOD SEEDING START ---');
    console.log('Current working directory:', process.cwd());
    console.log(`Environment MONGODB_URI: ${process.env.MONGODB_URI ? 'FOUND (masked)' : 'NOT FOUND'}`);
    
    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connected successfully.');

    let created = 0;
    let skipped = 0;

    for (const hod of HOD_ACCOUNTS) {
      console.log(`\nChecking HOD: ${hod.email}`);
      const exists = await User.findOne({ email: hod.email });
      
      if (exists) {
        console.log(`[SKIP] ${hod.email} already exists (ID: ${exists._id})`);
        skipped++;
        continue;
      }

      console.log(`[CREATE] Creating ${hod.email}...`);
      try {
        const user = new User({
          name: hod.name,
          email: hod.email,
          password: 'hod123',
          role: 'hod',
          department: hod.department,
          isApproved: true,
          isBanned: false,
        });

        await user.save();
        console.log(`[SUCCESS] Created ${hod.email} (ID: ${user._id})`);
        created++;
      } catch (err: any) {
        console.error(`[FAILURE] Could not create ${hod.email}:`, err.message);
        if (err.errors) {
          console.error('Validation Errors:', Object.keys(err.errors).join(', '));
        }
      }
    }

    console.log(`\n--- SEED COMPLETE ---`);
    console.log(`Total Created: ${created}`);
    console.log(`Total Skipped: ${skipped}`);
    
    await mongoose.connection.close();
    console.log('Connection closed.');
    process.exit(0);
  } catch (error: any) {
    console.error('\n--- FATAL ERROR ---');
    console.error(error.message);
    process.exit(1);
  }
};

seedHOD();
