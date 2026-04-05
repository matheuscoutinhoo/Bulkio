import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { muscleGroupLabels, typeLabels, equipmentLabels } from '@/lib/exerciseLabels';
import { Dumbbell, User, Play } from 'lucide-react';
import { useState } from 'react';

interface ExerciseInfo {
   id: number | string;
   name: string;
   muscleGroup: string;
   type?: string;
   equipment?: string;
   description?: string | null;
   videoUrl?: string | null;
   isCustom?: boolean;
}

interface ExerciseDetailModalProps {
   exercise: ExerciseInfo | null;
   open: boolean;
   onClose: () => void;
}

function getYouTubeId(url: string): string | null {
   const match = url.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
   return match ? match[1] : null;
}

export function ExerciseDetailModal({ exercise, open, onClose }: ExerciseDetailModalProps) {
   const [playing, setPlaying] = useState(false);

   if (!exercise) return null;

   const videoId = exercise.videoUrl ? getYouTubeId(exercise.videoUrl) : null;

   const handleClose = () => {
      setPlaying(false);
      onClose();
   };

   return (
      <Dialog open={open} onClose={handleClose}>
         <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
               <Dumbbell className="h-5 w-5 text-primary" />
               {exercise.name}
            </DialogTitle>
         </DialogHeader>

         <div className="space-y-5">
            {/* YouTube Video */}
            {videoId && (
               <div className="flex justify-center">
                  <div className="w-full aspect-video rounded-xl overflow-hidden bg-black relative">
                     {playing ? (
                        <iframe
                           src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                           className="w-full h-full"
                           allow="autoplay; encrypted-media"
                           allowFullScreen
                           title={exercise.name}
                        />
                     ) : (
                        <button
                           onClick={() => setPlaying(true)}
                           className="w-full h-full relative group cursor-pointer"
                        >
                           <img
                              src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                              alt={exercise.name}
                              className="w-full h-full object-cover"
                           />
                           <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                              <div className="w-16 h-16 rounded-full bg-primary/90 group-hover:bg-primary flex items-center justify-center transition-colors shadow-lg">
                                 <Play className="h-7 w-7 text-primary-foreground ml-1" fill="currentColor" />
                              </div>
                           </div>
                        </button>
                     )}
                  </div>
               </div>
            )}

            {/* Badges */}
            <div className="flex flex-wrap justify-center gap-2">
               <Badge variant="secondary">{muscleGroupLabels[exercise.muscleGroup] || exercise.muscleGroup}</Badge>
               {exercise.type && (
                  <Badge variant="outline">{typeLabels[exercise.type] || exercise.type}</Badge>
               )}
               {exercise.equipment && (
                  <Badge variant="outline">{equipmentLabels[exercise.equipment] || exercise.equipment}</Badge>
               )}
               {exercise.isCustom && (
                  <Badge className="gap-1">
                     <User className="h-3 w-3" />
                     Personalizado
                  </Badge>
               )}
            </div>

            {/* Info rows */}
            <div className="space-y-3 text-sm">
               <InfoRow label="Grupo Muscular" value={muscleGroupLabels[exercise.muscleGroup] || exercise.muscleGroup} />
               {exercise.type && (
                  <InfoRow label="Tipo" value={typeLabels[exercise.type] || exercise.type} />
               )}
               {exercise.equipment && (
                  <InfoRow label="Equipamento" value={equipmentLabels[exercise.equipment] || exercise.equipment} />
               )}
               {exercise.description && (
                  <div className="pt-2 border-t">
                     <p className="text-xs font-medium text-muted-foreground mb-1">Descrição</p>
                     <p className="text-sm">{exercise.description}</p>
                  </div>
               )}
            </div>
         </div>
      </Dialog>
   );
}

function InfoRow({ label, value }: { label: string; value: string }) {
   return (
      <div className="flex justify-between items-center">
         <span className="text-muted-foreground">{label}</span>
         <span className="font-medium">{value}</span>
      </div>
   );
}
