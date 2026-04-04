import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AppLayout() {
   return (
      <div className="min-h-screen">
         <Sidebar />
         <main className="lg:pl-64 pt-14 lg:pt-0">
            <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
               <Outlet />
            </div>
         </main>
      </div>
   );
}
