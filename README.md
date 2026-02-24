# TARS Chat Application

A premium, full-stack real-time chat application built with Next.js, Convex, and Clerk. This project was developed as part of the Tars Fullstack Engineer Internship Coding Challenge 2026.

## 🚀 Features

### Core Functionality
- **Authentication**: Secure sign-up/login via Clerk (Email & Social).
- **Real-time Messaging**: Instant message delivery using Convex subscriptions.
- **Presence System**: Real-time online/offline indicators with a green-dot system.
- **Typing Indicators**: Pulsing "Alex is typing..." animations that fade after 2 seconds.
- **Unread Tracking**: Real-time badges for unread messages that clear automatically.

### Advanced Chat Experience
- **Group Chats**: Create multi-user conversations with custom names and member counts.
- **Smart Scrolling**: Intelligent auto-scroll with a "New Messages" snap button.
- **Reactions**: Interactive emoji reactions with live counts.
- **Soft Deletes**: Ability to delete own messages (replaces content with "This message was deleted").
- **Timestamps**: Context-aware formatting (e.g., Today: 2:34 PM, Older: Feb 15, 2:34 PM).

### UI/UX & Design
- **Premium Interface**: Modern glassmorphism design with distinct Cyan (Sender) and Slate (Receiver) bubbles.
- **Responsive Layout**: Mobile-first design that hides the sidebar during active chats on small screens.
- **Empty States**: Helpful placeholders for search results, empty chats, and new users.
- **Loading States**: Integrated skeleton loaders and spinners for a smooth data transition.

## 🛠 Tech Stack

- **Frontend**: Next.js (App Router), Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend/Database**: Convex (Serverless functions & Real-time DB).
- **Authentication**: Clerk.

## 🏁 Getting Started

### 1. Variables Setup
Create a `.env.local` file with the following variables:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
NEXT_PUBLIC_CONVEX_URL=...
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Setup Convex
```bash
npx convex dev
```

## 📜 License

This project is licensed under the [MIT License](LICENSE).
