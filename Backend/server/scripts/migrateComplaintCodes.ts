import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Complaint from '../models/Complaint.ts';
import connectDB from '../config/db.ts';

// Load env vars
dotenv.config();

const migrateComplaintCodes = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();

    // Find the current highest complaintCode to resume from, or start at 1001
    const lastComplaint = await Complaint.findOne({ complaintCode: { $exists: true } }).sort({ createdAt: -1 });
    let nextCodeNum = 1001;
    if (lastComplaint && lastComplaint.complaintCode) {
      const match = lastComplaint.complaintCode.match(/CMP-(\d+)/);
      if (match) {
        nextCodeNum = parseInt(match[1], 10) + 1;
      }
    }

    // Find all complaints without a complaintCode, sorted by creation date (oldest first)
    const complaintsToMigrate = await Complaint.find({ complaintCode: { $exists: false } }).sort({ createdAt: 1 });
    console.log(`Found ${complaintsToMigrate.length} complaints to migrate.`);

    let count = 0;
    for (const complaint of complaintsToMigrate) {
      const newCode = `CMP-${nextCodeNum++}`;
      complaint.complaintCode = newCode;
      await complaint.save();
      console.log(`Assigned ${newCode} to complaint ${complaint._id}`);
      count++;
    }

    console.log(`Migration complete. Updated ${count} complaints.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateComplaintCodes();
