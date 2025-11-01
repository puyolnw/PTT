import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatCard {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string; // Tailwind gradient classes
  change?: string; // เช่น "+12.5%" (optional)
}

interface SummaryStatsProps {
  stats: StatCard[];
}

export default function SummaryStats({ stats }: SummaryStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white/5 border border-app rounded-2xl p-6 hover:border-ptt-blue/30 
                     transition-all duration-200 hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
              <stat.icon className="w-6 h-6 text-app" strokeWidth={1.5} />
            </div>
            {stat.change && (
              <span className={`text-sm font-medium ${
                stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
              }`}>
                {stat.change}
              </span>
            )}
          </div>
          
          <h3 className="text-muted text-sm mb-1 font-light">{stat.label}</h3>
          <p className="text-3xl font-bold text-app font-display">
            {stat.value}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

