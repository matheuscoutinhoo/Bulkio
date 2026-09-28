import type { ReactNode } from 'react';
import { Activity, ShieldCheck, Sparkles } from 'lucide-react';
import { BrandLogo } from '@/components/ui/brand-logo';

export function AuthShell({ children }: { children: ReactNode }) {
   return (
      <main className="grid min-h-screen lg:grid-cols-[minmax(380px,0.9fr)_1.1fr]">
         <section className="relative hidden overflow-hidden border-r border-white/10 bg-[#211532] px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
            <div className="absolute -left-28 top-1/3 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" aria-hidden="true" />
            <div className="absolute -right-24 -top-20 h-72 w-72 rounded-full bg-orange-500/15 blur-3xl" aria-hidden="true" />
            <div className="relative flex items-center gap-3">
               <BrandLogo className="h-11 w-11" />
               <div><p className="text-xl font-bold tracking-[-0.03em]">Bulkio</p><p className="text-xs text-violet-200/75">Treino & progresso</p></div>
            </div>
            <div className="relative max-w-lg">
               <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-violet-300">Evolua com consistência</p>
               <h1 className="text-4xl font-bold leading-[1.08] tracking-[-0.04em] xl:text-5xl">Seu treino mais claro.<br />Seu progresso mais visível.</h1>
               <p className="mt-5 max-w-md text-base leading-relaxed text-violet-100/70">Planeje séries, acompanhe cargas e transforme cada sessão em dados que ajudam você a avançar.</p>
               <div className="mt-8 grid gap-3 text-sm text-violet-50/85">
                  <div className="flex items-center gap-3"><Activity className="h-5 w-5 text-orange-300" /> Progresso e volume em um único painel</div>
                  <div className="flex items-center gap-3"><Sparkles className="h-5 w-5 text-violet-300" /> Fichas organizadas para sua rotina</div>
                  <div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-emerald-300" /> Seus dados protegidos na sua conta</div>
               </div>
            </div>
            <p className="relative text-xs text-violet-200/50">Treine com intenção. Meça o que importa.</p>
         </section>
         <section className="relative flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 sm:py-12 lg:py-16">
            <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-primary/5 to-transparent lg:hidden" aria-hidden="true" />
            <div className="relative w-full max-w-md">
               <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
                  <BrandLogo className="h-10 w-10" />
                  <span className="text-xl font-bold tracking-[-0.03em]">Bulkio</span>
               </div>
               {children}
            </div>
         </section>
      </main>
   );
}
