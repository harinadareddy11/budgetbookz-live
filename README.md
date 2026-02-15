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

**BudgetBookz** is a modern student-focused book marketplace built to make buying and selling academic books smarter, faster, and more affordable.

It allows students to:

- 💰 Buy used books at affordable prices  
- 📚 Sell old textbooks with AI price suggestions  
- 🔁 Exchange books without spending money  
- 🎁 Donate books to verified organizations  
- 💬 Chat securely with buyers and sellers  

It is built using a scalable cloud architecture powered by **Firebase**.

---

## ✨ Core Features

### 🛒 Buy & Sell Books
- Add book listings with images
- Smart category & price filters
- AI-based price suggestions
- View count tracking
- Edit, delete, and mark as sold

### 🔁 Exchange System
- Send exchange proposals
- Accept or reject swaps
- Track sent & received requests
- Arrange exchange via chat

### 💬 Real-Time Chat
- Firebase-powered chat system
- Secure buyer ↔ seller communication
- Organized conversation threads

### 🤖 AI Book Assistant
- Natural language book search
- Class-based smart suggestions
- Intelligent filtering

### 🎁 Donation Module
- Donate books to organizations
- Submit donation requests
- Organization verification system

### 🛡 Admin Dashboard
- Manage users
- Monitor listings
- Maintain platform quality

---

## 🌟 Why BudgetBookz?

| Feature | Benefit |
|----------|----------|
| 🤖 AI Price Prediction | Fair market pricing |
| 📍 Location-Based Search | Find books near you |
| 🔐 Firebase Authentication | Secure login system |
| 🔄 Exchange System | Trade books without money |
| 💬 Real-Time Chat | Easy coordination |
| 📱 Responsive UI | Works on all devices |
| 🌍 Firebase Hosting | Fast production deployment |

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|----------|
| ⚛ React + TypeScript | Frontend |
| ⚡ Vite | Build tool |
| 🎨 Tailwind CSS | Styling |
| 🔥 Firebase Auth | Authentication |
| 📦 Firestore | Database |
| 🖼 Firebase Storage | Image uploads |
| 🌍 Firebase Hosting | Deployment |
| 🧭 React Router | Navigation |

---

## 🏗 Architecture Overview

Frontend (React + TypeScript)  
⬇  
Firebase Authentication  
⬇  
Cloud Firestore Database  
⬇  
Firebase Storage  
⬇  
Firebase Hosting  

This ensures:

- Real-time updates
- Secure authentication
- Cloud scalability
- High performance

---

# 🚀 Quick Start (Local Setup)

## 📦 1. Clone the Repository

```bash
git clone https://github.com/harinadareddy11/budgetbookz-live.git
cd budgetbookz-live

📦 2. Install Dependencies
npm install

⚙️ 3. Add Firebase Configuration

Create a Firebase project and add your Firebase config inside:

src/config/firebase.ts


Add your credentials:

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


Deploy:

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

Firebase Authentication (Email & Phone)

Firestore security rules

Secure storage rules

Private messaging system

Verified donation system

🌍 Live Deployment

🚀 Hosted on Firebase Hosting

🔗 https://budgetbookz-978b8.web.app

🤝 Contributing

Contributions are welcome!

Steps:

Fork the repository

Create a branch

git checkout -b feature/AmazingFeature


Commit changes

git commit -m "Add AmazingFeature"


Push branch

git push origin feature/AmazingFeature


Open a Pull Request

👨‍💻 Author
<div align="center">

Hari Nadar Reddy

GitHub

Built with ❤️ to reduce student book costs and build smarter academic communities.

</div>
<div align="center">
⭐ Star this repository if BudgetBookz helped you!

Making books affordable, one student at a time. 📚✨

</div> ```
