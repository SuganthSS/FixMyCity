# FixMyCity — Smart Civic Issue Reporting Platform

![FixMyCity](https://img.shields.io/badge/FixMyCity-Civic%20Platform-2563EB?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel)

> A full-stack civic issue reporting platform that empowers citizens to report public infrastructure problems and enables municipal staff to manage and resolve them efficiently.

---

## 🌐 Live Demo

- **Frontend:** [https://fix-my-city-nu.vercel.app](https://fix-my-city-nu.vercel.app)
- **Backend API:** [https://fixmycity-backend-rlbx.onrender.com](https://fixmycity-backend-rlbx.onrender.com)(API endpoint — not a user-facing URL)

---

## ✨ Features

### 👤 Citizen Features
- Register and log in securely
- Report civic issues with title, description, category, image, location (map pin), landmark, issue date, and recurring issue flag
- Track complaint status in real time
- View complaint timeline with status history
- Upvote community complaints to increase priority automatically
- Browse public feed sorted by proximity and upvotes
- Receive in-app notifications on complaint updates
- Multi-language support (English, Tamil, Hindi, Malayalam, Telugu)

### 🛠️ Staff Features
- View and manage all assigned complaints
- Update complaint status and department
- View complaints on an interactive map with color-coded markers
- See upvote counts to prioritize high-demand issues

### 🔧 Admin Features
- Full system oversight and analytics dashboard
- Approve or ban staff accounts
- Manage citizen accounts
- View complaints by category with charts
- Status distribution visualization
- Staff performance analytics
- Map view of all active complaints

### 🗺️ Map Features
- Interactive Leaflet map restricted to India
- Color-coded complaint markers by status
- Status legend (Submitted, Under Review, In Progress, Resolved, Rejected)
- Marker click info panel with complaint details
- Location selection for new reports

### 🔔 Notification System
- Automatic in-app notifications on complaint status updates
- Unread count badge on notification bell
- Mark individual or all notifications as read

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
│   │   ├── app/                  # Page components
│   │   │   ├── CitizenDashboard.tsx
│   │   │   ├── StaffDashboard.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── ReportIssue.tsx
│   │   │   ├── MyComplaints.tsx
│   │   │   ├── PublicFeed.tsx
│   │   │   ├── LandingPage.tsx
│   │   │   └── ...
│   │   ├── components/           # Reusable components
│   │   │   ├── Layout.tsx
│   │   │   ├── ComplaintsMapView.tsx
│   │   │   ├── LanguageSwitcher.tsx
│   │   │   └── ...
│   │   ├── context/              # React context
│   │   │   ├── AuthContext.tsx
│   │   │   └── ComplaintContext.tsx
│   │   ├── services/             # API service functions
│   │   ├── locales/              # Translation files
│   │   │   ├── en/
│   │   │   ├── ta/
│   │   │   ├── hi/
│   │   │   ├── ml/
│   │   │   └── te/
│   │   ├── types.ts              # TypeScript interfaces
│   │   ├── App.tsx               # Routes
│   │   └── main.tsx
│   └── package.json
│
├── Backend/
│   └── server/
│       ├── config/               # DB connection
│       ├── controllers/          # Route handlers
│       │   ├── authController.ts
│       │   ├── complaintController.ts
│       │   └── notificationController.ts
│       ├── middleware/           # Auth middleware
│       ├── models/               # Mongoose schemas
│       │   ├── User.ts
│       │   ├── Complaint.ts
│       │   └── Notification.ts
│       ├── routes/               # API routes
│       └── server.ts             # Entry point
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
git clone https://github.com/your-username/fixmycity.git
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
| GET | `/api/complaints` | Get all complaints (staff/admin) |
| GET | `/api/complaints/public` | Get public complaints feed |
| POST | `/api/complaints` | Create new complaint |
| PATCH | `/api/complaints/:id/status` | Update complaint status |
| PATCH | `/api/complaints/:id/department` | Assign department |
| PATCH | `/api/complaints/:id/priority` | Update priority |
| PATCH | `/api/complaints/:id/upvote` | Toggle upvote on complaint |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/users` | Get all users |
| PATCH | `/api/admin/approve-staff/:id` | Approve staff account |
| PATCH | `/api/admin/ban-user/:id` | Ban a user |
| PATCH | `/api/admin/unban-user/:id` | Unban a user |

### Notifications
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications` | Get user notifications |
| PATCH | `/api/notifications/:id/read` | Mark notification as read |
| PATCH | `/api/notifications/read-all` | Mark all notifications as read |

---

## 👥 Roles and Permissions

| Feature | Citizen | Staff | Admin |
|---|:---:|:---:|:---:|
| Report issues | ✅ | ❌ | ❌ |
| View own complaints | ✅ | ❌ | ❌ |
| View public feed | ✅ | ❌ | ❌ |
| Upvote complaints | ✅ | ❌ | ❌ |
| Receive notifications | ✅ | ❌ | ❌ |
| View all complaints | ❌ | ✅ | ✅ |
| Update complaint status | ❌ | ✅ | ✅ |
| Assign departments | ❌ | ✅ | ✅ |
| View map view | ❌ | ✅ | ✅ |
| View reporter identity | ❌ | ❌ | ✅ |
| Approve staff accounts | ❌ | ❌ | ✅ |
| Ban/unban users | ❌ | ❌ | ✅ |
| View analytics | ❌ | ❌ | ✅ |

---

## 🗄️ Database Schema

### User
```
name, email, password, role, isApproved, isBanned, createdAt
```

### Complaint
```
title, description, category, status, priority, department,
location, latitude, longitude, imageUrl, landmark, issueDate,
recurringIssue, upvotes[], createdBy, timeline[], createdAt
```

### Notification
```
user, title, message, isRead, complaint, createdAt
```

---

## 🔮 Future Roadmap

- [ ] Complaint heatmap on map view
- [ ] Staff performance analytics
- [ ] Public transparency dashboard
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Offline complaint capture
- [ ] Government department API integration
- [ ] AI-powered image issue detection

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

- GitHub: [SuganthSS](https://github.com/SuganthSS)
- Project: [FixMyCity](https://fix-my-city-nu.vercel.app)

---

> *"Working together for a cleaner city"* 🏙️
