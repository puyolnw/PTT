import { Settings as SettingsIcon, FileText, Shield } from "lucide-react";
import ChartCard from "@/components/ChartCard";
import { useBranch } from "@/contexts/BranchContext";
import { useGasStation } from "@/contexts/GasStationContext";

export default function DeliverySettings() {
  const { selectedBranches } = useBranch();
  const { branches } = useGasStation();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-app font-display">ตั้งค่า (Delivery)</h1>
          <p className="text-muted mt-1">หน้านี้เป็นโครงพร้อมต่อยอด (สิทธิ์/คำศัพท์/ฟิลด์/รายงานภาษี)</p>
        </div>

        <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm backdrop-blur-sm">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            สาขาที่กำลังดู: {selectedBranches.length === 0 ? "ทั้งหมด" : selectedBranches.map(id => branches.find(b => String(b.id) === id)?.name || id).join(", ")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="คำศัพท์/ฟิลด์สำคัญตามเอกสาร" icon={FileText}>
          <div className="space-y-2 text-sm text-app">
            <div>- แยก “Approve No.” และ “Invoice No.” คนละฟิลด์เพื่อค้นหา/อ้างอิง</div>
            <div>- รองรับสถานะ “จ่ายเงินแล้ว/รอรับของ/รับแล้ว” และสถานะเที่ยวขนส่งแบบ Tracking</div>
            <div>- เตรียมช่องสำหรับ “ราคาขายส่งภายใน (รวมค่าบริหารจัดการ)” (ต่อยอดร่วมกับบัญชี)</div>
            <div>- เตรียมช่องสำหรับ “ค่า API” (คลัง vs ปั๊ม) เพื่อเทียบคุณภาพน้ำมัน</div>
          </div>
        </ChartCard>

        <ChartCard title="สิทธิ์/การอนุมัติ (แนวคิด)" icon={Shield}>
          <div className="space-y-2 text-sm text-app">
            <div>- Stock Adjustment / ล้างหลุม: ควรมี Approval จากผู้จัดการก่อนตัดสต็อกจริง</div>
            <div>- Internal AR: แยกสิทธิ์ HQ vs สาขา</div>
            <div className="text-xs text-muted pt-2">
              ตอนนี้โปรเจกต์ยังเป็น mock UI (LocalStorage) เลยทำไว้เป็น placeholder
            </div>
          </div>
        </ChartCard>
      </div>

      <ChartCard title="ข้อมูลเทคนิค (อนาคต)" icon={SettingsIcon}>
        <div className="space-y-2 text-sm text-app">
          <div>- OCR อ่านเลขเอกสารจากใบ Invoice (ตามเอกสาร: ถ้าเป็นไปได้)</div>
          <div>- Offline Sync: เก็บรูปไว้ในเครื่อง แล้ว sync เมื่อมีสัญญาณ</div>
          <div>- รายงานภาษีซื้ออัตโนมัติจาก Invoice No. + VAT 7%</div>
        </div>
      </ChartCard>
    </div>
  );
}


