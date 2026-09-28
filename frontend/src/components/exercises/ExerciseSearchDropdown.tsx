import { useState, useEffect, useId, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Exercise } from '@/services/exerciseService';
import { muscleGroupLabels } from '@/lib/exerciseLabels';

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

   const filtered = exercises.filter(
      (e) => e.name.toLowerCase().includes(search.toLowerCase()),
   );

   const handleSelect = (exercise: Exercise) => {
      onSelect(exercise);
      setSearch('');
      setShowDropdown(false);
   };

   return (
      <div className="space-y-2">
         <Label htmlFor={inputId}>{label}</Label>
         <div className="relative" ref={dropdownRef}>
            <Input
               id={inputId}
               role="combobox"
               aria-expanded={showDropdown && !!search}
               aria-controls={listboxId}
               aria-autocomplete="list"
               placeholder={placeholder}
               value={search}
               onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); }}
               onFocus={() => search && setShowDropdown(true)}
               onKeyDown={(event) => {
                  if (event.key === 'Escape') setShowDropdown(false);
                  if (event.key === 'Enter' && filtered.length > 0 && search) {
                     event.preventDefault();
                     handleSelect(filtered[0]);
                  }
               }}
            />
            {showDropdown && search && (
               <div id={listboxId} role="listbox" className={`absolute z-20 mt-2 w-full ${maxHeight} overflow-y-auto rounded-xl border bg-popover p-1.5 shadow-xl`}>
                  {filtered.slice(0, maxResults).map((ex) => (
                     <button
                        key={ex.id}
                        type="button"
                        role="option"
                        aria-selected="false"
                        onClick={() => handleSelect(ex)}
                        className="min-h-11 w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
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
               </div>
            )}
         </div>
      </div>
   );
}
