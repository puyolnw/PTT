import { motion } from "framer-motion";
import { FileText } from "lucide-react";

export default function PurchaseBook() {
  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">สมุดซื้อน้ำมัน</h1>
        <p className="text-gray-600 dark:text-gray-400">บันทึกรายการซื้อน้ำมันทั้งหมด</p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-6">
          <FileText className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">หน้าสมุดซื้อน้ำมัน</h3>
        <p className="text-gray-600 dark:text-gray-400">กำลังพัฒนา</p>
      </motion.div>
    </div>
  );
}
