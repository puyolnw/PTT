# 🧱 To‑Do List — React + Vite (PTT Theme Project)

## 🎯 เป้าหมาย
สร้างโปรเจกต์ใหม่ด้วย **React + Vite (TypeScript)** โดยมี 2 Layout หลักสำหรับระบบเว็บธีม PTT

1. **LayoutAuth** — หน้า Pre-login (พื้นหลังเรียบ + ปุ่ม Login)
2. **LayoutUser** — หน้า Layout หลัง Login มี Sidebar ไอคอนล้วน + Navbar ไม่มี Search + พื้น Ink สีหมึกเข้ม (ไม่ดำสนิท) ตาม `agent.md`

---

## ⚙️ ขั้นตอนการสร้างโปรเจกต์ใหม่

### 1. สร้างโปรเจกต์
```bash
npm create vite@latest my-ptt-app -- --template react-ts
cd my-ptt-app
npm install
```

### 2. ติดตั้ง dependencies ที่จำเป็น
```bash
npm i tailwindcss @shadcn/ui lucide-react framer-motion react-router-dom class-variance-authority clsx
npx tailwindcss init -p
```

### 3. ตั้ง alias ให้ import ได้สั้น (`@` → `src`)
`tsconfig.json`
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

`vite.config.ts`
```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } }
});
```

---

## 🎨 ตั้งค่า Tailwind CSS + PTT Theme

`tailwind.config.js`
```js
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ptt: {
          blue: "#2867e0",
          cyan: "#19b7ff",
          red: "#e41f2b"
        },
        ink: {
          950: "#0a0f1c",
          900: "#0c1220",
          800: "#111a2e"
        }
      },
      borderRadius: { "2xl": "1.25rem" }
    }
  },
  plugins: []
};
```

`src/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-[#0a0f1c] text-slate-100;
}
```

---

## 📁 โครงสร้างไฟล์หลัก
```
src/
├─ main.tsx
├─ index.css
├─ layouts/
│  ├─ LayoutAuth.tsx
│  └─ LayoutUser.tsx
├─ components/
│  ├─ Sidebar.tsx
│  ├─ Navbar.tsx
│  └─ Card.tsx
├─ pages/
│  ├─ Dashboard.tsx
│  └─ Settings.tsx
└─ lib/
   └─ auth.ts
```

---

## 🧭 Routing หลัก
`src/main.tsx`
```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import "@/index.css";
import LayoutAuth from "@/layouts/LayoutAuth";
import LayoutUser from "@/layouts/LayoutUser";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import { isAuthenticated } from "@/lib/auth";

const Protected = ({ children }: { children: React.ReactNode }) =>
  isAuthenticated() ? <>{children}</> : <Navigate to="/" replace />;

const router = createBrowserRouter([
  { path: "/", element: <LayoutAuth /> },
  {
    path: "/app",
    element: (
      <Protected>
        <LayoutUser />
      </Protected>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "settings", element: <Settings /> }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
```

---

## 🔐 LayoutAuth — หน้า Login อย่างเดียว
`src/layouts/LayoutAuth.tsx`
```tsx
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function LayoutAuth() {
  const login = () => alert("Redirecting to login...");

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold mb-6 text-ptt-cyan">Smart PTT System</h1>
        <Button onClick={login} className="bg-ptt-blue hover:bg-ptt-blue/80">
          Login
        </Button>
      </motion.div>
    </div>
  );
}
```

---

## 🧱 LayoutUser — หน้าหลักหลัง Login
`src/layouts/LayoutUser.tsx`
```tsx
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default function LayoutUser() {
  return (
    <div className="flex min-h-screen bg-ink-950 text-slate-100">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar />
        <main className="flex-1 px-6 py-6 md:px-8 md:py-8 bg-ink-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

---

## 🧭 Sidebar (Icon-only)
`src/components/Sidebar.tsx`
```tsx
import { Home, Settings, Bell } from "lucide-react";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/app", icon: Home, label: "Dashboard" },
  { to: "/app/settings", icon: Settings, label: "Settings" }
];

export default function Sidebar() {
  return (
    <aside className="w-16 bg-[#0c1220] flex flex-col items-center py-4 space-y-6">
      {items.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          title={label}
          className={({ isActive }) =>
            `p-3 rounded-xl hover:bg-ink-800 ${isActive ? "bg-ink-800 border-l-4 border-ptt-blue" : ""}`
          }
        >
          <Icon className="w-6 h-6 text-slate-200" />
        </NavLink>
      ))}
    </aside>
  );
}
```

---

## 🧭 Navbar (ไม่มี Search)
`src/components/Navbar.tsx`
```tsx
import { Bell } from "lucide-react";

export default function Navbar() {
  return (
    <header className="flex items-center justify-between h-16 px-6 bg-ink-950/60 backdrop-blur border-b border-white/5">
      <h1 className="font-semibold text-lg text-ptt-cyan">Dashboard</h1>
      <div className="flex items-center space-x-4">
        <Bell className="w-5 h-5 text-slate-300" />
        <img src="https://via.placeholder.com/32" className="w-8 h-8 rounded-full" />
      </div>
    </header>
  );
}
```

---

## 📋 สรุปขั้นตอน To‑Do (ทั้งหมด)
- [ ] สร้างโปรเจกต์ Vite React TypeScript
- [ ] ติดตั้ง Tailwind + Router + UI + Motion
- [ ] ตั้งค่า alias, theme, token สี PTT
- [ ] สร้าง LayoutAuth (ปุ่ม Login เดี่ยว)
- [ ] สร้าง LayoutUser (Sidebar + Navbar + Outlet)
- [ ] เพิ่ม ProtectedRoute + Routing หลัก
- [ ] ตรวจสอบความเข้ากันของ theme (Ink + PTT Blue)
- [ ] ทดสอบ responsive ทั้ง mobile / desktop

---

📦 **ผลลัพธ์สุดท้าย:**
เว็บที่มีหน้า Login (เรียบง่าย) → หลังล็อกอินจะเป็น LayoutUser สีธีม PTT พร้อม Sidebar ไอคอนล้วน, Navbar ไม่มี search, และพื้น Ink สีหมึกเท่ ๆ เหมือนใน agent.md.
