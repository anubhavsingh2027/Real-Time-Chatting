import { motion } from "framer-motion";

function PageLoader() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center z-40 overflow-hidden">
      {/* Animated background grid */}
      <motion.div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: "linear-gradient(90deg, #fff 1px, transparent 1px), linear-gradient(#fff 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
        animate={{
          backgroundPosition: ["0px 0px", "50px 50px"],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Glowing orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-32 h-32 bg-pink-500 rounded-full blur-3xl opacity-20"
        animate={{
          scale: [1, 1.5, 1],
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-cyan-500 rounded-full blur-3xl opacity-20"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -30, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main loader container with multiple concentric circles */}
      <motion.div
        className="relative z-10"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Outermost rotating circle - fast */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div className="w-28 h-28 border-3 border-transparent border-t-pink-500 border-r-pink-400 rounded-full shadow-lg shadow-pink-500/50" />
        </motion.div>

        {/* Middle rotating circle - medium speed */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: -360 }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div className="w-20 h-20 border-2 border-transparent border-t-cyan-500 border-b-cyan-400 rounded-full shadow-lg shadow-cyan-500/50" />
        </motion.div>

        {/* Inner rotating circle - slow */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div className="w-12 h-12 border-2 border-transparent border-t-purple-500 border-r-purple-400 rounded-full shadow-lg shadow-purple-500/50" />
        </motion.div>

        {/* Center pulsing orb */}
        <motion.div
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 shadow-2xl shadow-purple-500/60"
          animate={{
            scale: [1, 1.15, 1],
            boxShadow: [
              "0 0 20px rgba(236, 72, 153, 0.6)",
              "0 0 40px rgba(168, 85, 247, 0.8)",
              "0 0 20px rgba(34, 211, 238, 0.6)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Loading text with dot animation */}
      <motion.div
        className="mt-16 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
      >
        <p className="text-gray-300 font-semibold text-base tracking-wide">
          Connecting
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

      {/* Radiating pulse effect */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
      >
        <motion.div
          className="w-32 h-32 border border-purple-500/50 rounded-full"
          animate={{
            scale: [1, 2],
            opacity: [0.8, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
        <motion.div
          className="absolute w-32 h-32 border border-cyan-500/50 rounded-full"
          animate={{
            scale: [1, 2],
            opacity: [0.8, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
            delay: 0.3,
          }}
        />
      </motion.div>
    </div>
  );
}

export default PageLoader;
