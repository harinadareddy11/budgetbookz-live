<div align="center">

# 📚 BudgetBookz – Smart Student Book Marketplace

<img src="https://img.shields.io/badge/React-18-blue.svg" />
<img src="https://img.shields.io/badge/TypeScript-4.x-blue.svg" />
<img src="https://img.shields.io/badge/Firebase-Hosting-FFCA28.svg" />
<img src="https://img.shields.io/badge/License-MIT-yellow.svg" />

**Books That Fit Your Budget.**

Buy • Sell • Exchange • Donate  
AI-powered pricing. Local connections. Secure trading.

🌍 **Live App:** https://budgetbookz-978b8.web.app  

</div>

---

## 🎯 What is BudgetBookz?

**BudgetBookz** is a modern, student-focused book marketplace built to make buying and selling academic books smarter, faster, and more affordable.

It helps students:

- 💰 Save money by buying used books locally  
- 🤝 Exchange books without spending money  
- 📚 Sell old textbooks at AI-suggested fair prices  
- 🎓 Donate books to students and organizations  

BudgetBookz isn’t just a listing app — it’s a **complete ecosystem for student book trading**, powered by Firebase and built with a scalable modern architecture.

---

## ✨ Core Features

<table>
<tr>
<td width="50%" valign="top">

### 🛒 Buy & Sell Books
- List books with images & condition
- Smart filters (Category, Class, Price, Condition)
- AI-based price suggestion
- View count tracking
- Mark as sold
- Edit & manage listings

</td>
<td width="50%" valign="top">

### 🔁 Exchange System
- Propose book swaps
- Accept / Reject exchange requests
- Track Sent & Received proposals
- Integrated chat to arrange exchange
- Zero-money trading system

</td>
</tr>

<tr>
<td width="50%" valign="top">

### 💬 Real-Time Chat
- Buyer ↔ Seller messaging
- Firebase-powered chat rooms
- Secure communication
- Organized message threads

</td>
<td width="50%" valign="top">

### 🤖 AI Book Assistant
- Natural language book search
- Smart class-based suggestions
- Instant book recommendations
- Intelligent filtering

</td>
</tr>

<tr>
<td width="50%" valign="top">

### 🎁 Donation Module
- Donate books to verified organizations
- Submit donation requests
- Organization verification system

</td>
<td width="50%" valign="top">

### 🛡 Admin Dashboard
- Manage users
- Monitor listings
- Handle reports & moderation
- Maintain marketplace quality

</td>
</tr>
</table>

---

## 🌟 Why BudgetBookz?

<div align="center">

| Feature | Benefit |
|----------|----------|
| 🤖 AI Price Prediction | Sell books at fair market value |
| 📍 Location-Based Search | Find books near you |
| 🔐 Firebase Authentication | Secure login & user protection |
| 🔄 Exchange System | Trade books without spending money |
| 💬 Real-Time Chat | Easy coordination between users |
| 📱 Responsive Design | Works on mobile & desktop |
| 🌍 Firebase Hosting | Fast & scalable deployment |

</div>

---

## 🛠 Tech Stack

<div align="center">

| Technology | Purpose |
|------------|----------|
| ⚛ React + TypeScript | Frontend development |
| ⚡ Vite | Fast build tool |
| 🎨 Tailwind CSS | Modern UI styling |
| 🔥 Firebase Authentication | User login & security |
| 📦 Firebase Firestore | Real-time database |
| 🖼 Firebase Storage | Image uploads |
| 🌍 Firebase Hosting | Production deployment |
| 🧭 React Router | Navigation system |

</div>

---

## 🏗 Architecture Overview

BudgetBookz follows a modern cloud-based architecture:

Frontend (React + TypeScript)  
⬇  
Firebase Authentication  
⬇  
Cloud Firestore (Database)  
⬇  
Firebase Storage (Book Images)  
⬇  
Firebase Hosting (Deployment)

This ensures:

- Real-time updates
- Secure authentication
- Scalable cloud storage
- High performance hosting

---

## 🚀 Quick Start (Local Setup)

### 📦 1. Clone the Repository

```bash
git clone https://github.com/harinadareddy11/budgetbookz-live.git
cd budgetbookz-live
📦 2. Install Dependencies
npm install
⚙️ 3. Add Firebase Configuration
Create a Firebase project and add your Firebase config inside:

src/config/firebase.ts
Add your Firebase credentials:

const firebaseConfig = {
  apiKey: "your_api_key",
  authDomain: "your_project.firebaseapp.com",
  projectId: "your_project_id",
  storageBucket: "your_project.appspot.com",
  messagingSenderId: "your_sender_id",
  appId: "your_app_id"
};
▶ 4. Run Development Server
npm run dev
Open:

http://localhost:5173
🏁 Production Build
npm run build
Deploy using Firebase:

firebase deploy
📁 Project Structure
BudgetBookz/
├── public/
│   ├── images/
│   ├── logo files
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── context/
│   ├── config/
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
│
├── firebase.json
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
🔐 Security Features
Firebase Auth (Email & Phone Login)

Firestore Rules

Secure Storage Rules

Private messaging system

Verified organization donations

🌍 Live Deployment
🚀 Hosted on Firebase Hosting

🔗 https://budgetbookz-978b8.web.app

🤝 Contributing
Contributions are welcome!

Fork the repository

Create a new branch

git checkout -b feature/AmazingFeature
Commit your changes

git commit -m "Add AmazingFeature"
Push your branch

git push origin feature/AmazingFeature
Open a Pull Request

👨‍💻 Author
<div align="center">
Hari Nadar Reddy


Built with ❤️ to reduce student book costs and create smarter academic communities.

</div>
<div align="center">
⭐ Star this repository if BudgetBookz helped you!
Making books affordable, one student at a time. 📚✨

</div> ```
