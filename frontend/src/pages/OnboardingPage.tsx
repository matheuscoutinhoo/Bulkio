import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, ClipboardList, Dumbbell, ChartNoAxesColumnIncreasing, Timer, Ruler, Scale, Target, ListChecks, LoaderCircle } from 'lucide-react';
import { authApi } from '@/services/authService';
import { bodyWeightApi, type BodyWeightRecord } from '@/services/bodyWeightService';
import { useAuthStore } from '@/stores/authStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { toast } from '@/stores/toastStore';
import { EMPTY_ONBOARDING_DRAFT, ONBOARDING_GOALS, ONBOARDING_STEPS, getOnboardingErrors, getOnboardingPayload, type OnboardingDraft } from '@/lib/onboarding';
import { getApiErrorMessage } from '@/lib/api';
import { formatKilograms } from '@/lib/workoutForm';
import { cn } from '@/lib/utils';
import { BrandLogo } from '@/components/ui/brand-logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ErrorState, FieldMessage, LoadingState } from '@/components/ui/feedback';

const titles = ['Primeiros passos no Bulkio', 'Fichas ou treino livre', 'Altura e peso', 'Objetivo e meta', 'Revise seus dados'];
const descriptions = [
   'Conheça as funções principais e preencha os dados usados no seu acompanhamento.',
   'Você pode organizar uma rotina ou registrar uma sessão sem ficha.',
   'Essas medidas são usadas no perfil, no histórico de peso e em exercícios de peso corporal.',
   'Escolha o que deseja acompanhar. A meta de peso é opcional e pode ser alterada depois.',
   'Confira as informações e escolha qual área abrir ao concluir.',
];
const destinations = [
   { path: '/dashboard', label: 'Ver resumo', description: 'Volume, recordes e grupos treinados', icon: ChartNoAxesColumnIncreasing },
   { path: '/workouts', label: 'Ver fichas', description: 'Criar ou organizar uma rotina', icon: ClipboardList },
   { path: '/logs', label: 'Ver treinos', description: 'Registrar com ficha ou em treino livre', icon: Dumbbell },
];

export default function OnboardingPage() {
   const navigate = useNavigate();
   const { user, setUser } = useAuthStore();
   const userId = user?.id ?? '';
   const draft = useOnboardingStore(state => state.drafts[userId]) ?? EMPTY_ONBOARDING_DRAFT;
   const { initialize, updateDraft, clearDraft } = useOnboardingStore();
   const [loading, setLoading] = useState(true);
   const [loadError, setLoadError] = useState(false);
   const [attempt, setAttempt] = useState(0);
   const [recordedWeight, setRecordedWeight] = useState<BodyWeightRecord | null>(null);
   const [errors, setErrors] = useState<ReturnType<typeof getOnboardingErrors>>({});
   const [saveError, setSaveError] = useState('');
   const [saving, setSaving] = useState<'complete' | 'skip' | null>(null);
   const [destination, setDestination] = useState('/dashboard');
   const heading = useRef<HTMLHeadingElement>(null);
   const step = draft.step;

   useEffect(() => {
      if (!userId) return;
      let cancelled = false;
      setLoading(true);
      setLoadError(false);
      void Promise.all([authApi.getProfile(), bodyWeightApi.getAll({ limit: 1 })]).then(([profileResponse, weightResponse]) => {
         if (cancelled) return;
         const profile = profileResponse.data.data;
         const latest: BodyWeightRecord | null = weightResponse.data.data[0] ?? null;
         setRecordedWeight(latest);
         setUser(profile);
         initialize(userId, {
            step: 0, height: profile.height?.toString() ?? '', weight: (latest?.weight ?? profile.initialWeight)?.toString() ?? '',
            goal: ONBOARDING_GOALS.some(goal => goal.value === profile.goal) ? profile.goal : '', targetWeight: profile.targetWeight?.toString() ?? '',
         }, latest?.weight);
      }).catch(() => { if (!cancelled) setLoadError(true); })
         .finally(() => { if (!cancelled) setLoading(false); });
      return () => { cancelled = true; };
   }, [userId, attempt, initialize, setUser]);

   useEffect(() => {
      if (loading) return;
      heading.current?.focus();
      window.scrollTo({ top: 0 });
   }, [step, loading]);

   const change = (patch: Partial<OnboardingDraft>) => {
      updateDraft(userId, patch);
      setErrors({});
      setSaveError('');
   };

   const next = async (event: React.FormEvent) => {
      event.preventDefault();
      if (saving) return;
      const allErrors = getOnboardingErrors(draft);
      const relevant = step === 2 ? { height: allErrors.height, weight: allErrors.weight }
         : step === 3 ? { goal: allErrors.goal, targetWeight: allErrors.targetWeight } : step === 4 ? allErrors : {};
      const invalid = Object.entries(relevant).find(([, message]) => !!message);
      if (invalid) {
         setErrors(relevant);
         if (step === 4) updateDraft(userId, { step: invalid[0] === 'height' || invalid[0] === 'weight' ? 2 : 3 });
         document.getElementById(`onboarding-${invalid[0] === 'goal' ? 'goal-BULK' : invalid[0]}`)?.focus();
         return;
      }
      if (step < 4) { change({ step: step + 1 }); return; }
      const payload = getOnboardingPayload(draft);
      if (!payload) return;
      setSaving('complete');
      setSaveError('');
      try {
         const response = await authApi.completeOnboarding(payload);
         setUser(response.data.data);
         clearDraft(userId);
         toast.success('Configuração inicial salva');
         navigate(destination, { replace: true });
      } catch (error) {
         setSaveError(getApiErrorMessage(error, 'Não foi possível salvar. Seus dados foram mantidos para tentar novamente.'));
      } finally { setSaving(null); }
   };

   const skip = async () => {
      if (saving) return;
      setSaving('skip');
      setSaveError('');
      try {
         const response = await authApi.skipOnboarding();
         setUser(response.data.data);
         navigate('/dashboard', { replace: true });
      } catch (error) {
         setSaveError(getApiErrorMessage(error, 'Não foi possível continuar agora. Tente novamente.'));
      } finally { setSaving(null); }
   };

   const fieldError = (field: keyof typeof errors) => errors[field] ? <FieldMessage id={`onboarding-${field}-error`}>{errors[field]!}</FieldMessage> : null;

   return <div className="onboarding-shell min-h-dvh pb-[env(safe-area-inset-bottom)]">
      <header className="border-b border-border/50 bg-card/70">
         <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 pt-[max(.75rem,env(safe-area-inset-top))] sm:px-6">
            <div className="flex items-center gap-2.5"><BrandLogo className="h-9 w-9" /><span className="text-lg font-bold tracking-tight">Bulkio</span></div>
            <Button type="button" variant="ghost" disabled={!!saving} onClick={() => void skip()} className="text-xs sm:text-sm">{saving === 'skip' ? 'Aguarde…' : 'Continuar depois'}</Button>
         </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
         <div className="mb-6 space-y-3 lg:hidden">
            <p className="text-xs font-medium text-muted-foreground">Etapa {step + 1} de 5 · {ONBOARDING_STEPS[step]}</p>
            <div role="progressbar" aria-label="Progresso da configuração" aria-valuemin={1} aria-valuemax={5} aria-valuenow={step + 1} className="flex gap-1.5">{ONBOARDING_STEPS.map((name, index) => <span key={name} className={cn('h-1.5 flex-1 rounded-full bg-secondary', index <= step && 'onboarding-progress-filled bg-primary')} />)}</div>
         </div>
         <div className="grid items-start gap-8 lg:grid-cols-[14rem_minmax(0,1fr)]">
            <aside className="hidden space-y-7 pt-2 lg:block">
               <div><p className="text-xs font-semibold uppercase tracking-wider text-primary">Configuração inicial</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Apresentação do app e dados para começar.</p></div>
               <ol aria-label="Etapas da configuração" className="space-y-2">{ONBOARDING_STEPS.map((name, index) => <li key={name} aria-current={step === index ? 'step' : undefined} className={cn('flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-muted-foreground', step === index && 'bg-primary/8 font-semibold text-foreground')}><span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs', index <= step && 'bg-primary text-primary-foreground')}>{index < step ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}</span>{name}</li>)}</ol>
               <p className="text-xs leading-relaxed text-muted-foreground">Você pode voltar às etapas anteriores. O preenchimento fica salvo para retomar neste dispositivo.</p>
            </aside>
            <section className="min-w-0 overflow-clip rounded-3xl border border-border/60 bg-card shadow-[0_16px_60px_rgba(72,35,110,0.05)]">
               <div className="border-b border-border/50 bg-linear-to-br from-primary/6 to-transparent p-5 sm:p-8">
                  <p className="mb-2 text-xs font-semibold text-primary">{ONBOARDING_STEPS[step]}</p>
                  <h1 ref={heading} tabIndex={-1} className="text-2xl font-bold tracking-tight outline-none sm:text-3xl">{titles[step]}</h1>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">{descriptions[step]}</p>
               </div>
               {loading ? <LoadingState label="Carregando seus dados" /> : loadError ? <div className="p-5 sm:p-8"><ErrorState message="Não foi possível carregar seus dados iniciais." onRetry={() => setAttempt(value => value + 1)} /></div> : <form noValidate onSubmit={event => void next(event)}>
                  <fieldset disabled={!!saving} className="min-w-0">
                     <div key={step} className="space-y-5 p-5 sm:p-8 animate-fade-in">
                        {step === 0 && <>
                           <div className="flex items-center gap-3 rounded-2xl bg-secondary/35 p-4"><span className="brand-mark flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"><ListChecks className="h-6 w-6 text-primary" /></span><p className="text-sm leading-relaxed">Treinos, séries e medidas ficam na sua conta. Comece com os dados básicos e escolha como registrar seus treinos.</p></div>
                           <div className="grid gap-3 sm:grid-cols-3">{[
                              { icon: ClipboardList, title: 'Fichas e treino livre', text: 'Crie fichas reutilizáveis ou escolha exercícios do catálogo em cada treino.' },
                              { icon: Timer, title: 'Séries e descanso', text: 'Registre repetições e cargas, edite séries e controle o intervalo de descanso.' },
                              { icon: ChartNoAxesColumnIncreasing, title: 'Resumo e peso', text: 'Consulte recordes, volume, grupos treinados e evolução do peso corporal.' },
                           ].map(({ icon: Icon, title, text }) => <article key={title} className="rounded-2xl border border-border/60 p-4"><Icon className="mb-4 h-6 w-6 text-primary" aria-hidden="true" /><h2 className="text-sm font-semibold">{title}</h2><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{text}</p></article>)}</div>
                           <p className="text-xs leading-relaxed text-muted-foreground">Você poderá rever este guia e ajustar os dados pelo perfil.</p>
                        </>}
                        {step === 1 && <>
                           <div className="grid gap-3 sm:grid-cols-2"><article className="rounded-2xl border border-border/60 p-4"><ClipboardList className="mb-3 h-6 w-6 text-primary" /><h2 className="font-semibold">Com ficha</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Na aba Fichas, organize exercícios, séries, repetições e descanso. Use Treinar agora para iniciar uma sessão.</p></article><article className="rounded-2xl border border-primary/20 bg-primary/4 p-4"><Dumbbell className="mb-3 h-6 w-6 text-primary" /><h2 className="font-semibold">Sem ficha</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Em Treinos, toque em Registrar treino e escolha Treino livre. Depois, selecione exercícios do catálogo em cada série.</p></article></div>
                           <div className="rounded-2xl border border-border/60 p-4"><p className="mb-3 text-xs font-medium text-muted-foreground">Exemplo de uma série</p><div className="grid grid-cols-3 gap-2 rounded-xl bg-secondary/40 p-3 text-center">{[['Série', '1'], ['Repetições', '10'], ['Carga', '20 kg']].map(([label, value]) => <div key={label}><p className="text-[11px] text-muted-foreground">{label}</p><p className="mt-1 text-lg font-semibold tabular-nums">{value}</p></div>)}</div><p className="mt-3 text-xs leading-relaxed text-muted-foreground">Repetições e cargas podem ser editadas diretamente na série, inclusive em treinos concluídos.</p></div>
                           <div className="flex items-start gap-3 rounded-2xl bg-primary/6 p-4"><Timer className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><div><h2 className="text-sm font-semibold">Timer de descanso</h2><p className="mt-1 text-xs leading-relaxed text-muted-foreground">O tempo decorrido é mantido mesmo ao bloquear a tela. Use Finalizar descanso para encerrar o timer.</p></div></div>
                        </>}
                        {step === 2 && <>
                           <div className="grid gap-5 sm:grid-cols-2">
                              <div className="form-field"><Label htmlFor="onboarding-height" className="flex items-center gap-2"><Ruler className="h-4 w-4 text-primary" />Altura (cm)</Label><Input id="onboarding-height" type="text" inputMode="decimal" placeholder="Ex.: 176" value={draft.height} onChange={event => change({ height: event.target.value })} aria-invalid={!!errors.height} aria-describedby={errors.height ? 'onboarding-height-error' : 'onboarding-height-help'} /><p id="onboarding-height-help" className="text-xs leading-relaxed text-muted-foreground">Informe em centímetros. A altura é usada no cálculo do IMC.</p>{fieldError('height')}</div>
                              <div className="form-field"><Label htmlFor="onboarding-weight" className="flex items-center gap-2"><Scale className="h-4 w-4 text-primary" />Peso atual (kg)</Label><Input id="onboarding-weight" type="text" inputMode="decimal" placeholder="Ex.: 75,5" value={draft.weight} readOnly={!!recordedWeight} onChange={event => change({ weight: event.target.value })} aria-invalid={!!errors.weight} aria-describedby={errors.weight ? 'onboarding-weight-error' : 'onboarding-weight-help'} /><p id="onboarding-weight-help" className="text-xs leading-relaxed text-muted-foreground">{recordedWeight ? 'Usamos sua medida já registrada. Novos registros podem ser adicionados na aba Peso.' : 'Inicia seu histórico de peso e pode ser usado como carga em exercícios de peso corporal.'}</p>{fieldError('weight')}</div>
                           </div>
                           <p className="rounded-xl bg-secondary/35 p-4 text-xs leading-relaxed text-muted-foreground">Use as medidas que você conhece hoje. Os dados podem ser atualizados depois. O peso alvo será opcional na próxima etapa.</p>
                        </>}
                        {step === 3 && <>
                           <div role="group" aria-label="Objetivo de treino" aria-describedby={errors.goal ? 'onboarding-goal-error' : undefined} className="space-y-3">{ONBOARDING_GOALS.map(goal => <button key={goal.value} id={`onboarding-goal-${goal.value}`} type="button" aria-pressed={draft.goal === goal.value} onClick={() => change({ goal: goal.value })} className={cn('flex min-h-20 w-full items-center gap-3 rounded-2xl border border-border/60 p-4 text-left transition-colors hover:border-primary/40', draft.goal === goal.value && 'border-primary/50 bg-primary/7')}><span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border', draft.goal === goal.value && 'border-primary bg-primary text-primary-foreground')}>{draft.goal === goal.value && <Check className="h-4 w-4" aria-hidden="true" />}</span><span><span className="block text-sm font-semibold">{goal.label}</span><span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{goal.description}</span></span></button>)}</div>
                           {fieldError('goal')}
                           <div className="form-field"><Label htmlFor="onboarding-targetWeight">Peso alvo (kg, opcional)</Label><Input id="onboarding-targetWeight" type="text" inputMode="decimal" placeholder="Deixe vazio se ainda não definiu uma meta" value={draft.targetWeight} onChange={event => change({ targetWeight: event.target.value })} aria-invalid={!!errors.targetWeight} aria-describedby={errors.targetWeight ? 'onboarding-targetWeight-error' : undefined} />{fieldError('targetWeight')}<p className="text-xs text-muted-foreground">A meta serve como referência no gráfico de peso. Não é uma recomendação automática do app.</p></div>
                        </>}
                        {step === 4 && <>
                           <dl className="grid grid-cols-2 gap-3">{[
                              ['Altura', `${formatKilograms(Number(draft.height.replace(',', '.')))} cm`],
                              [recordedWeight ? 'Peso registrado' : 'Primeiro registro de peso', `${formatKilograms(Number(draft.weight.replace(',', '.')))} kg`],
                              ['Objetivo', ONBOARDING_GOALS.find(goal => goal.value === draft.goal)?.label ?? '—'],
                              ['Peso alvo', draft.targetWeight.trim() ? `${formatKilograms(Number(draft.targetWeight.replace(',', '.')))} kg` : 'Não definido'],
                           ].map(([label, value]) => <div key={label} className="min-w-0 rounded-2xl bg-secondary/35 p-4"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-2 text-base font-semibold break-words">{value}</dd></div>)}</dl>
                           <div><h2 className="mb-3 flex items-center gap-2 text-sm font-semibold"><Target className="h-4 w-4 text-primary" />Qual área deseja abrir?</h2><div role="group" aria-label="Área após a configuração" className="space-y-2">{destinations.map(({ path, label, description, icon: Icon }) => <button key={path} type="button" aria-pressed={destination === path} onClick={() => setDestination(path)} className={cn('flex min-h-16 w-full items-center gap-3 rounded-xl border border-border/60 px-4 py-3 text-left', destination === path && 'border-primary/40 bg-primary/6')}><Icon className="h-5 w-5 shrink-0 text-primary" /><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{label}</span><span className="mt-1 block text-xs text-muted-foreground">{description}</span></span>{destination === path && <Check className="h-4 w-4 shrink-0 text-primary" />}</button>)}</div></div>
                        </>}
                     </div>
                     <footer className="sticky bottom-0 z-10 space-y-3 border-t border-border/50 bg-card/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:px-8 sm:py-5">
                        {saveError && <p role="alert" className="rounded-xl border border-destructive/25 bg-destructive/5 p-3 text-sm text-destructive">{saveError}</p>}
                        <div className="flex items-center justify-between gap-3">
                        <Button type="button" variant="ghost" disabled={step === 0} onClick={() => change({ step: step - 1 })}><ArrowLeft className="h-4 w-4" />Voltar</Button>
                        <Button type="submit" disabled={!!saving}>{saving === 'complete' ? <><LoaderCircle className="h-4 w-4 animate-spin" />Salvando…</> : step === 4 ? <><Check className="h-4 w-4" />Concluir</> : <>Continuar<ArrowRight className="h-4 w-4" /></>}</Button>
                        </div>
                     </footer>
                  </fieldset>
               </form>}
               {loadError && saveError && <p role="alert" className="p-5 text-sm text-destructive">{saveError}</p>}
            </section>
         </div>
      </main>
   </div>;
}
