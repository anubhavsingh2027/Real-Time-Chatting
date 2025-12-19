# 💬 Real-Time Chatting — MERN Stack Chat Application

Welcome to **Real-Time Chatting**, a modern full-stack messaging application built using the **MERN (MongoDB, Express, React, Node.js)** stack.
It enables **instant, secure, and interactive communication** between users with a clean, intuitive UI and seamless real-time updates powered by **Socket.io**.

---

## 🚀 Live Demo

🌍 **Website:** [https://real-time-chatting.nav-code.com/](https://real-time-chatting.nav-code.com/)

🖼️ **Preview:**
![App Preview](https://real-time-chatting.nav-code.com/websiteImg.png)

---

## 💡 Overview

This app provides **real-time messaging** capabilities with advanced features like message editing, deletion, user status tracking, and custom profile management — designed for a smooth and secure chat experience.

Built with scalability and performance in mind, it demonstrates the best practices in **MERN development, WebSocket communication, and responsive React design.**

---

## ✨ Key Features

| Feature                        | Description                                                   |
| ------------------------------ | ------------------------------------------------------------- |
| ⚡ **Instant Messaging**       | Real-time chat updates using Socket.io with no refresh needed |
| 🔐 **User Authentication**     | Secure login & registration with JWT-based authentication     |
| 🧑‍💻 **Online/Offline Status**   | Live user presence tracking                                   |
| 📝 **Message Options**         | Copy, edit, delete, and reply to messages instantly           |
| 🖼️ **Media Support**           | Send and receive images in real time                          |
| 👤 **Profile Management**      | Change profile picture, name, and user details easily         |
| 🔔 **Notifications**           | Get instant alerts for new messages and user activity         |
| 💬 **Group & Private Chats**   | Start personal or group conversations seamlessly              |
| 📱 **Responsive UI**           | Optimized for desktop, tablet, and mobile                     |
| 🎨 **Modern Design**           | Clean, animated interface built with React & TailwindCSS      |
| 🧰 **Smooth Animations**       | Framer Motion transitions for elegant interactions            |
| 👆 **Swipe-to-Reply (Mobile)** | Swipe left on message to quickly reply (mobile only)          |
| 😊 **Emoji Reactions**         | React to messages with 8 different emojis                     |
| ⏱️ **Enhanced Loading**        | Beautiful 3-ring loading animation during auth                |
| 🎉 **Welcome Splash**          | Elegant 4-second welcome screen on app start                  |
| 📌 **Message Selection**       | Click arrow to select message and access all actions          |

---

## 🛠️ Tech Stack

| Layer                   | Technologies Used                    |
| ----------------------- | ------------------------------------ |
| 🖥️ **Frontend**         | React.js, TailwindCSS, Framer Motion |
| ⚙️ **Backend**          | Node.js, Express.js                  |
| 🗄️ **Database**         | MongoDB (Mongoose ORM)               |
| 🔁 **Real-Time Engine** | Socket.io                            |
| 🔐 **Authentication**   | JSON Web Tokens (JWT), bcrypt.js     |
| 📨 **Notifications**    | Browser API + Custom Event System    |
| 🌐 **Version Control**  | Git & GitHub                         |

---

## 📁 Project Structure

```
Real-Time-Chating/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js          # Authentication logic
│   │   │   └── message.controller.js       # Message CRUD operations
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js          # JWT verification
│   │   │   ├── arcjet.middleware.js        # Rate limiting & security
│   │   │   └── socket.auth.middleware.js   # Socket authentication
│   │   ├── models/
│   │   │   ├── User.js                     # User schema
│   │   │   └── Message.js                  # Message schema
│   │   ├── routes/
│   │   │   ├── auth.route.js               # Auth endpoints
│   │   │   └── message.route.js            # Message endpoints
│   │   │
│   │   ├── lib/
│   │   │   ├── db.js                       # Database connection
│   │   │   ├── env.js                      # Environment config
│   │   │   ├── socket.js                   # Socket.io setup
│   │   │   ├── arcjet.js                   # Security config
│   │   │   ├── cloudinary.js               # Image upload service
│   │   │   ├── resend.js                   # Email service
│   │   │   └── utils.js                    # Utility functions
│   │   ├── emails/
│   │   │   ├── emailHandlers.js            # Email logic
│   │   │   └── emailTemplates.js           # Email templates
│   │   └── server.js                       # Express server entry
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ActiveTabSwitch.jsx         # Tab switcher
│   │   │   ├── BorderAnimatedContainer.jsx # Animated border
│   │   │   ├── ChatContainer.jsx           # Main chat view
│   │   │   ├── ChatHeader.jsx              # Chat header with message selection
│   │   │   ├── ChatList.jsx                # List of chats
│   │   │   ├── ChatNotificationToast.jsx   # Notification toast
│   │   │   ├── ConfirmDialog.jsx           # Delete confirmation
│   │   │   ├── ContactList.jsx             # Contact selection
│   │   │   ├── MessageBubble.jsx           # Message component (swipe-to-reply)
│   │   │   ├── MessageInput.jsx            # Input & file upload
│   │   │   ├── MessageNotification.jsx     # Notification handler
│   │   │   ├── MessagesLoadingSkeleton.jsx # Loading state
│   │   │   ├── MessageViewerModal.jsx      # Full message view
│   │   │   ├── NoChatHistoryPlaceholder.jsx # Empty state
│   │   │   ├── NoChatsFound.jsx            # No results state
│   │   │   └── And So On
│   │   ├── context/
│   │   │   └── AuthContext.jsx             # Auth context
│   │   ├── hooks/
│   │   │   └── useKeyboardSound.js         # Keyboard sound effect
│   │   ├── lib/
│   │   │   ├── axios.js                    # Axios config
│   │   │   └── searchUtils.js              # Search utilities
│   │   ├── pages/
│   │   │   ├── ChatPage.jsx                # Main chat page
│   │   │   ├── LoginPage.jsx               # Login form
│   │   │   ├── SettingsPage.jsx            # Settings page
│   │   │   └── SignUpPage.jsx              # Registration form
│   │   ├── store/
│   │   │   ├── useAuthStore.js             # Auth state (Zustand)
│   │   │   ├── useChatStore.js             # Chat state (Zustand)
│   │   │   └── useSettingsStore.js         # Settings state (Zustand)
│   │   ├── App.jsx                         # Main App component
│   │   ├── main.jsx                        # React entry point
│   │   └── index.css                       # Global styles
│   ├── public/
│   │   ├── 404.html                        # 404 page
│   │   └── sounds/                         # Audio assets
│   ├── package.json
│   ├── vite.config.js                      # Vite config
│   ├── tailwind.config.js                  # TailwindCSS config
│   └── eslint.config.js                    # ESLint config
│
└── README.md
```

---

## 🔐 Authentication Flow

1. User registers or logs in securely via JWT-based authentication.
2. Access tokens are stored safely for session persistence.
3. Socket.io authenticates users during the connection handshake.
4. Real-time communication begins once validated.

---

## 🎯 Recent UI Enhancements (Latest Update)

### 1. **Enhanced Loading Animation**

- 3 concentric rotating rings (pink, cyan, purple) with different rotation speeds
- Pulsing gradient center orb
- "Connecting..." text with animated dots
- Displays during authentication verification

### 2. **Welcome Splash Screen**

- "Welcome to Real-Time Chatting" greeting
- Animated Send icon in gradient circle
- "Instant, Secure & Lightning Fast" tagline
- 4-second duration before app loads
- Smooth entrance and exit animations

### 3. **Message Selection in Chat Header**

- Click arrow (↓) on any message to select it
- Message preview appears in header with gradient background
- Quick action buttons: **Copy**, **React** (8 emojis), **Reply**, **Download**, **Delete**
- Emoji picker appears on hover for reactions
- Smooth animations and dark mode support

### 4. **Swipe-to-Reply (Mobile Only)**

- Swipe left on received messages to trigger reply
- Visual feedback: Reply icon appears with pulsing animation
- Message shifts right as you swipe
- Auto-activates reply input when swiped 80px
- Desktop: Only long-press or arrow button available

### 5. **Improved Message Interactions**

- Long-press (mobile): Shows reaction emoji picker
- Arrow button: Displays full action menu in header
- Copy to clipboard with toast notification
- Download image capability
- Delete own messages with confirmation
- Add emoji reactions to any message

---

## ⚡ Real-Time Features in Action

- Typing indicators for active conversations
- Live message delivery confirmation
- Read receipts and last-seen status
- Instant notifications for new messages
- Smooth scroll and auto-focus chat behavior

---

## 🧠 Learning Highlights

This project demonstrates:

- Implementing **real-time communication with Socket.io**
- Structuring a scalable **MERN stack** app
- Managing global state using **Zustand or Redux**
- Handling image uploads and secure authentication
- Building responsive and animated **React UIs**

---

## 📬 Connect With Me

👨‍💻 **Author:** Anubhav Singh
🌐 **Portfolio:** [https://anubhav.nav-code.com/](https://anubhav.nav-code.com/)

🐙 **GitHub:** [https://github.com/anubhavsingh2027](https://github.com/anubhavsingh2027)

💼 **LinkedIn:** [https://www.linkedin.com/in/anubhav-singh-09b71829b](https://www.linkedin.com/in/anubhav-singh-09b71829b)

---

## 🏁 Conclusion

**Real-Time Chatting** isn’t just another chat app — it’s a complete, secure, and scalable communication platform.
It merges **powerful real-time performance** with a **beautiful, user-friendly React interface**, offering a premium chat experience.

> “Code fast. Chat faster.” — _Anubhav Singh_

⭐ **Star this project** on GitHub if you like it!
