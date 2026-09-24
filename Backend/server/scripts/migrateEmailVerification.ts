import dotenv from 'dotenv';
import connectDB from '../config/db.ts';
import User from '../models/User.ts';

dotenv.config();

export const migrateNonCitizenEmailVerification = async () => {
  try {
    const result = await User.updateMany(
      {
        role: { $in: ['staff', 'hod', 'admin'] }
      },
      {
        $set: {
          isEmailVerified: true
        }
      }
    );
    console.log(`✓ Email verification migration complete: ${result.modifiedCount} non-citizen accounts updated.`);
  } catch (error) {
    console.error('⚠ Email verification migration failed:', error);
  }
};

// Standalone execution support
if (process.argv[1]?.includes('migrateEmailVerification')) {
  (async () => {
    await connectDB();
    await migrateNonCitizenEmailVerification();
    process.exit(0);
  })();
}
