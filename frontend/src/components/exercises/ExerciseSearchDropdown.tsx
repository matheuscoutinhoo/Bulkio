import { useState, useEffect, useId, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Exercise } from '@/services/exerciseService';
import { equipmentLabels, muscleGroupLabels } from '@/lib/exerciseLabels';
import { normalizeSearch } from '@/lib/search';

interface ExerciseSearchDropdownProps {
   exercises: Exercise[];
   onSelect: (exercise: Exercise) => void;
   label?: string;
   placeholder?: string;
   maxResults?: number;
   maxHeight?: string;
   showMuscleGroup?: boolean;
}

export function ExerciseSearchDropdown({
   exercises,
   onSelect,
   label = 'Adicionar Exercício',
   placeholder = 'Buscar exercício...',
   maxResults = 10,
   maxHeight = 'max-h-48',
   showMuscleGroup = false,
}: ExerciseSearchDropdownProps) {
   const [search, setSearch] = useState('');
   const [showDropdown, setShowDropdown] = useState(false);
   const [activeIndex, setActiveIndex] = useState(0);
   const dropdownRef = useRef<HTMLDivElement>(null);
   const inputId = useId();
   const listboxId = `${inputId}-listbox`;

   useEffect(() => {
      function handleClickOutside(e: MouseEvent) {
         if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
            setShowDropdown(false);
         }
      }
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
   }, []);

   const filtered = exercises.filter(exercise => normalizeSearch([
      exercise.name, muscleGroupLabels[exercise.muscleGroup], equipmentLabels[exercise.equipment],
      exercise.equipment === 'BODYWEIGHT' ? 'Peso corporal' : exercise.equipment === 'DUMBBELL' ? 'Halteres' : exercise.equipment,
   ].join(' ')).includes(normalizeSearch(search)));
   const results = filtered.slice(0, maxResults);
   const activeResult = Math.min(activeIndex, results.length - 1);

   const handleSelect = (exercise: Exercise) => {
      onSelect(exercise);
      setSearch('');
      setShowDropdown(false);
      setActiveIndex(0);
   };

   return (
      <div className="form-field">
         <Label htmlFor={inputId}>{label}</Label>
         <div className="relative" ref={dropdownRef}>
            <Input
               id={inputId}
               role="combobox"
               aria-expanded={showDropdown}
               aria-controls={listboxId}
               aria-activedescendant={showDropdown && results.length ? `${listboxId}-${activeResult}` : undefined}
               aria-autocomplete="list"
               placeholder={placeholder}
               value={search}
               onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); setActiveIndex(0); }}
               onFocus={() => { setShowDropdown(true); setActiveIndex(0); }}
               onKeyDown={(event) => {
                  if (event.key === 'Escape' && showDropdown) {
                     event.preventDefault();
                     event.stopPropagation();
                     setShowDropdown(false);
                  }
                  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                     event.preventDefault();
                     setShowDropdown(true);
                     const nextIndex = results.length ? (activeResult + (event.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length : 0;
                     setActiveIndex(nextIndex);
                     requestAnimationFrame(() => document.getElementById(`${listboxId}-${nextIndex}`)?.scrollIntoView({ block: 'nearest' }));
                  }
                  if (event.key === 'Enter') {
                     event.preventDefault();
                     if (showDropdown && results.length) handleSelect(results[activeResult]);
                  }
               }}
            />
            {showDropdown && (
               <div id={listboxId} role="listbox" aria-label={label} className={`relative z-20 mt-2 w-full ${maxHeight} overflow-y-auto overscroll-contain rounded-xl border bg-popover p-1.5 shadow-xl sm:absolute`}>
                  {results.map((ex, index) => (
                     <button
                        key={ex.id}
                        id={`${listboxId}-${index}`}
                        type="button"
                        tabIndex={-1}
                        role="option"
                        aria-selected={index === activeResult}
                        onClick={() => handleSelect(ex)}
                        className={`min-h-11 w-full rounded-lg px-3 py-2 text-left text-sm [overflow-wrap:anywhere] hover:bg-accent transition-colors ${index === activeResult ? 'bg-accent' : ''}`}
                     >
                        {ex.name}
                        {showMuscleGroup && (
                           <span className="text-muted-foreground text-xs ml-1">
                              ({muscleGroupLabels[ex.muscleGroup] || ex.muscleGroup})
                           </span>
                        )}
                     </button>
                  ))}
                  {filtered.length === 0 && (
                     <p className="px-3 py-3 text-sm text-muted-foreground">Nenhum exercício encontrado</p>
                  )}
                  {filtered.length > maxResults && <p className="px-3 py-2 text-xs text-muted-foreground">{maxResults} de {filtered.length} exercícios. Refine a busca para ver os demais.</p>}
               </div>
            )}
         </div>
      </div>
   );
}
