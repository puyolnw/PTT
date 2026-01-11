 หัวข้อ: ปรับปรุง UI/UX ระบบ Delivery ให้เป็นมาตรฐานเดียวกัน

รายละเอียด: ต้องการให้ปรับปรุงการแสดงผล (UI) ของระบบ Delivery ในทุกหน้า โดยให้ยึดหน้า /app/delivery/internal-pump-sales เป็นต้นแบบ (Master Design) ที่มีพวกการกรองข้อมูลในหัวคอลัมได้เลย

สิ่งที่ต้องดำเนินการ:

ตรวจสอบและปรับแก้ Layout, ตาราง (Table), และองค์ประกอบต่างๆ ให้มีความสวยงามและสอดคล้องกับหน้าต้นแบบ

คุม Theme และ Mood & Tone ของทุกหน้าให้ไปในทิศทางเดียวกัน

รายชื่อหน้าที่ต้องปรับปรุง (Target Files):

( src\pages\delivery\Orders.tsx )

/app/delivery/depot-oil-order-management

/app/delivery/internal-oil-order-management

/app/delivery/request-oil

/app/delivery/request-depot-oil

/app/delivery/internal-oil-receipt

/app/delivery/record-tank-entry

/app/delivery/depot-oil-receipt

/app/delivery/hiso-pump-sales

/app/delivery/external-sector-sales

/app/delivery/record-suction-oil

/app/delivery/internal-payment

/app/delivery/manage-trips

/app/delivery/internal-transport

/app/delivery/transport-tracking

/app/delivery/truck-profiles

/app/delivery/trailer-profiles

/app/delivery/truck-orders

จุดประสงค์: อยากให้ไล่เช็กทีละไฟล์ แล้วปรับพวกตาราง, การจัดวาง (Layout), และความสวยงาม ให้เหมือนกับหน้าต้นแบบเป๊ะๆ เพื่อให้ทั้งระบบดูเป็น Theme เดียวกันครับ