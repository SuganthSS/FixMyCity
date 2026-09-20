import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Complaint from '../models/Complaint';
import { Counter } from '../models/Counter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const isDryRun = process.argv.includes('--dry-run');
const isExecute = process.argv.includes('--execute');

if (!isDryRun && !isExecute) {
  console.error('Error: Please specify either --dry-run or --execute mode.');
  process.exit(1);
}

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/fixmycity';

async function runMigration() {
  console.log(`=== STARTING COMPLAINT V2 MIGRATION (${isDryRun ? 'DRY-RUN MODE' : 'EXECUTE MODE'}) ===`);
  console.log(`Connecting to MongoDB...`);

  try {
    await mongoose.connect(MONGO_URI);
    console.log(`Connected to MongoDB successfully.`);

    const unmigratedComplaints = await Complaint.find({
      $or: [
        { schemaVersion: { $ne: 2 } },
        { schemaVersion: { $exists: false } },
        { trackingCode: { $exists: false } },
        { trackingCode: null },
      ],
    });

    console.log(`Found ${unmigratedComplaints.length} complaint(s) requiring migration.`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    const summaryReport: any[] = [];

    const currentYear = new Date().getFullYear();
    const counterKey = `complaint_tracking_${currentYear}`;

    let currentSeq = 0;
    if (isDryRun) {
      const existingCounter = await Counter.findById(counterKey);
      currentSeq = existingCounter ? existingCounter.seq : 0;
    }

    for (const doc of unmigratedComplaints) {
      try {
        let trackingCode = doc.trackingCode || doc.complaintCode;

        if (!trackingCode || !trackingCode.startsWith('FMC-')) {
          if (isExecute) {
            const counter = await Counter.findOneAndUpdate(
              { _id: counterKey },
              { $inc: { seq: 1 } },
              { new: true, upsert: true }
            );
            trackingCode = `FMC-${currentYear}-${String(counter.seq).padStart(4, '0')}`;
          } else {
            currentSeq += 1;
            trackingCode = `FMC-${currentYear}-${String(currentSeq).padStart(4, '0')}`;
          }
        }

        const legacyStatus = doc.status || 'Pending';
        let workflowStage = doc.workflowStage;
        if (!workflowStage) {
          switch (legacyStatus.toLowerCase()) {
            case 'pending':
              workflowStage = 'SUBMITTED';
              break;
            case 'in progress':
            case 'in_progress':
              workflowStage = 'IN_PROGRESS';
              break;
            case 'resolved':
              workflowStage = 'RESOLVED';
              break;
            case 'rejected':
              workflowStage = 'REJECTED';
              break;
            default:
              workflowStage = 'SUBMITTED';
          }
        }

        const assignedDepartment = doc.assignedDepartment || doc.department || null;
        const assignedStaff = doc.assignedStaff || doc.assignedTo || null;

        const media = (doc.media && doc.media.length > 0)
          ? doc.media
          : doc.imageUrl
          ? [{ url: doc.imageUrl, caption: 'Report Image', uploadedAt: doc.createdAt || new Date(), isResolutionProof: false }]
          : [];

        let coordinates: { latitude?: number; longitude?: number } = {};
        if (doc.location && doc.location.coordinates) {
          coordinates = {
            latitude: doc.location.coordinates.latitude ?? undefined,
            longitude: doc.location.coordinates.longitude ?? undefined,
          };
        } else if (doc.latitude != null && doc.longitude != null) {
          coordinates = { latitude: doc.latitude, longitude: doc.longitude };
        }

        let geoPoint = doc.geoPoint || null;
        if (!geoPoint && coordinates.latitude !== undefined && coordinates.longitude !== undefined) {
          geoPoint = {
            type: 'Point',
            coordinates: [coordinates.longitude, coordinates.latitude],
          };
        }

        const locationObj = {
          address: doc.location?.address || doc.description?.substring(0, 50) || '',
          landmark: doc.location?.landmark || doc.landmark || '',
          city: doc.location?.city || 'Default City',
          ward: doc.location?.ward || 'General',
          pincode: doc.location?.pincode || '',
          coordinates,
        };

        const statusHistory = (doc.statusHistory && doc.statusHistory.length > 0)
          ? doc.statusHistory
          : (doc.timeline && doc.timeline.length > 0)
          ? doc.timeline.map((t: any) => ({
              stage: t.status === 'Pending' ? 'SUBMITTED' : t.status === 'In Progress' ? 'IN_PROGRESS' : t.status === 'Resolved' ? 'RESOLVED' : 'SUBMITTED',
              status: t.status,
              message: t.message,
              updatedAt: t.updatedAt || new Date(),
            }))
          : [
              {
                stage: workflowStage,
                status: legacyStatus,
                message: 'Complaint submitted',
                updatedAt: doc.createdAt || new Date(),
              },
            ];

        const createdDate = doc.createdAt ? new Date(doc.createdAt) : new Date();
        const dueDate = new Date(createdDate.getTime() + 48 * 60 * 60 * 1000);
        const sla = doc.sla || {
          targetResolutionHours: 48,
          dueDate,
          isBreached: false,
        };

        const updateData: any = {
          schemaVersion: 2,
          createdByRole: doc.createdByRole || 'citizen',
          trackingCode,
          complaintCode: trackingCode,
          subCategory: doc.subCategory || 'General',
          severity: doc.severity || 'MODERATE',
          priority: doc.priority || 'MEDIUM',
          workflowStage,
          status: workflowStage,
          lastStatusChangeAt: doc.updatedAt || new Date(),
          assignedDepartment,
          department: assignedDepartment,
          assignedStaff,
          assignedTo: assignedStaff,
          media,
          location: locationObj,
          geoPoint,
          statusHistory,
          sla,
        };

        if (isExecute) {
          await Complaint.updateOne({ _id: doc._id }, { $set: updateData });
        }

        migratedCount++;
        summaryReport.push({
          id: doc._id.toString(),
          originalTitle: doc.title,
          generatedTrackingCode: trackingCode,
          mappedStage: workflowStage,
          assignedDepartment: assignedDepartment || 'Unassigned',
        });
      } catch (err: any) {
        errorCount++;
        console.error(`Failed to migrate complaint ID ${doc._id}:`, err.message);
      }
    }

    console.log('\n=== MIGRATION SUMMARY ===');
    console.log(`Mode: ${isDryRun ? 'DRY-RUN' : 'EXECUTE'}`);
    console.log(`Total Scanned: ${unmigratedComplaints.length}`);
    console.log(`Successfully Migrated/Transformed: ${migratedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log(`Errors: ${errorCount}`);

    if (summaryReport.length > 0) {
      console.log('\nSample Transformed Records (up to 5):');
      console.table(summaryReport.slice(0, 5));
    }
  } catch (error: any) {
    console.error('Migration failed with critical error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
}

runMigration();
