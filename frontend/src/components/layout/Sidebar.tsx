import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import {
   LayoutDashboard,
   ClipboardList,
   History,
   Scale,
   Sun,
   Moon,
   UserCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BrandLogo } from '@/components/ui/brand-logo';

const navItems = [
   { to: '/dashboard', label: 'Dashboard', mobileLabel: 'Início', icon: LayoutDashboard },
   { to: '/workouts', label: 'Fichas', mobileLabel: 'Fichas', icon: ClipboardList },
   { to: '/logs', label: 'Histórico', mobileLabel: 'Treinos', icon: History },
   { to: '/body-weight', label: 'Peso', mobileLabel: 'Peso', icon: Scale },
];
const mobileNavItems = [...navItems, { to: '/profile', label: 'Perfil', mobileLabel: 'Perfil', icon: UserCircle }];

export function Sidebar() {
   const location = useLocation();
   const { user } = useAuthStore();
   const { theme, toggleTheme } = useThemeStore();
   const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');
   const themeButton = (
      <button type="button" onClick={toggleTheme} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-colors" aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}>
         {theme === 'dark' ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
      </button>
   );

   const navContent = (
      <>
         <div className="px-5 pb-5 pt-6">
            <Link to="/dashboard" className="group flex items-center gap-3 rounded-xl">
               <BrandLogo className="h-10 w-10" />
               <span>
                  <span className="block text-xl font-bold tracking-[-0.03em]">Bulkio</span>
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Treino & progresso</span>
               </span>
            </Link>
         </div>

         <nav aria-label="Navegação principal" className="flex-1 space-y-1 px-4">
            {navItems.map((item) => (
               <Link
                  key={item.to}
                  to={item.to}
                  aria-current={location.pathname === item.to || location.pathname.startsWith(item.to + '/') ? 'page' : undefined}
                  className={cn(
                     'group flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all',
                     location.pathname === item.to || location.pathname.startsWith(item.to + '/')
                        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
               >
                  <item.icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  {item.label}
               </Link>
            ))}
         </nav>

         <div className="border-t border-border/70 p-4">
            <div className="flex items-center justify-between">
               <Link
                  to="/profile"
                  aria-current={location.pathname === '/profile' ? 'page' : undefined}
                  className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl p-2 hover:bg-accent transition-colors"
               >
                  <UserCircle className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                     <p className="text-sm font-medium truncate">{user?.username}</p>
                     <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
               </Link>
               {themeButton}
            </div>
         </div>
      </>
   );

   return (
      <>
         {/* Mobile header */}
         <header className="mobile-header fixed left-0 right-0 top-0 z-40 flex items-center justify-between border-b border-border/70 bg-background/90 px-4 backdrop-blur-xl lg:hidden">
            <Link to="/dashboard" className="flex items-center gap-2">
               <BrandLogo className="h-9 w-9" />
               <span className="text-lg font-bold tracking-[-0.03em]">Bulkio</span>
            </Link>
            {themeButton}
         </header>

         <nav aria-label="Abas do aplicativo" className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-40 border-t border-primary/15 bg-card/95 shadow-[0_-4px_24px_0_#7c3aed0a] backdrop-blur-xl lg:hidden">
            <div className="mx-auto grid max-w-xl grid-cols-5 gap-1 px-2 py-2">
               {mobileNavItems.map((item) => (
                  <Link key={item.to} to={item.to} aria-label={item.label} aria-current={isActive(item.to) ? 'page' : undefined} className={cn('flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-semibold transition-colors sm:text-xs', isActive(item.to) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground')}>
                     <span className={cn('flex h-7 w-9 items-center justify-center rounded-lg', isActive(item.to) && 'bg-primary text-primary-foreground shadow-sm shadow-primary/20')}>
                        <item.icon className="h-5 w-5" strokeWidth={isActive(item.to) ? 2.25 : 1.75} aria-hidden="true" />
                     </span>
                     <span className="truncate max-w-full">{item.mobileLabel}</span>
                  </Link>
               ))}
            </div>
         </nav>

         {/* Desktop sidebar */}
         <aside className="fixed inset-y-0 hidden w-72 flex-col border-r border-border/70 bg-background/85 backdrop-blur-xl lg:flex">
            {navContent}
         </aside>
      </>
   );
}
