import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ScrollTextProps {
   children: React.ReactNode;
   className?: string;
}

export function ScrollText({ children, className }: ScrollTextProps) {
   const containerRef = useRef<HTMLDivElement>(null);
   const textRef = useRef<HTMLSpanElement>(null);
   const [overflow, setOverflow] = useState(0);
   const [duration, setDuration] = useState(5);

   useEffect(() => {
      const container = containerRef.current;
      const text = textRef.current;
      if (!container || !text) return;

      const check = () => {
         const diff = text.scrollWidth - container.clientWidth;
         setOverflow(diff > 2 ? diff : 0);
         if (diff > 2) {
            setDuration(Math.max(3, diff / 30));
         }
      };

      check();
      const ro = new ResizeObserver(check);
      ro.observe(container);
      return () => ro.disconnect();
   }, [children]);

   return (
      <div
         ref={containerRef}
         className={cn('overflow-hidden whitespace-nowrap', className)}
      >
         <span
            ref={textRef}
            className={cn(
               'inline-block',
               overflow > 0 && 'animate-scroll-text',
            )}
            style={overflow > 0 ? {
               '--scroll-offset': `-${overflow}px`,
               '--scroll-duration': `${duration}s`,
            } as React.CSSProperties : undefined}
         >
            {children}
         </span>
      </div>
   );
}
