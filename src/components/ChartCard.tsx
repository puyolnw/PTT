import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children: ReactNode;
  actions?: ReactNode;
}

export default function ChartCard({ title, subtitle, icon: Icon, children, actions }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-app rounded-2xl p-6 shadow-xl 
                 hover:border-ptt-blue/30 transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 bg-ptt-blue/20 rounded-lg">
              <Icon className="w-5 h-5 text-ptt-cyan" strokeWidth={1.5} />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-app font-display">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-muted font-light mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* Chart Content */}
      <div className="w-full">
        {children}
      </div>
    </motion.div>
  );
}

