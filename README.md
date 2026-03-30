# FixMyCity — Smart Civic Issue Reporting Platform

![FixMyCity](https://img.shields.io/badge/FixMyCity-Civic%20Platform-2563EB?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel)

> A full-stack civic issue reporting platform that empowers citizens to report public infrastructure problems, enables municipal staff to manage and resolve them efficiently, and gives department heads full oversight of their teams.

---

## 🌐 Live Demo

- **Frontend:** [https://fix-my-city-nu.vercel.app](https://fix-my-city-nu.vercel.app)
- **Backend API:** [https://fixmycity-backend-rlbx.onrender.com](https://fixmycity-backend-rlbx.onrender.com) *(API endpoint — not a user-facing URL)*

---

## ✨ Features

### 👤 Citizen Features
- Register and log in securely
- Report civic issues with title, description, image, location (map pin), landmark, issue date, and recurring issue flag
- Department is auto-assigned by the AI classifier — no manual category selection needed
- Track complaint status in real time with full timeline history
- Upvote community complaints to increase priority automatically
- Browse public feed sorted by proximity and upvotes
- Receive in-app notifications on complaint updates and HOD assignments
- Raise support tickets on complaints to request staff assistance
- View ticket status (OPEN / ACCEPTED / CLOSED) per complaint, grouped by complaint
- Close a ticket once the issue is resolved
- Message staff anonymously through ticket-based conversations
- View targeted admin broadcast announcements with unread badge indicator
- Multi-language support (English, Tamil, Hindi, Malayalam, Telugu)

### 🛠️ Staff Features
- View and manage only complaints assigned to them by their HOD
- Update complaint status on assigned complaints
- View assigned complaints on an interactive map
- See complaint codes (CMP-XXXX) on all complaint cards for easy reference
- Ticket Inbox — view open and accepted support tickets raised by citizens in their department
- Accept tickets (first-accept locks the ticket to that staff member)
- Communicate with citizens anonymously through ticket conversations
- Message HOD linked to a specific complaint code (CMP-XXXX)
- Receive targeted broadcast announcements and direct messages from HOD
- Unread message badge on sidebar

### 🏢 Head of Department (HOD) Features
- View all complaints for their assigned department
- Assign complaints to specific staff members within their department
- Monitor staff workload and complaint distribution in real time
- See complaint codes (CMP-XXXX) on all complaint cards
- Message specific staff members with optional complaint reference linking
- Message admin linked to a specific complaint code
- View full inbox with threaded conversation history from admin and staff
- Receive targeted broadcast announcements from admin
- One HOD per department (Road Issue, Water Leak, Streetlight Issue, Garbage Issue, Drainage Issue)
- HOD accounts created via seed script — no public registration

### 🔧 Admin Features
- Full system oversight and analytics dashboard
- Approve or ban staff accounts
- Assign departments to staff members
- Manage and view HOD accounts per department (dedicated HOD Management page)
- Manage citizen accounts
- View complaints by category with read-only department-wise oversight
- Status distribution visualization
- Map view of all active complaints
- Send targeted broadcast announcements — choose audience: Citizens Only, Staff Only, HODs Only, or Everyone
- Message specific HOD by searching complaint code (CMP-XXXX)
- View and reply to HOD messages in a threaded inbox

### 🤖 AI Complaint Classifier
- Automatically classifies complaint department based on title and description using keyword matching
- Runs on every new complaint submission — no manual category selection by citizen needed
- Sets both the category and department fields simultaneously on creation
- Instantly routes the complaint to the correct HOD queue
- Supports all 5 departments: Road Issue, Water Leak, Streetlight Issue, Garbage Issue, Drainage Issue
- Defaults to Road Issue if no keywords match

### 🎫 Ticket System
- Citizens raise support tickets on their complaints
- Ticket codes auto-generated in format TKT-0001 (auto-increment)
- All dept staff see open tickets — first to accept locks it
- Citizen identity fully hidden from staff — identified by ticket code only
- Staff identified as "Support Staff" to citizens — full anonymity both ways
- Full chat interface within each ticket conversation
- Citizens can close tickets once resolved — input disabled with closed notice
- Staff can view accepted and open tickets — tickets persist until explicitly closed
- Tickets grouped by complaint in citizen view for easy navigation

### 🗺️ Map Features
- Interactive Leaflet map restricted to India
- Color-coded complaint markers by status
- Status legend (Submitted, Under Review, In Progress, Resolved, Rejected)
- Marker click info panel with complaint details
- Location selection for new reports
- Staff map shows only their assigned complaints

### 🔔 Notification System
- Automatic in-app notifications on complaint status updates
- Notification when HOD assigns a complaint to a staff member
- Unread count badge on notification bell
- Mark individual or all notifications as read

### 💬 Messaging System

Strict communication hierarchy enforced across all roles:

| From | To | Channel |
|---|---|---|
| Citizen | Staff | Ticket conversations only |
| Staff | Citizen | Direct message or ticket reply |
| Staff | HOD | CMP code linked message |
| HOD | Staff | Direct message with optional complaint link |
| HOD | Admin | CMP code linked message |
| Admin | HOD | CMP code linked message |
| Admin | Citizens / Staff / HODs | Targeted broadcast by audience |

- Unread message count badge on sidebar for all roles
- Thread-based conversation tracking with full history view
- HOD and Staff receive targeted announcements in dedicated Announcements tab

### 🌍 Multi-Language Support
- Language switcher on all public and citizen pages
- Supports English, Tamil, Hindi, Malayalam, and Telugu
- Language preference persists across sessions

### 🗳️ Community Upvoting
- Citizens can upvote complaints they also experience
- Auto-priority escalation based on upvote count:
  - 0–10 votes → Low
  - 11–50 votes → Medium
  - 51–100 votes → High
  - 100+ votes → Critical
- Complaints sorted by location proximity then upvote count

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| Axios | HTTP client |
| React Leaflet | Interactive maps |
| i18next | Internationalization |
| Lucide React | Icons |
| Recharts | Analytics charts |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express.js | API framework |
| TypeScript | Type safety |
| MongoDB Atlas | Database |
| Mongoose | ODM |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Multer | Image uploads |
| CORS | Cross-origin requests |

### Infrastructure
| Service | Purpose |
|---|---|
| Vercel | Frontend hosting |
| Render | Backend hosting |
| MongoDB Atlas | Database hosting |

---

## 📁 Project Structure

```
Project/
├── Frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/                        # Page components
│   │   │   ├── CitizenDashboard.tsx
│   │   │   ├── StaffDashboard.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── HODDashboard.tsx
│   │   │   ├── ReportIssue.tsx
│   │   │   ├── MyComplaints.tsx
│   │   │   ├── PublicFeed.tsx
│   │   │   ├── LandingPage.tsx
│   │   │   ├── AdminMessagesPage.tsx
│   │   │   ├── StaffMessagesPage.tsx
│   │   │   ├── CitizenMessagesPage.tsx
│   │   │   ├── HODMessagesPage.tsx
│   │   │   ├── AdminStaffPage.tsx
│   │   │   ├── AdminHODPage.tsx
│   │   │   ├── AdminUsersPage.tsx
│   │   │   ├── AdminComplaints.tsx
│   │   │   ├── AnalyticsPage.tsx
│   │   │   └── ...
│   │   ├── components/                 # Reusable components
│   │   │   ├── Layout.tsx
│   │   │   ├── ComplaintsMapView.tsx
│   │   │   ├── LanguageSwitcher.tsx
│   │   │   └── ...
│   │   ├── context/                    # React context
│   │   │   ├── AuthContext.tsx
│   │   │   └── ComplaintContext.tsx
│   │   ├── services/                   # API service functions
│   │   │   ├── api.ts
│   │   │   ├── messagesApi.ts
│   │   │   ├── ticketsApi.ts
│   │   │   └── hodApi.ts
│   │   ├── locales/                    # Translation files (5 languages)
│   │   │   ├── en/
│   │   │   ├── ta/
│   │   │   ├── hi/
│   │   │   ├── ml/
│   │   │   └── te/
│   │   ├── types.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
├── Backend/
│   └── server/
│       ├── config/                     # DB connection
│       ├── controllers/                # Route handlers
│       │   ├── authController.ts
│       │   ├── complaintController.ts
│       │   ├── notificationController.ts
│       │   ├── adminController.ts
│       │   ├── hodController.ts
│       │   └── ticketController.ts
│       ├── middleware/                 # Auth middleware
│       ├── models/                     # Mongoose schemas
│       │   ├── User.ts
│       │   ├── Complaint.ts
│       │   ├── Notification.ts
│       │   ├── Message.ts
│       │   └── Ticket.ts
│       ├── routes/                     # API routes
│       │   ├── authRoutes.ts
│       │   ├── complaintRoutes.ts
│       │   ├── adminRoutes.ts
│       │   ├── notificationRoutes.ts
│       │   ├── hodRoutes.ts
│       │   ├── messages.ts
│       │   └── ticketRoutes.ts
│       ├── scripts/
│       │   ├── migrateComplaintCodes.ts
│       │   └── seedHOD.ts
│       └── server.ts
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm or yarn
- MongoDB Atlas account
- Git

### Installation

#### 1. Clone the repository
```bash
git clone https://github.com/SuganthSS/fixmycity.git
cd fixmycity
```

#### 2. Backend Setup
```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_jwt_secret
APP_URL=http://localhost:5000
```

Start the backend server:
```bash
npm run dev
```

#### 3. Frontend Setup
```bash
cd Frontend
npm install
```

Create a `.env` file in the `Frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

---

## 🔐 Environment Variables

### Backend `.env`
| Variable | Description |
|---|---|
| `PORT` | Port for the backend server (default: 5000) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT token signing (use a strong 128-char key) |
| `APP_URL` | Backend base URL (used for image URL construction) |

### Frontend `.env`
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL (e.g. http://localhost:5000/api) |

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT token |
| GET | `/api/auth/profile` | Get current user profile |

### Complaints
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/complaints` | Get complaints (staff sees assigned only, admin/hod see all) |
| GET | `/api/complaints/public` | Get public complaints feed |
| POST | `/api/complaints` | Create new complaint (AI classifier runs automatically) |
| PATCH | `/api/complaints/:id/status` | Update complaint status |
| PATCH | `/api/complaints/:id/priority` | Update priority |
| PATCH | `/api/complaints/:id/upvote` | Toggle upvote on complaint |

### HOD
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/hod/complaints` | Get all complaints for HOD's department |
| PATCH | `/api/hod/complaints/:id/assign` | Assign complaint to a staff member |
| GET | `/api/hod/staff` | Get all staff in HOD's department |
| GET | `/api/hod/staff/workload` | Get staff workload counts |
| GET | `/api/hod/stats` | Get department complaint stats |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/users` | Get all users |
| PATCH | `/api/admin/approve-staff/:id` | Approve staff account |
| PATCH | `/api/admin/ban-user/:id` | Ban a user |
| PATCH | `/api/admin/unban-user/:id` | Unban a user |
| PATCH | `/api/admin/assign-department/:userId` | Assign department to staff |

### Messages
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/messages` | Send a message |
| GET | `/api/messages/inbox` | Get inbox (role-based and audience-filtered) |
| GET | `/api/messages/sent` | Get sent messages |
| GET | `/api/messages/thread/:threadId` | Get full message thread |
| PATCH | `/api/messages/:id/read` | Mark message as read |
| GET | `/api/messages/unread-count` | Get unread message count |
| GET | `/api/messages/find-hod` | Find HOD by department (any authenticated user) |

### Tickets
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/tickets` | Citizen raises a support ticket |
| GET | `/api/tickets/my` | Get citizen's own tickets |
| GET | `/api/tickets/department` | Get open and accepted tickets for staff's department |
| PATCH | `/api/tickets/:id/accept` | Staff accepts a ticket |
| PATCH | `/api/tickets/:id/close` | Citizen closes a ticket |
| GET | `/api/tickets/conversation/:ticketId` | Get ticket conversation thread |

### Notifications
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications` | Get user notifications |
| PATCH | `/api/notifications/:id/read` | Mark notification as read |
| PATCH | `/api/notifications/read-all` | Mark all notifications as read |

---

## 👥 Roles and Permissions

| Feature | Citizen | Staff | HOD | Admin |
|---|:---:|:---:|:---:|:---:|
| Report issues | ✅ | ❌ | ❌ | ❌ |
| AI auto-classifies department | ✅ | ❌ | ❌ | ❌ |
| View own complaints | ✅ | ❌ | ❌ | ❌ |
| View public feed | ✅ | ❌ | ❌ | ❌ |
| Upvote complaints | ✅ | ❌ | ❌ | ❌ |
| Raise and close support tickets | ✅ | ❌ | ❌ | ❌ |
| Receive notifications | ✅ | ✅ | ✅ | ❌ |
| Message staff via ticket | ✅ | ❌ | ❌ | ❌ |
| View assigned complaints only | ❌ | ✅ | ❌ | ❌ |
| Update complaint status | ❌ | ✅ | ❌ | ❌ |
| Accept support tickets | ❌ | ✅ | ❌ | ❌ |
| Message HOD (CMP linked) | ❌ | ✅ | ❌ | ❌ |
| View dept complaints | ❌ | ❌ | ✅ | ❌ |
| Assign complaints to staff | ❌ | ❌ | ✅ | ❌ |
| Monitor staff workload | ❌ | ❌ | ✅ | ❌ |
| Message staff with complaint link | ❌ | ❌ | ✅ | ❌ |
| Message admin (CMP linked) | ❌ | ❌ | ✅ | ❌ |
| View all complaints (read-only) | ❌ | ❌ | ❌ | ✅ |
| Approve/ban users | ❌ | ❌ | ❌ | ✅ |
| Assign staff departments | ❌ | ❌ | ❌ | ✅ |
| Targeted broadcast announcements | ❌ | ❌ | ❌ | ✅ |
| Message HOD (CMP linked) | ❌ | ❌ | ❌ | ✅ |
| View analytics | ❌ | ❌ | ❌ | ✅ |

---

## 🗄️ Database Schema

### User
```
name, email, password, role (citizen/staff/hod/admin),
department, isApproved, isBanned, createdAt
```

### Complaint
```
title, description, category, status, priority, department,
complaintCode (CMP-1001), assignedTo (staff ref),
location, latitude, longitude, imageUrl, landmark, issueDate,
recurringIssue, upvotes[], citizenId, citizenName,
timeline[], createdAt, updatedAt
```

### Ticket
```
ticketCode (TKT-0001), complaintId, citizenId,
department, status (OPEN/ACCEPTED/CLOSED),
acceptedBy (staff ref), createdAt
```

### Message
```
sender, senderRole (citizen/staff/hod/admin),
recipientType (broadcast/staff/citizen/admin/hod),
recipient, complaintRef, content,
isRead, isReadBy[], thread,
targetAudience (citizens/staff/hod/all), createdAt
```

### Notification
```
user, title, message, isRead, complaint, createdAt
```

---

## 🔮 Future Roadmap

- [ ] Complaint heatmap on map view
- [ ] Staff performance analytics per HOD
- [ ] Public transparency dashboard
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Offline complaint capture (PWA)
- [ ] Government department API integration
- [ ] AI-powered image issue detection
- [ ] HOD analytics dashboard
- [ ] Citizen satisfaction rating after complaint resolution

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

- GitHub: [SuganthSS](https://github.com/SuganthSS)
- Project: [FixMyCity](https://fix-my-city-nu.vercel.app)

---

> *"Working together for a cleaner city"* 🏙️
