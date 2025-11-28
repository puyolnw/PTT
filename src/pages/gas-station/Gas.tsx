import { motion } from "framer-motion";
import { Flame } from "lucide-react";

export default function Gas() {
  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">การจัดการแก๊ส</h1>
        <p className="text-gray-600 dark:text-gray-400">จัดการสต็อกและขายแก๊ส</p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-6">
          <Flame className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">หน้าการจัดการแก๊ส</h3>
        <p className="text-gray-600 dark:text-gray-400">กำลังพัฒนา</p>
      </motion.div>
    </div>
  );
}
