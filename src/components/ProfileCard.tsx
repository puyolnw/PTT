import { Mail, Phone, Calendar, Briefcase } from "lucide-react";
import StatusTag, { getStatusVariant } from "./StatusTag";

interface ProfileCardProps {
  avatar: string;
  name: string;
  code: string;
  dept: string;
  position: string;
  status: string;
  startDate?: string;
  email?: string;
  phone?: string;
}

export default function ProfileCard({
  avatar,
  name,
  code,
  dept,
  position,
  status,
  startDate,
  email,
  phone
}: ProfileCardProps) {
  return (
    <div className="bg-white/5 border border-app rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Avatar */}
        <div className="shrink-0">
          <img
            src={avatar}
            alt={name}
            className="w-24 h-24 rounded-2xl ring-4 ring-ptt-blue/30 object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-app font-display">
              {name}
            </h2>
            <StatusTag variant={getStatusVariant(status)}>
              {status}
            </StatusTag>
          </div>

          <p className="text-muted text-sm mb-4">
            {code} • {dept} • {position}
          </p>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {email && (
              <div className="flex items-center gap-2 text-app">
                <Mail className="w-4 h-4 text-ptt-cyan" />
                <span className="font-light">{email}</span>
              </div>
            )}
            
            {phone && (
              <div className="flex items-center gap-2 text-app">
                <Phone className="w-4 h-4 text-ptt-cyan" />
                <span className="font-light">{phone}</span>
              </div>
            )}
            
            {startDate && (
              <div className="flex items-center gap-2 text-app">
                <Calendar className="w-4 h-4 text-ptt-cyan" />
                <span className="font-light">เริ่มงาน: {startDate}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-app">
              <Briefcase className="w-4 h-4 text-ptt-cyan" />
              <span className="font-light">{dept}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

