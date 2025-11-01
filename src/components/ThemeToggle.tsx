import { useEffect, useState } from "react";
import { Sun, Moon, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (localStorage.theme === "dark") return true;
    if (localStorage.theme === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const [isHovered, setIsHovered] = useState(false);

  const toggleTheme = async () => {
    // View Transitions API support
    if (!document.startViewTransition) {
      // Fallback for browsers without View Transitions API
      setDark((v) => !v);
      return;
    }

    // ใช้ View Transitions API สำหรับ smooth morphing
    await document.startViewTransition(() => {
      setDark((v) => !v);
    }).ready;
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.theme = dark ? "dark" : "light";
  }, [dark]);

  // Particle positions - แสดงครั้งเดียวตอน hover
  const particles = [
    { x: -12, y: -12, delay: 0 },
    { x: 12, y: -12, delay: 0.05 },
    { x: -12, y: 12, delay: 0.1 },
    { x: 12, y: 12, delay: 0.08 },
  ];

  return (
    <motion.button
      onClick={toggleTheme}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative p-2.5 rounded-xl overflow-visible group"
      aria-label="Toggle theme"
      title={dark ? "เปลี่ยนเป็นธีมสว่าง" : "เปลี่ยนเป็นธีมมืด"}
      whileHover={{ scale: 1.15, rotate: [0, -10, 10, 0] }}
      whileTap={{ scale: 0.85, rotate: 180 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {/* Gradient Background Glow - Static when hovered */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: isHovered ? 0.8 : 0,
          scale: isHovered ? 1 : 0.9,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{
          background: dark
            ? "linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(251,146,60,0.15) 100%)"
            : "linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(147,51,234,0.15) 100%)",
        }}
      />

      {/* Subtle Outer Glow */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        initial={{ opacity: 0 }}
        animate={{
          opacity: isHovered ? 0.5 : 0,
        }}
        transition={{ duration: 0.3 }}
        style={{
          boxShadow: dark
            ? "0 0 15px rgba(251,191,36,0.4)"
            : "0 0 15px rgba(59,130,246,0.4)",
        }}
      />

      {/* Sparkle Particles - Show once on hover */}
      <AnimatePresence>
        {isHovered &&
          particles.map((particle, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.2, 0],
                x: particle.x,
                y: particle.y,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                duration: 0.8,
                delay: particle.delay,
                ease: "easeOut",
              }}
              style={{
                left: "50%",
                top: "50%",
              }}
            >
              <Sparkles
                className={`w-2 h-2 ${
                  dark ? "text-yellow-300" : "text-blue-400"
                }`}
                strokeWidth={3}
              />
            </motion.div>
          ))}
      </AnimatePresence>

      {/* Ripple Effect Background (on tap) */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        initial={{ scale: 0, opacity: 0.5 }}
        whileTap={{ scale: 2.5, opacity: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: dark
            ? "radial-gradient(circle, rgba(251,191,36,0.4) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)",
        }}
      />

      {/* Icon with Flip Animation + Enhanced Glow */}
      <AnimatePresence mode="wait">
        {dark ? (
          <motion.div
            key="sun"
            initial={{ rotate: -180, scale: 0 }}
            animate={{
              rotate: 0,
              scale: 1,
            }}
            exit={{ rotate: 180, scale: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="relative z-10"
          >
            <Sun
              className="w-5 h-5 text-yellow-400"
              style={{
                filter: isHovered
                  ? "drop-shadow(0 0 12px rgba(251,191,36,0.9)) drop-shadow(0 0 20px rgba(251,191,36,0.6))"
                  : "drop-shadow(0 0 8px rgba(251,191,36,0.6))",
              }}
              strokeWidth={2.5}
            />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 180, scale: 0 }}
            animate={{
              rotate: 0,
              scale: 1,
            }}
            exit={{ rotate: -180, scale: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="relative z-10"
          >
            <Moon
              className="text-slate-700 dark:text-slate-300 w-5 h-5"
              style={{
                filter: isHovered
                  ? "drop-shadow(0 0 12px rgba(59,130,246,0.9)) drop-shadow(0 0 20px rgba(59,130,246,0.6))"
                  : "drop-shadow(0 0 4px rgba(59,130,246,0.3))",
              }}
              strokeWidth={2.5}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

