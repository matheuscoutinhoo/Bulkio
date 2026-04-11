import { useThemeStore } from '@/stores/themeStore';

const light = {
   grid: '#e8e5f0',
   axis: '#78717f',
   tooltipBg: '#ffffff',
   tooltipBorder: '#e8e5f0',
   primary: '#7c3aed',
   secondary: '#a78bfa',
   gradientFrom: '#c4b5fd',
   gradientTo: '#44404d',
   gradientFromSecondary: '#ddd6fe',
};

const dark = {
   grid: '#1e1e24',
   axis: '#a1a1aa',
   tooltipBg: '#0a0a0c',
   tooltipBorder: '#27272a',
   primary: '#a78bfa',
   secondary: '#c4b5fd',
   gradientFrom: '#8b5cf6',
   gradientTo: '#0c0c0e',
   gradientFromSecondary: '#c4b5fd',
};

export function useChartColors() {
   const theme = useThemeStore((s) => s.theme);
   return theme === 'dark' ? dark : light;
}
