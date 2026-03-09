# GymBro Management System

A comprehensive web application for managing gym operations, including member management, trainer scheduling, equipment tracking, and class booking. Designed with a modern, brutalist UI using Tailwind CSS.

## 🚀 Features

### For Members (Front Office)
- **User Dashboard**: View personal training schedule and upcoming sessions.
- **Booking System**: Real-time availability check for trainers and equipment.
- **Profile Management**: View membership status, history, and personal details.
- **Responsive Design**: Optimized for desktop and mobile devices.

### For Administrators (Back Office)
- **Dashboard**: High-level overview of daily activities, member stats, and quick actions.
- **Member Management**: full CRUD operations for member profiles.
- **Trainer Management**: Manage trainer profiles, specialties, and schedules.
- **Equipment Management**: Track equipment inventory and maintenance status.
- **Session Management**: Oversee all training sessions and bookings.
- **System Logs**: Audit trail of system activities and administrative actions.

## 🛠 Tech Stack

- **Frontend**: 
  - [EJS](https://ejs.co/) (Embedded JavaScript templating)
  - [Tailwind CSS](https://tailwindcss.com/) (Utility-first CSS framework)
  - Vanilla JavaScript (DOM manipulation, Fetch API)
- **Backend**: 
  - [Node.js](https://nodejs.org/) (Runtime environment)
  - [Express.js](https://expressjs.com/) (Web framework)
  - [Sequelize](https://sequelize.org/) (ORM for PostgreSQL)
- **Database**: 
  - [PostgreSQL](https://www.postgresql.org/) (Relational database)

## 📋 Prerequisites

Ensure you have the following installed on your local machine:
- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **Git**

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Shinnamon-Roll/GymBro.git
cd GymBro
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with your database configuration:
```env
DATABASE_URL=postgres://username:password@localhost:5432/gymbro_db
PORT=3000
```
> Note: If you don't provide a `.env` file, the system defaults to a development cloud database.

Start the backend server:
```bash
npm run dev
# Server will start on http://localhost:3000
```

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies:
```bash
cd frontend
npm install
```

Start the frontend server:
```bash
npm start
# Frontend will be available at http://localhost:5500
```

### 4. Database Initialization
The application uses Sequelize for ORM. The database schema includes tables for:
- `Customers`
- `Trainers`
- `GymEquipments`
- `TrainingSessions`

If you need to manually initialize the database, you can use the provided `schema.sql` file in the `backend/` directory.

## 📂 Project Structure

```
GymBro/
├── backend/            # API Server, Database Models, and Business Logic
│   ├── middleware/     # Validation and Auth Middleware
│   ├── db.js           # Database Connection & Models
│   ├── server.js       # Main Express Application
│   └── schema.sql      # SQL Schema for reference
├── frontend/           # UI Application
│   ├── views/          # EJS Templates (HTML views)
│   ├── js/             # Client-side JavaScript
│   ├── src/            # Tailwind CSS Source
│   └── server.js       # Frontend Static Server
├── laTex/              # Project Documentation & Reports
└── README.md           # Project Documentation
```

## 👥 Team Members

| Name | Student ID |
|------|------------|
| นายเมธัส ทองจันทร์ | 6606022610030 |
| นายนพคุณ เหล่าอิ่มจันทร์ | 6606022610013 |
| นายกาญจน์ชญา สู่สุข | 6606022610048 |
| นางสาวทิพย์สุดา สังข์เงิน | 6606022620060 |

---

**Course**: Full Stack Web Development (Semester 2/2025)  
**Deadline**: March 9, 2026
