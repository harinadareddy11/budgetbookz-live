<div align="center">

# 📚 BudgetBookz

### Smart Student Book Marketplace

**Books That Fit Your Budget.**

Buy • Sell • Exchange • Donate

*AI-powered pricing. Local connections. Secure trading.*

[![Live App](https://img.shields.io/badge/🌍%20Live%20App-budgetbookz-blue?style=for-the-badge)](https://budgetbookz-978b8.web.app)
[![React](https://img.shields.io/badge/React-TypeScript-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Hosted-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com)

</div>

---

## 🎯 What is BudgetBookz?

**BudgetBookz** is a modern student-focused book marketplace built to make buying and selling academic books smarter, faster, and more affordable. It allows students to:

- 💰 Buy used books at affordable prices
- 📚 Sell old textbooks with AI price suggestions
- 🔁 Exchange books without spending money
- 🎁 Donate books to verified organizations
- 💬 Chat securely with buyers and sellers

Built using a scalable cloud architecture powered by **Firebase**.

---

## ✨ Core Features

<details>
<summary>🛒 <strong>Buy & Sell Books</strong></summary>

- Add book listings with images
- Smart category & price filters
- AI-based price suggestions
- View count tracking
- Edit, delete, and mark as sold

</details>

<details>
<summary>🔁 <strong>Exchange System</strong></summary>

- Send exchange proposals
- Accept or reject swaps
- Track sent & received requests
- Arrange exchange via chat

</details>

<details>
<summary>💬 <strong>Real-Time Chat</strong></summary>

- Firebase-powered chat system
- Secure buyer ↔ seller communication
- Organized conversation threads

</details>

<details>
<summary>🤖 <strong>AI Book Assistant</strong></summary>

- Natural language book search
- Class-based smart suggestions
- Intelligent filtering

</details>

<details>
<summary>🎁 <strong>Donation Module</strong></summary>

- Donate books to organizations
- Submit donation requests
- Organization verification system

</details>

<details>
<summary>🛡 <strong>Admin Dashboard</strong></summary>

- Manage users
- Monitor listings
- Maintain platform quality

</details>

---

## 🌟 Why BudgetBookz?

| Feature | Benefit |
|:--------|:--------|
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
|:-----------|:--------|
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
```
Frontend (React + TypeScript)
          ⬇
Firebase Authentication
          ⬇
Cloud Firestore Database
          ⬇
   Firebase Storage
          ⬇
  Firebase Hosting
```

This ensures:
- ⚡ Real-time updates
- 🔐 Secure authentication
- ☁️ Cloud scalability
- 🚀 High performance

---

## 🚀 Quick Start

### 📦 Step 1 — Clone the Repository
```bash
git clone https://github.com/harinadareddy11/budgetbookz-live.git
cd budgetbookz-live
```

### 📥 Step 2 — Install Dependencies
```bash
npm install
```

### ⚙️ Step 3 — Configure Firebase

Create a Firebase project and add your config inside `src/config/firebase.ts`:
```typescript
const firebaseConfig = {
  apiKey: "your_api_key",
  authDomain: "your_project.firebaseapp.com",
  projectId: "your_project_id",
  storageBucket: "your_project.appspot.com",
  messagingSenderId: "your_sender_id",
  appId: "your_app_id"
};
```

### ▶️ Step 4 — Run Development Server
```bash
npm run dev
```

> Open: [http://localhost:5173](http://localhost:5173)

### 🏁 Step 5 — Build & Deploy
```bash
npm run build
firebase deploy
```

---

## 📁 Project Structure
```
BudgetBookz/
├── public/
│   └── images/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── context/
│   ├── config/
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
├── firebase.json
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🔐 Security Features

- 🔥 Firebase Authentication (Email & Phone)
- 🛡 Firestore security rules
- 🔒 Secure storage rules
- 💬 Private messaging system
- ✅ Verified donation system

---

## 🌍 Live Deployment

> 🚀 Hosted on Firebase Hosting
>
> 🔗 **[https://budgetbookz-978b8.web.app](https://budgetbookz-978b8.web.app)**

---

## 🤝 Contributing

Contributions are welcome! Follow these steps:

**1. Fork the repository**

**2. Create your feature branch**
```bash
git checkout -b feature/AmazingFeature
```

**3. Commit your changes**
```bash
git commit -m "Add AmazingFeature"
```

**4. Push to the branch**
```bash
git push origin feature/AmazingFeature
```

**5. Open a Pull Request**

---

## 👨‍💻 Author

**Hari Nadar Reddy**

[![GitHub](https://img.shields.io/badge/GitHub-harinadareddy11-181717?style=flat&logo=github)](https://github.com/harinadareddy11)

---

<div align="center">

Built with ❤️ to reduce student book costs and build smarter academic communities.

⭐ **Star this repository if BudgetBookz helped you!**

*Making books affordable, one student at a time.* 📚✨

</div>
