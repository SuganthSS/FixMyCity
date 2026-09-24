import dotenv from 'dotenv';
import connectDB from '../config/db.ts';
import User from '../models/User.ts';
import crypto from 'crypto';

dotenv.config();

async function runTests() {
  await connectDB();
  console.log('--- RUNNING EMAIL VERIFICATION ROLE FILTER TESTS ---');

  const timestamp = Date.now();
  const citizenEmail = `test.citizen.${timestamp}@example.com`;
  const staffEmail = `test.staff.${timestamp}@example.com`;
  const hodEmail = `test.hod.${timestamp}@example.com`;
  const adminEmail = `test.admin.${timestamp}@example.com`;

  // 1. Test Citizen Creation
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const citizen = await User.create({
    name: 'Test Citizen',
    email: citizenEmail,
    password: 'Password123!',
    role: 'citizen',
    isEmailVerified: false,
    emailVerificationToken: hashedToken,
    emailVerificationExpires: new Date(Date.now() + 3600000),
  });

  console.log(`[TEST 1] Citizen created with isEmailVerified = ${citizen.isEmailVerified} (Expected: false)`);

  // 2. Test Staff Creation
  const staff = await User.create({
    name: 'Test Staff',
    email: staffEmail,
    password: 'Password123!',
    role: 'staff',
    isApproved: false,
    isEmailVerified: true,
  });

  console.log(`[TEST 2] Staff created with isEmailVerified = ${staff.isEmailVerified} (Expected: true)`);

  // 3. Test HOD Creation
  const hod = await User.create({
    name: 'Test HOD',
    email: hodEmail,
    password: 'Password123!',
    role: 'hod',
    isApproved: true,
    isEmailVerified: true,
  });

  console.log(`[TEST 3] HOD created with isEmailVerified = ${hod.isEmailVerified} (Expected: true)`);

  // 4. Test Admin Creation
  const admin = await User.create({
    name: 'Test Admin',
    email: adminEmail,
    password: 'Password123!',
    role: 'admin',
    isApproved: true,
    isEmailVerified: true,
  });

  console.log(`[TEST 4] Admin created with isEmailVerified = ${admin.isEmailVerified} (Expected: true)`);

  // Cleanup test users
  await User.deleteMany({ email: { $in: [citizenEmail, staffEmail, hodEmail, adminEmail] } });
  console.log('--- CLEANUP COMPLETE ---');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
