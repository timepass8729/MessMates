# MessMates – Smart Mess Management Hub

MessMates is a smart, digital, and scalable platform designed to manage hostel/college mess operations efficiently.  
It offers real-time menu updates, attendance tracking, feedback handling, and billing — all in one place.

---

## 🚀 Features
- **User Registration & Login** (Firebase Authentication)
- **Weekly Menu Display**
- **Feedback & Complaint Submission**
- **Leave Meal Deduction Requests**
- **Meal Attendance Tracking** (QR code-based)
- **Admin Dashboard** for:
  - Updating menus
  - Reviewing feedback
- **Monthly Bill Estimation**
- **Mobile-friendly UI** with Tailwind CSS

---

## 🛠 Tech Stack
- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS + PostCSS
- **Backend/Database:** Firebase Firestore
- **Auth:** Firebase Authentication
- **Build Tool:** Vite
- **Linting:** ESLint
- **Package Manager:** npm / bun

---

## 📂 Project Structure
```
messmate-smart-hub-main/
│── public/             # Static assets
│── src/                # Main source code
│   ├── components/     # Reusable React components
│   └── ...             # Pages, hooks, services
│── firestore.rules     # Firestore database security rules
│── tailwind.config.ts  # Tailwind configuration
│── vite.config.ts      # Vite build configuration
│── tsconfig*.json      # TypeScript configurations
│── package.json        # Dependencies & scripts
│── postcss.config.js   # PostCSS setup
│── eslint.config.js    # ESLint setup
│── README.md           # Project documentation
```

---

## ⚙️ Installation
```bash
# Clone the repository
git clone https://github.com/timepass8729/MessMates.git

# Navigate to the project directory
cd MessMates

# Install dependencies (choose one)
npm install
# OR
bun install

# Start development server
npm run dev
```

---

## 🔑 Environment Variables
Create a `.env` file in the root and add your Firebase config:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 📜 Firebase Setup
1. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** (Email/Password).
3. Set up **Firestore Database** with appropriate rules (`firestore.rules`).
4. Enable **Hosting** if deploying via Firebase.

---

## 🖥 Development
```bash
# Run linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📌 Deployment
You can deploy MessMates to:
- **Firebase Hosting**
- **Vercel**
- **Netlify**

Example for Firebase Hosting:
```bash
firebase login
firebase init hosting
firebase deploy
```

---

## 📄 License
This project is licensed under the MIT License — feel free to use and modify it.

---

## 👨‍💻 Author
Developed by **Time Pass**  
GitHub: [@timepass8729](https://github.com/timepass8729)
