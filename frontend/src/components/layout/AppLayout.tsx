import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AppLayout() {
   return (
      <div className="min-h-screen overflow-x-hidden">
         <a href="#main-content" className="skip-link">Ir para o conteúdo principal</a>
         <Sidebar />
         <main id="main-content" tabIndex={-1} className="pt-16 outline-none lg:pl-72 lg:pt-0">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
               <Outlet />
            </div>
         </main>
      </div>
   );
}
