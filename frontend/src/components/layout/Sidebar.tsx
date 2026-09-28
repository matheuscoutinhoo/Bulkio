import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import {
   LayoutDashboard,
   ClipboardList,
   History,
   Scale,
   Menu,
   X,
   Sun,
   Moon,
   UserCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { BrandLogo } from '@/components/ui/brand-logo';

const navItems = [
   { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
   { to: '/workouts', label: 'Fichas', icon: ClipboardList },
   { to: '/logs', label: 'Histórico', icon: History },
   { to: '/body-weight', label: 'Peso', icon: Scale },
];

export function Sidebar() {
   const location = useLocation();
   const { user } = useAuthStore();
   const { theme, toggleTheme } = useThemeStore();
   const [mobileOpen, setMobileOpen] = useState(false);

   useEffect(() => {
      if (!mobileOpen) return;
      const handleKeyDown = (event: KeyboardEvent) => {
         if (event.key === 'Escape') setMobileOpen(false);
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
   }, [mobileOpen]);

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
                  onClick={() => setMobileOpen(false)}
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
                  onClick={() => setMobileOpen(false)}
                  aria-current={location.pathname === '/profile' ? 'page' : undefined}
                  className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl p-2 hover:bg-accent transition-colors"
               >
                  <UserCircle className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                     <p className="text-sm font-medium truncate">{user?.username}</p>
                     <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
               </Link>
               <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
                  aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
               >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
               </button>
            </div>
         </div>
      </>
   );

   return (
      <>
         {/* Mobile header */}
         <div className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-border/70 bg-background/90 px-4 backdrop-blur-xl lg:hidden">
            <Link to="/dashboard" className="flex items-center gap-2">
               <BrandLogo className="h-9 w-9" />
               <span className="text-lg font-bold tracking-[-0.03em]">Bulkio</span>
            </Link>
            <button type="button" onClick={() => setMobileOpen(!mobileOpen)} aria-expanded={mobileOpen} aria-controls="mobile-navigation" aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'} className="flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground">
               {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
         </div>

         {/* Mobile sidebar */}
         {mobileOpen && (
            <div
               className="lg:hidden fixed inset-0 z-30 bg-black/50 animate-fade-in"
               onClick={() => setMobileOpen(false)}
               aria-hidden="true"
            />
         )}
         <div
            id="mobile-navigation"
            className={cn(
               'fixed bottom-0 left-0 top-16 z-30 flex w-72 max-w-[86vw] flex-col border-r border-border/70 bg-background shadow-2xl transition-transform duration-200 ease-out lg:hidden',
               mobileOpen ? 'translate-x-0' : '-translate-x-full',
            )}
         >
            {navContent}
         </div>

         {/* Desktop sidebar */}
         <aside className="fixed inset-y-0 hidden w-72 flex-col border-r border-border/70 bg-background/85 backdrop-blur-xl lg:flex">
            {navContent}
         </aside>
      </>
   );
}
