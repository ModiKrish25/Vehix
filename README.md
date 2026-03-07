# VehiX 🚗🏷️

VehiX is a modern, full-stack MERN platform uniting vehicle rentals, a new/used marketplace, and a unified digital garage. It features a sleek, glassmorphic UI, advanced interactive components like 360° vehicle spinners, and a scrollytelling homepage.

![VehiX Preview](frontend/src/assets/snow_porsche_hero.png)

## 🌟 Key Features

### User Experience & UI
- **Scrollytelling Hero Section**: An immersive, scroll-driven visual intro with dynamic text animations and parallax effects.
- **Advanced Glassmorphism**: Tailored, sleek frosted glass UI across all panels and components.
- **Interactive 360° Spinner**: Drag to inspect vehicles from all angles before buying or renting.
- **Split-Screen Comparison**: A drag-to-reveal comparison tool to view two vehicles and their specs side-by-side.
- **Responsive Animations**: Page transitions, liquid blobs, and hover effects powered by custom CSS and Tailwind.

### Platform Capabilities
- **Unified Marketplace**: Toggle seamlessly between "Rent", "Buy Used", and "Buy New" modes.
- **Digital Garage**: A consolidated user dashboard featuring recent rental bookings, saved vehicles, and pending marketplace offers.
- **Booking Flow Checkout**: A responsive, multi-step checkout mockup for processing vehicle rentals with price breakdown logic.
- **Offer Management**: Direct in-app communication for sending offers to private sellers or dealers.
- **Role-Based Access**: Specialized functionality for Customers, Sellers, Dealers, and Admins.

---

## 🛠️ Technology Stack

**Frontend**
- React 18 (Vite)
- Redux Toolkit (RTK Query for data fetching)
- Tailwind CSS v4 (Custom glass-card utilities)
- React Router DOM
- Framer Motion

**Backend**
- Node.js & Express
- MongoDB & Mongoose
- JSON Web Tokens (JWT) & HTTP-Only Cookies
- bcryptjs for password hashing
- multer for file uploads

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (Local instance or MongoDB Atlas URI)

### Installation

1. **Clone the repository** (if applicable) or download the source code.
2. **Setup the Backend**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory with the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

3. **Setup the Frontend**
   ```bash
   cd frontend
   npm install
   ```

### Running the Application

You need two terminal windows to run the frontend and backend concurrently.

**Terminal 1 (Backend)**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend)**
```bash
cd frontend
npm run dev
```

The React frontend will be available at `http://localhost:5173` while the Express server runs on `http://localhost:5000`.

---

## 🌱 Seeding the Database

To play around with the platform, you can populate your local database using the included seed scripts. **Always run the Admin seed first.**

```bash
cd backend

# 1. Create the admin user (required for other seeds)
npm run seed:admin

# 2. Seed a variety of rental and sale vehicles
npm run seed:more

# 3. Seed brand new vehicles for the 'Buy New' section
npm run seed:new
```

---

## 🗂️ Project Structure

```text
Vehix/
├── backend/
│   ├── controllers/      # Route logic (auth, vehicles, bookings, inquiries)
│   ├── middlewares/      # Error handling & JWT protection
│   ├── models/           # Mongoose schemas (User, VehicleProfile, RentalListing, etc.)
│   ├── routes/           # Express routers
│   ├── utils/            # Database seeding scripts & helpers
│   └── server.js         # Entry point for the Express API
└── frontend/
    ├── src/
    │   ├── assets/       # Static media and images
    │   ├── components/   # React components (Vehicles, Dashboard, Auth, Shared)
    │   ├── hooks/        # Custom React hooks (e.g., useScrollReveal)
    │   ├── slices/       # Redux Toolkit slices and RTK Query APIs
    │   ├── App.jsx       # Global routing and layout
    │   ├── index.css     # Global styles, Tailwind directives, and CSS animations
    │   └── main.jsx      # React entry point
    ├── vite.config.js    # Vite configuration & backend proxy
    └── package.json
```

---

<br />

> _This full-stack application was built with a mobile-first, performance-oriented design approach focusing heavily on cutting-edge visual experiences and structural scalability._
