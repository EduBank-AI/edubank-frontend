import { motion, useMotionValue, useSpring } from "framer-motion";
import { useState, useEffect } from "react";


export default function MouseFollow() {
    const [isPointer, setIsPointer] = useState(false);

    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);
    const springX = useSpring(cursorX, { stiffness: 500, damping: 40 });
    const springY = useSpring(cursorY, { stiffness: 500, damping: 40 });
    const cursorSize = 48;

    useEffect(() => {
      function move(e: MouseEvent) {
        cursorX.set(e.clientX - cursorSize / 2);
        cursorY.set(e.clientY - cursorSize / 2);
      }

      function pointerCheck(e: MouseEvent) {
        const el = e.target as HTMLElement;
        const style = window.getComputedStyle(el);
        setIsPointer(
          style.cursor === "pointer" ||
            el.tagName === "BUTTON" ||
            el.tagName === "A"
        );
      }

      window.addEventListener("mousemove", move);
      window.addEventListener("mouseover", pointerCheck);
      window.addEventListener("mouseout", () => setIsPointer(false));

      return () => {
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseover", pointerCheck);
        window.removeEventListener("mouseout", () => setIsPointer(false));
      };
    }, [cursorX, cursorY]);

    return (
      <>
      <motion.div
          style={{
            width: cursorSize,
            height: cursorSize,
            translateX: springX,
            translateY: springY,
          }}
          animate={{
            scale: isPointer ? 2 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
          className="fixed top-1 left-1 rounded-full border-2 border-gray-700 dark:border-gray-300 pointer-events-none z-500"
        />
      </>
    );
}