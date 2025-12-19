import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Zap, Send } from "lucide-react";

function SplashScreen({ onComplete }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      onComplete();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isLoading) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center z-50 overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      {/* Animated grid background */}
      <motion.div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "linear-gradient(90deg, #fff 1px, transparent 1px), linear-gradient(#fff 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
        animate={{
          backgroundPosition: ["0px 0px", "50px 50px"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Top floating orb */}
      <motion.div
        className="absolute top-20 left-10 w-40 h-40 bg-pink-500 rounded-full blur-3xl opacity-25"
        animate={{
          x: [0, 50, -50, 0],
          y: [0, -50, 50, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Bottom floating orb */}
      <motion.div
        className="absolute bottom-20 right-10 w-40 h-40 bg-cyan-500 rounded-full blur-3xl opacity-25"
        animate={{
          x: [0, -50, 50, 0],
          y: [0, 50, -50, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main logo container */}
      <motion.div
        className="relative z-10 text-center mb-8"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.8,
          ease: "easeOut",
          delay: 0.2,
        }}
      >
        {/* Rotating outer ring - fastest */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div className="absolute w-32 h-32 border-3 border-transparent border-t-pink-500 border-r-pink-400 rounded-full shadow-lg shadow-pink-500/50" />
        </motion.div>

        {/* Middle rotating ring */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: -360 }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div className="absolute w-24 h-24 border-2 border-transparent border-t-cyan-500 border-r-cyan-400 rounded-full shadow-lg shadow-cyan-500/50" />
        </motion.div>

        {/* Icon container with dual icons */}
        <motion.div
          className="relative w-20 h-20 bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/70"
          animate={{
            boxShadow: [
              "0 0 20px rgba(236, 72, 153, 0.6)",
              "0 0 50px rgba(168, 85, 247, 0.8)",
              "0 0 30px rgba(34, 211, 238, 0.6)",
            ],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Send className="w-11 h-11 text-white" strokeWidth={1.5} fill="white" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Welcome greeting text */}
      <motion.div
        className="relative z-10 text-center mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          ease: "easeOut",
          delay: 0.6,
        }}
      >
        <h2 className="text-2xl font-light text-gray-300 tracking-wider mb-2">
          Welcome to
        </h2>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent tracking-tight">
          Real-Time Chatting
        </h1>
      </motion.div>

      {/* Tagline with animated icons */}
      <motion.div
        className="relative z-10 flex items-center justify-center gap-3 mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.8,
          ease: "easeOut",
          delay: 1.2,
        }}
      >
        <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <Zap className="w-5 h-5 text-pink-400" />
        </motion.div>
        <p className="text-base text-gray-300 font-semibold">Instant, Secure & Lightning Fast</p>
        <motion.div animate={{ rotate: [0, -15, 15, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <Zap className="w-5 h-5 text-cyan-400" />
        </motion.div>
      </motion.div>

      {/* Animated loading dots */}
      <motion.div
        className="relative z-10 flex gap-3 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.8,
          ease: "easeOut",
          delay: 1.5,
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-full"
            animate={{
              scale: [1, 1.6, 1],
              opacity: [0.4, 1, 0.4],
              y: [0, -8, 0],
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>

      {/* Connecting status text */}
      <motion.div
        className="relative z-10 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.8,
          ease: "easeOut",
          delay: 1.8,
        }}
      >
        <p className="text-sm text-gray-400 font-medium tracking-wide">
          Getting everything ready
          <motion.span
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              times: [0, 0.2, 0.8, 1],
            }}
          >
            .
          </motion.span>
          <motion.span
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              times: [0, 0.4, 0.8, 1],
            }}
          >
            .
          </motion.span>
          <motion.span
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              times: [0, 0.6, 0.8, 1],
            }}
          >
            .
          </motion.span>
        </p>
      </motion.div>

      {/* Bottom shimmer line effect */}
      <motion.div
        className="absolute bottom-16 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent"
        animate={{
          scaleX: [0.3, 1, 0.3],
          opacity: [0.3, 0.8, 0.3],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Corner accent elements */}
      <motion.div
        className="absolute top-10 left-10 w-2 h-2 bg-pink-500 rounded-full"
        animate={{
          opacity: [0.3, 1, 0.3],
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-10 right-10 w-2 h-2 bg-cyan-500 rounded-full"
        animate={{
          opacity: [0.3, 1, 0.3],
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          delay: 1.5,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
}

export default SplashScreen;
