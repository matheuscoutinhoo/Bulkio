import { useThemeStore } from '@/stores/themeStore';

const light = {
   grid: '#ddd8e8',
   axis: '#65607a',
   tooltipBg: '#ffffff',
   tooltipBorder: '#ddd8e8',
   primary: '#7c3aed',
};

const dark = {
   grid: '#27272a',
   axis: '#a1a1aa',
   tooltipBg: '#0a0a0c',
   tooltipBorder: '#27272a',
   primary: '#6d28d9',
};

export function useChartColors() {
   const theme = useThemeStore((s) => s.theme);
   return theme === 'dark' ? dark : light;
}
