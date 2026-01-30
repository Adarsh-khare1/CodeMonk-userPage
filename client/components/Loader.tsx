import { motion, AnimatePresence } from "framer-motion";

export default function Loader() {
  return (
    <AnimatePresence>
      <motion.div
        key="loader"
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-white pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
      >
        <motion.img
          src="/CodeLogo2.png"
          alt="CodeMonk"
          className="h-16 w-auto select-none"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
