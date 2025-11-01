import { useEffect } from "react";

/**
 * Hook สำหรับอัปเดต scroll progress bar + รองรับการคลิก/ลาก
 */
export function useScrollProgress() {
  useEffect(() => {
    const vContainer = document.querySelector<HTMLDivElement>("#scroll-progress-vertical");
    const hContainer = document.querySelector<HTMLDivElement>("#scroll-progress-top");
    const vBar = document.querySelector<HTMLDivElement>("#scroll-progress-vertical .bar");
    const hBar = document.querySelector<HTMLDivElement>("#scroll-progress-top .bar");

    const setProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const p = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      
      if (vBar) vBar.style.height = p + "%";
      if (hBar) hBar.style.width = p + "%";
    };

    // Jump to position when clicking/dragging vertical bar
    const handleVerticalClick = (e: MouseEvent) => {
      e.preventDefault(); // ป้องกันการ select text
      if (!vContainer) return;
      const rect = vContainer.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const percentage = clickY / rect.height;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      window.scrollTo({ top: docHeight * percentage, behavior: "smooth" });
    };

    // Jump to position when clicking/dragging horizontal bar
    const handleHorizontalClick = (e: MouseEvent) => {
      e.preventDefault(); // ป้องกันการ select text
      if (!hContainer) return;
      const rect = hContainer.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      window.scrollTo({ top: docHeight * percentage, behavior: "smooth" });
    };

    // Drag support for vertical
    let isDraggingV = false;
    const handleVerticalMouseMove = (e: MouseEvent) => {
      if (!isDraggingV) return;
      handleVerticalClick(e);
    };

    // Drag support for horizontal
    let isDraggingH = false;
    const handleHorizontalMouseMove = (e: MouseEvent) => {
      if (!isDraggingH) return;
      handleHorizontalClick(e);
    };

    const handleMouseUp = () => {
      isDraggingV = false;
      isDraggingH = false;
      document.body.style.userSelect = ""; // คืนค่า text selection
    };

    // Event listeners
    setProgress();
    window.addEventListener("scroll", setProgress, { passive: true });
    window.addEventListener("resize", setProgress);

    if (vContainer) {
      vContainer.addEventListener("mousedown", (e) => {
        e.preventDefault(); // ป้องกันการ select text
        isDraggingV = true;
        document.body.style.userSelect = "none"; // ป้องกัน text selection ขณะลาก
        handleVerticalClick(e);
      });
      window.addEventListener("mousemove", handleVerticalMouseMove);
    }

    if (hContainer) {
      hContainer.addEventListener("mousedown", (e) => {
        e.preventDefault(); // ป้องกันการ select text
        isDraggingH = true;
        document.body.style.userSelect = "none"; // ป้องกัน text selection ขณะลาก
        handleHorizontalClick(e);
      });
      window.addEventListener("mousemove", handleHorizontalMouseMove);
    }

    window.addEventListener("mouseup", handleMouseUp);
    
    return () => {
      window.removeEventListener("scroll", setProgress);
      window.removeEventListener("resize", setProgress);
      window.removeEventListener("mousemove", handleVerticalMouseMove);
      window.removeEventListener("mousemove", handleHorizontalMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);
}

/**
 * ScrollProgress Component
 * แสดง progress bar แบบ vertical (ขวาหน้าจอ) และ horizontal (บนสุด)
 */
export default function ScrollProgress() {
  useScrollProgress();
  
  return (
    <>
      <div id="scroll-progress-vertical" aria-hidden="true">
        <div className="bar" />
      </div>
      <div id="scroll-progress-top" aria-hidden="true">
        <div className="bar" />
      </div>
    </>
  );
}

