import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Exercise } from '@/services/exerciseService';

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
         <Label>{label}</Label>
         <div className="relative" ref={dropdownRef}>
            <Input
               placeholder={placeholder}
               value={search}
               onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); }}
               onFocus={() => search && setShowDropdown(true)}
            />
            {showDropdown && search && (
               <div className={`absolute z-10 w-full mt-1 ${maxHeight} overflow-y-auto rounded-md border bg-background shadow-lg`}>
                  {filtered.slice(0, maxResults).map((ex) => (
                     <button
                        key={ex.id}
                        type="button"
                        onClick={() => handleSelect(ex)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                     >
                        {ex.name}
                        {showMuscleGroup && (
                           <span className="text-muted-foreground text-xs ml-1">
                              ({ex.muscleGroup})
                           </span>
                        )}
                     </button>
                  ))}
                  {filtered.length === 0 && (
                     <p className="px-3 py-2 text-sm text-muted-foreground">Nenhum encontrado</p>
                  )}
               </div>
            )}
         </div>
      </div>
   );
}
