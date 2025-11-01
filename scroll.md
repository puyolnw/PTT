# 📏 Scrollbar as Page Progress — Square, PTT Theme, Dark/Light (scrollmd_progress)

> ดีไซน์แบบ **หลอดเปอร์เซ็นต์ของหน้า** (progress bar) ที่เป็น **เหลี่ยมๆ** ติดขอบจอ + ปรับสีตามธีม  
> ใช้ได้ทั้ง **แนวตั้ง (ขวาหน้าจอ)** หรือ **แนวนอน (ขอบบน)** และยังคงมี **native scrollbar** ได้ตามปกติ

---

## 0) แนวคิด
- สร้าง **Progress Rail** ติดขอบ (fixed) และเติมความยาวด้วยค่าเปอร์เซ็นต์การสกรอลล์
- ใช้ **CSS Variables** และ **class `.dark`** เพื่อรองรับธีม
- ปรับความหนาตามหน้าจอ (responsive)
- ใช้โทน **PTT** สำหรับสีหลัก ทั้ง Light/Dark

---

## 1) ตัวแปรธีม (เพิ่มใน `globals.css` ของคุณได้เลย)
```css
:root {
  /* Light: พื้นขาว (เว็บของคุณ), แต่อินดิเคเตอร์ใช้ PTT */
  --pg-rail: #e9eef7;
  --pg-fill: #2867E0;   /* PTT Blue */
  --pg-fill-2: #19B7FF; /* PTT Cyan (gradient optional) */
  --pg-shadow: 0 0 0 rgba(0,0,0,0);
  --pg-size: 8px;       /* ความหนาเริ่มต้น (desktop) */
  --pg-radius: 0px;     /* เหลี่ยม */
  --pg-gap: 0px;        /* เว้นห่างจากขอบ */
}

.dark {
  /* Dark: พื้นมืด (เดิมของคุณ), ใช้ Cyan เด่น */
  --pg-rail: #0f172a;
  --pg-fill: #19B7FF;
  --pg-fill-2: #7dd3fc;
  --pg-shadow: 0 0 0 rgba(0,0,0,0);
  --pg-size: 8px;
  --pg-radius: 0px;
  --pg-gap: 0px;
}

/* Responsive ขนาด */
@media (pointer: coarse), (max-width: 640px) {
  :root, .dark { --pg-size: 6px; }
}
@media (min-width: 1440px) {
  :root, .dark { --pg-size: 10px; }
}
```
> คงธีม PTT: สีหลัก (fill) เป็น `--pg-fill` และ `--pg-fill-2`

---

## 2) โครงสร้าง HTML/React
วาง Progress rail แบบ **แนวตั้งทางขวา** (ค่าเริ่มต้น) และ/หรือ **แนวนอนด้านบน**

```html
<!-- วางใกล้ๆ root ของแอป (เช่นใน LayoutMain) -->
<div id="scroll-progress-vertical" aria-hidden="true">
  <div class="bar"></div>
</div>

<div id="scroll-progress-top" aria-hidden="true">
  <div class="bar"></div>
</div>
```
หรือใน React:
```tsx
export function ScrollProgress() {
  return (
    <>
      <div id="scroll-progress-vertical" aria-hidden="true"><div className="bar" /></div>
      <div id="scroll-progress-top" aria-hidden="true"><div className="bar" /></div>
    </>
  );
}
```

---

## 3) สไตล์ Progress (เหลี่ยม, PTT, รองรับธีม)
```css
/* ===== Vertical right rail ===== */
#scroll-progress-vertical {
  position: fixed;
  top: 0; right: var(--pg-gap);
  height: 100dvh;
  width: var(--pg-size);
  background: var(--pg-rail);
  border-radius: var(--pg-radius);
  overflow: hidden;
  z-index: 60; /* สูงกว่า content */
  pointer-events: none;
}
#scroll-progress-vertical .bar {
  position: absolute;
  bottom: 0; left: 0;
  width: 100%;
  height: 0%; /* จะถูกอัปเดตด้วย JS */
  background: linear-gradient(180deg, var(--pg-fill), var(--pg-fill-2));
  border-radius: 0; /* ให้เหลี่ยมเป๊ะ */
  transition: height 60ms linear; /* ลื่นไหล */
}

/* ===== Top rail (horizontal) ===== */
#scroll-progress-top {
  position: fixed;
  top: var(--pg-gap); left: 0;
  width: 100%;
  height: var(--pg-size);
  background: var(--pg-rail);
  border-radius: var(--pg-radius);
  overflow: hidden;
  z-index: 60;
  pointer-events: none;
}
#scroll-progress-top .bar {
  position: absolute;
  top: 0; left: 0;
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, var(--pg-fill), var(--pg-fill-2));
  border-radius: 0;
  transition: width 60ms linear;
}
```

> ต้องการใช้เพียงแบบเดียวก็ซ่อนไว้ด้วย CSS:  
> `#scroll-progress-top { display:none; }` หรือ `#scroll-progress-vertical { display:none; }`

---

## 4) สคริปต์อัปเดตเปอร์เซ็นต์ (Vanilla/React)
### ตัวอย่างที่เรียบง่าย (Vanilla)
```html
<script>
(function(){
  function setProgress() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var p = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    var v = document.querySelector('#scroll-progress-vertical .bar');
    var h = document.querySelector('#scroll-progress-top .bar');
    if (v) v.style.height = p + '%';
    if (h) h.style.width  = p + '%';
  }
  setProgress();
  window.addEventListener('scroll', setProgress, { passive: true });
  window.addEventListener('resize', setProgress);
})();
</script>
```

### React Hook + Component (แนะนำ)
```tsx
import { useEffect } from "react";

export function useScrollProgress() {
  useEffect(() => {
    const v = document.querySelector<HTMLDivElement>("#scroll-progress-vertical .bar");
    const h = document.querySelector<HTMLDivElement>("#scroll-progress-top .bar");

    const setProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const p = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      if (v) v.style.height = p + "%";
      if (h) h.style.width  = p + "%";
    };

    setProgress();
    window.addEventListener("scroll", setProgress, { passive: true });
    window.addEventListener("resize", setProgress);
    return () => {
      window.removeEventListener("scroll", setProgress);
      window.removeEventListener("resize", setProgress);
    };
  }, []);
}

export default function ScrollProgress() {
  useScrollProgress();
  return (
    <>
      <div id="scroll-progress-vertical" aria-hidden="true"><div className="bar" /></div>
      <div id="scroll-progress-top" aria-hidden="true"><div className="bar" /></div>
    </>
  );
}
```

> ใส่ `<ScrollProgress />` ใน Layout ของคุณ (ด้านใน `<body>` แต่เหนือ `<main>`)  
> ถ้าต้องการให้เลื่อนไปพร้อมคอนเทนเนอร์ `.sb-all` ใด ๆ ให้ bind กับ container นั้นแทน `window` (อ่านคำแนะนำด้านล่าง)

---

## 5) ถ้าคุณเลื่อนที่คอนเทนเนอร์ (ไม่ใช่ window)
เลย์เอาต์บางแบบใช้ `<main class="overflow-y-auto">` เพื่อเลื่อนเฉพาะส่วน ให้แก้ hook แบบนี้:

```tsx
export function useScrollProgressFor(el: HTMLElement | null) {
  useEffect(() => {
    if (!el) return;
    const v = document.querySelector<HTMLDivElement>("#scroll-progress-vertical .bar");
    const h = document.querySelector<HTMLDivElement>("#scroll-progress-top .bar");

    const setProgress = () => {
      const scrollTop = el.scrollTop;
      const docHeight = el.scrollHeight - el.clientHeight;
      const p = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      if (v) v.style.height = p + "%";
      if (h) h.style.width  = p + "%";
    };

    setProgress();
    el.addEventListener("scroll", setProgress, { passive: true });
    window.addEventListener("resize", setProgress);
    return () => {
      el.removeEventListener("scroll", setProgress);
      window.removeEventListener("resize", setProgress);
    };
  }, [el]);
}
```
ใช้งาน:
```tsx
const ref = useRef<HTMLDivElement>(null);
useScrollProgressFor(ref.current);

return (
  <>
    <ScrollProgress /> {/* วางบนสุดของ Layout */}
    <main ref={ref} className="sb-all overflow-y-auto">...</main>
  </>
);
```

---

## 6) เคล็ดลับความเนียน
- ใช้ `--pg-gap` เพื่อขยับออกจากขอบ 1–2px ถ้าต้องการเงา
- ถ้าอยาก “แสดงแค่ช่วงที่มี scroll” ให้ซ่อนด้วย CSS เมื่อ `document.documentElement.scrollHeight === clientHeight`
- ถ้าต้องการให้ **แทนที่ native scrollbar** บนบางหน้า ให้ใช้ `overflow: hidden` กับ body แล้วเลื่อนในคอนเทนเนอร์แทน พร้อม scrollbar แบบกำหนดเองจาก v2

---

## 7) QA Checklist
- [ ] โหมด Light/Dark เปลี่ยนสี `rail`/`fill` ตามตัวแปร
- [ ] ความหนาปรับตามขนาดหน้าจอ
- [ ] เปอร์เซ็นต์ขึ้น/ลงลื่นไหล
- [ ] ถ้าใช้คอนเทนเนอร์เลื่อนเฉพาะส่วน → hook `useScrollProgressFor` ทำงานถูกต้อง
- [ ] เข้ากับธีม PTT และไม่บังปุ่มสำคัญ (z-index = 60)  

เสร็จแล้วคุณจะได้ **Progress‑style scrollbar** แบบเหลี่ยม ๆ ที่บอกสถานะ “เว็บอยู่กี่ %” ได้เป๊ะตามที่ต้องการครับ ✨
