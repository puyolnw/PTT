import { useEffect, useState } from "react";

interface VersionInfo {
  version: string;
  lastUpdate: string;
  buildTime: string;
}

export default function AppVersion() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);

  useEffect(() => {
    // โหลด version info จาก version.json
    fetch('/version.json')
      .then(r => r.json())
      .then(data => setVersionInfo(data))
      .catch(() => {
        // fallback ถ้าไม่มีไฟล์
        setVersionInfo({
          version: "0.00",
          lastUpdate: "",
          buildTime: ""
        });
      });
  }, []);

  if (!versionInfo) return null;

  return (
    <div 
      className="fixed bottom-3 right-3 text-xs text-muted opacity-40 hover:opacity-100 transition-all duration-300 cursor-default select-none z-50"
      title={`Last update: ${versionInfo.buildTime || 'Unknown'}`}
    >
      <div className="flex items-center gap-2 panel px-3 py-1.5 rounded-lg shadow-sm">
        <span className="font-mono font-semibold">v{versionInfo.version}</span>
        {versionInfo.buildTime && (
          <span className="hidden sm:inline text-[10px] opacity-70">
            {new Date(versionInfo.lastUpdate).toLocaleDateString('th-TH')}
          </span>
        )}
      </div>
    </div>
  );
}

