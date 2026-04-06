import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import {
   LayoutDashboard,
   Dumbbell,
   ClipboardList,
   History,
   Scale,
   Menu,
   X,
   Sun,
   Moon,
   UserCircle,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
   { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
   { to: '/exercises', label: 'Exercícios', icon: Dumbbell },
   { to: '/workouts', label: 'Fichas', icon: ClipboardList },
   { to: '/logs', label: 'Histórico', icon: History },
   { to: '/body-weight', label: 'Peso', icon: Scale },
];

export function Sidebar() {
   const location = useLocation();
   const { user } = useAuthStore();
   const { theme, toggleTheme } = useThemeStore();
   const [mobileOpen, setMobileOpen] = useState(false);

   const navContent = (
      <>
         <div className="p-6">
            <Link to="/dashboard" className="flex items-center gap-2">
               <Dumbbell className="h-8 w-8 text-primary" />
               <span className="text-xl font-bold">Bulkio</span>
            </Link>
         </div>

         <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => (
               <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                     'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                     location.pathname === item.to || location.pathname.startsWith(item.to + '/')
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
               >
                  <item.icon className="h-4 w-4" />
                  {item.label}
               </Link>
            ))}
         </nav>

         <div className="p-4 border-t">
            <div className="flex items-center justify-between">
               <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 min-w-0 flex-1 p-1 rounded-md hover:bg-accent transition-colors"
               >
                  <UserCircle className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                     <p className="text-sm font-medium truncate">{user?.username}</p>
                     <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
               </Link>
               <button
                  onClick={toggleTheme}
                  className="p-2 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                  title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
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
         <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between bg-background border-b px-4 h-14">
            <Link to="/dashboard" className="flex items-center gap-2">
               <Dumbbell className="h-6 w-6 text-primary" />
               <span className="text-lg font-bold">Bulkio</span>
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
               {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
         </div>

         {/* Mobile sidebar */}
         {mobileOpen && (
            <div
               className="lg:hidden fixed inset-0 z-30 bg-black/50"
               onClick={() => setMobileOpen(false)}
            />
         )}
         <div
            className={cn(
               'lg:hidden fixed top-14 left-0 bottom-0 z-30 w-64 bg-background border-r flex flex-col transition-transform',
               mobileOpen ? 'translate-x-0' : '-translate-x-full',
            )}
         >
            {navContent}
         </div>

         {/* Desktop sidebar */}
         <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r bg-background">
            {navContent}
         </div>
      </>
   );
}
