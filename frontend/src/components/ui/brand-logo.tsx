import { cn } from '@/lib/utils';

interface BrandLogoProps {
   className?: string;
}

export function BrandLogo({ className }: BrandLogoProps) {
   return (
      <img
         src="/favicon.svg"
         alt=""
         aria-hidden="true"
         className={cn('block shrink-0 object-contain', className)}
      />
   );
}
