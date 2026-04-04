import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ExerciseSeed {
   name: string;
   muscleGroup: string;
   type: string;
   equipment: string;
   description: string;
}

const exercises: ExerciseSeed[] = [
   // ========== CHEST (25) ==========
   { name: 'Barbell Bench Press', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BARBELL', description: 'Lie on bench, lower barbell to chest, press up.' },
   { name: 'Incline Barbell Bench Press', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BARBELL', description: 'Bench at 30-45° incline, press barbell from upper chest.' },
   { name: 'Decline Barbell Bench Press', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BARBELL', description: 'Bench at decline angle, press barbell from lower chest.' },
   { name: 'Dumbbell Bench Press', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Lie on bench, press dumbbells up from chest level.' },
   { name: 'Incline Dumbbell Bench Press', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Incline bench, press dumbbells from upper chest.' },
   { name: 'Decline Dumbbell Bench Press', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Decline bench, press dumbbells from lower chest.' },
   { name: 'Dumbbell Fly', muscleGroup: 'CHEST', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Lie on bench, arc dumbbells outward then squeeze together.' },
   { name: 'Incline Dumbbell Fly', muscleGroup: 'CHEST', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Incline bench, arc dumbbells outward then squeeze together.' },
   { name: 'Cable Crossover', muscleGroup: 'CHEST', type: 'ISOLATED', equipment: 'CABLE', description: 'Stand between cables, bring handles together in front of chest.' },
   { name: 'Low Cable Crossover', muscleGroup: 'CHEST', type: 'ISOLATED', equipment: 'CABLE', description: 'Low pulleys, bring cables upward and together.' },
   { name: 'Machine Chest Press', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'MACHINE', description: 'Seated machine press for chest.' },
   { name: 'Pec Deck Fly', muscleGroup: 'CHEST', type: 'ISOLATED', equipment: 'MACHINE', description: 'Seated machine, bring pads together in front.' },
   { name: 'Push-Up', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Hands on floor, lower body, push up.' },
   { name: 'Diamond Push-Up', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Push-up with hands close together forming diamond shape.' },
   { name: 'Wide Push-Up', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Push-up with hands wider than shoulder width.' },
   { name: 'Decline Push-Up', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Push-up with feet elevated on bench.' },
   { name: 'Dips (Chest)', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Lean forward on dip bars, lower and press body up.' },
   { name: 'Landmine Press', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BARBELL', description: 'Press barbell anchored at one end from chest level.' },
   { name: 'Smith Machine Bench Press', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'MACHINE', description: 'Bench press on Smith machine for guided movement.' },
   { name: 'Incline Machine Press', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'MACHINE', description: 'Incline press on machine for upper chest.' },
   { name: 'Cable Chest Press', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'CABLE', description: 'Standing cable press forward from chest height.' },
   { name: 'Svend Press', muscleGroup: 'CHEST', type: 'ISOLATED', equipment: 'OTHER', description: 'Squeeze plates together and press forward from chest.' },
   { name: 'Floor Press', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BARBELL', description: 'Bench press from the floor, limited range of motion.' },
   { name: 'Dumbbell Pullover', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Lie on bench, lower dumbbell behind head then pull over.' },
   { name: 'Close-Grip Bench Press', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BARBELL', description: 'Bench press with narrow grip for inner chest and triceps.' },

   // ========== BACK (30) ==========
   { name: 'Barbell Deadlift', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BARBELL', description: 'Lift barbell from floor by extending hips and knees.' },
   { name: 'Conventional Deadlift', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BARBELL', description: 'Hip-width stance deadlift.' },
   { name: 'Sumo Deadlift', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BARBELL', description: 'Wide stance deadlift with hands inside knees.' },
   { name: 'Romanian Deadlift', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BARBELL', description: 'Hinge at hips with slight knee bend, lower barbell along legs.' },
   { name: 'Barbell Row', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BARBELL', description: 'Bend over, pull barbell to lower chest/upper abdomen.' },
   { name: 'Pendlay Row', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BARBELL', description: 'Strict bent-over row from floor each rep.' },
   { name: 'Dumbbell Row', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'One-arm row with knee on bench for support.' },
   { name: 'T-Bar Row', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BARBELL', description: 'Row with T-bar or landmine attachment.' },
   { name: 'Seated Cable Row', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'CABLE', description: 'Seated, pull cable handle to abdomen.' },
   { name: 'Wide Grip Seated Cable Row', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'CABLE', description: 'Seated cable row with wide bar attachment.' },
   { name: 'Lat Pulldown', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'CABLE', description: 'Pull bar down to upper chest from overhead.' },
   { name: 'Wide Grip Lat Pulldown', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'CABLE', description: 'Lat pulldown with wide overhand grip.' },
   { name: 'Close Grip Lat Pulldown', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'CABLE', description: 'Lat pulldown with narrow V-bar attachment.' },
   { name: 'Reverse Grip Lat Pulldown', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'CABLE', description: 'Lat pulldown with underhand grip.' },
   { name: 'Pull-Up', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Hang from bar, pull body up until chin over bar.' },
   { name: 'Chin-Up', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Pull-up with underhand (supinated) grip.' },
   { name: 'Neutral Grip Pull-Up', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Pull-up with palms facing each other.' },
   { name: 'Machine Row', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'MACHINE', description: 'Chest-supported machine row.' },
   { name: 'Chest Supported Dumbbell Row', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Row dumbbells while chest is supported on incline bench.' },
   { name: 'Cable Face Pull', muscleGroup: 'BACK', type: 'ISOLATED', equipment: 'CABLE', description: 'Pull rope to face level with external rotation.' },
   { name: 'Straight Arm Pulldown', muscleGroup: 'BACK', type: 'ISOLATED', equipment: 'CABLE', description: 'Arms straight, pull bar down from overhead to thighs.' },
   { name: 'Meadows Row', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BARBELL', description: 'One-arm landmine row from perpendicular stance.' },
   { name: 'Inverted Row', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Pull body up to bar from underneath.' },
   { name: 'Rack Pull', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BARBELL', description: 'Deadlift from elevated position (rack or blocks).' },
   { name: 'Good Morning', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BARBELL', description: 'Bar on back, hinge forward at hips.' },
   { name: 'Hyperextension', muscleGroup: 'BACK', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Face down on hyperextension bench, extend torso up.' },
   { name: 'Reverse Hyperextension', muscleGroup: 'BACK', type: 'ISOLATED', equipment: 'MACHINE', description: 'Reverse hyper machine, extend legs behind.' },
   { name: 'Dumbbell Shrug', muscleGroup: 'BACK', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Shrug shoulders up while holding dumbbells.' },
   { name: 'Barbell Shrug', muscleGroup: 'BACK', type: 'ISOLATED', equipment: 'BARBELL', description: 'Shrug shoulders up while holding barbell.' },
   { name: 'Single Arm Cable Row', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'CABLE', description: 'One-arm cable row for unilateral back work.' },

   // ========== LEGS (35) ==========
   { name: 'Barbell Back Squat', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'BARBELL', description: 'Bar on upper back, squat down and up.' },
   { name: 'Front Squat', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'BARBELL', description: 'Bar on front delts, squat down and up.' },
   { name: 'Goblet Squat', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Hold dumbbell at chest, squat down and up.' },
   { name: 'Hack Squat', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'MACHINE', description: 'Machine squat with back supported on angled pad.' },
   { name: 'Smith Machine Squat', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'MACHINE', description: 'Squat on Smith machine for guided movement.' },
   { name: 'Leg Press', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'MACHINE', description: 'Push platform away with feet from seated position.' },
   { name: 'Leg Extension', muscleGroup: 'LEGS', type: 'ISOLATED', equipment: 'MACHINE', description: 'Seated, extend knees against pad to work quads.' },
   { name: 'Leg Curl (Lying)', muscleGroup: 'LEGS', type: 'ISOLATED', equipment: 'MACHINE', description: 'Lying face down, curl heels toward glutes.' },
   { name: 'Leg Curl (Seated)', muscleGroup: 'LEGS', type: 'ISOLATED', equipment: 'MACHINE', description: 'Seated, curl heels under seat.' },
   { name: 'Leg Curl (Standing)', muscleGroup: 'LEGS', type: 'ISOLATED', equipment: 'MACHINE', description: 'Standing single-leg curl.' },
   { name: 'Bulgarian Split Squat', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Rear foot elevated on bench, squat on front leg.' },
   { name: 'Walking Lunge', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Step forward into lunge, alternate legs walking.' },
   { name: 'Reverse Lunge', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Step backward into lunge position.' },
   { name: 'Lateral Lunge', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Step to the side into a lateral squat.' },
   { name: 'Step-Up', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Step up onto bench or platform with dumbbells.' },
   { name: 'Dumbbell Romanian Deadlift', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Romanian deadlift with dumbbells.' },
   { name: 'Single Leg Romanian Deadlift', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'RDL on one leg for balance and hamstring work.' },
   { name: 'Barbell Hip Thrust', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'BARBELL', description: 'Back on bench, thrust hips up with barbell on lap.' },
   { name: 'Glute Bridge', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Lie on floor, drive hips up squeezing glutes.' },
   { name: 'Dumbbell Hip Thrust', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Hip thrust with dumbbell on lap.' },
   { name: 'Sissy Squat', muscleGroup: 'LEGS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Lean back with knees forward to isolate quads.' },
   { name: 'Box Squat', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'BARBELL', description: 'Squat to seated position on box then stand.' },
   { name: 'Zercher Squat', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'BARBELL', description: 'Bar held in crook of elbows, squat.' },
   { name: 'Pistol Squat', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Single-leg squat with other leg extended.' },
   { name: 'Belt Squat', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'MACHINE', description: 'Squat with weight attached to belt.' },
   { name: 'Pendulum Squat', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'MACHINE', description: 'Machine squat with pendulum arc movement.' },
   { name: 'Adductor Machine', muscleGroup: 'LEGS', type: 'ISOLATED', equipment: 'MACHINE', description: 'Seated machine to work inner thigh muscles.' },
   { name: 'Abductor Machine', muscleGroup: 'LEGS', type: 'ISOLATED', equipment: 'MACHINE', description: 'Seated machine to work outer hip muscles.' },
   { name: 'Nordic Hamstring Curl', muscleGroup: 'LEGS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Kneel, lower body forward controlling with hamstrings.' },
   { name: 'Calf Raise (Standing)', muscleGroup: 'CALVES', type: 'ISOLATED', equipment: 'MACHINE', description: 'Stand on platform, raise heels up.' },
   { name: 'Calf Raise (Seated)', muscleGroup: 'CALVES', type: 'ISOLATED', equipment: 'MACHINE', description: 'Seated calf raise targeting soleus.' },
   { name: 'Donkey Calf Raise', muscleGroup: 'CALVES', type: 'ISOLATED', equipment: 'MACHINE', description: 'Bent-over calf raise on machine.' },
   { name: 'Smith Machine Calf Raise', muscleGroup: 'CALVES', type: 'ISOLATED', equipment: 'MACHINE', description: 'Calf raises on Smith machine.' },
   { name: 'Bodyweight Calf Raise', muscleGroup: 'CALVES', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Calf raise using only body weight on step.' },
   { name: 'Leg Press Calf Raise', muscleGroup: 'CALVES', type: 'ISOLATED', equipment: 'MACHINE', description: 'Calf raise on leg press machine.' },

   // ========== SHOULDERS (25) ==========
   { name: 'Overhead Press (Barbell)', muscleGroup: 'SHOULDERS', type: 'COMPOUND', equipment: 'BARBELL', description: 'Press barbell overhead from shoulders.' },
   { name: 'Seated Dumbbell Shoulder Press', muscleGroup: 'SHOULDERS', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Seated, press dumbbells overhead.' },
   { name: 'Standing Dumbbell Shoulder Press', muscleGroup: 'SHOULDERS', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Standing, press dumbbells overhead.' },
   { name: 'Arnold Press', muscleGroup: 'SHOULDERS', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Rotate dumbbells from front to side while pressing up.' },
   { name: 'Machine Shoulder Press', muscleGroup: 'SHOULDERS', type: 'COMPOUND', equipment: 'MACHINE', description: 'Seated machine overhead press.' },
   { name: 'Smith Machine Overhead Press', muscleGroup: 'SHOULDERS', type: 'COMPOUND', equipment: 'MACHINE', description: 'Overhead press on Smith machine.' },
   { name: 'Lateral Raise', muscleGroup: 'SHOULDERS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Raise dumbbells to sides until shoulder height.' },
   { name: 'Cable Lateral Raise', muscleGroup: 'SHOULDERS', type: 'ISOLATED', equipment: 'CABLE', description: 'Lateral raise using cable for constant tension.' },
   { name: 'Machine Lateral Raise', muscleGroup: 'SHOULDERS', type: 'ISOLATED', equipment: 'MACHINE', description: 'Lateral raise on dedicated machine.' },
   { name: 'Front Raise', muscleGroup: 'SHOULDERS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Raise dumbbells to front until shoulder height.' },
   { name: 'Cable Front Raise', muscleGroup: 'SHOULDERS', type: 'ISOLATED', equipment: 'CABLE', description: 'Front raise using cable.' },
   { name: 'Barbell Front Raise', muscleGroup: 'SHOULDERS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Raise barbell to front until shoulder height.' },
   { name: 'Rear Delt Fly', muscleGroup: 'SHOULDERS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Bent over, raise dumbbells to sides for rear delts.' },
   { name: 'Reverse Pec Deck', muscleGroup: 'SHOULDERS', type: 'ISOLATED', equipment: 'MACHINE', description: 'Reverse fly on pec deck machine for rear delts.' },
   { name: 'Cable Rear Delt Fly', muscleGroup: 'SHOULDERS', type: 'ISOLATED', equipment: 'CABLE', description: 'Rear delt fly using cables.' },
   { name: 'Upright Row', muscleGroup: 'SHOULDERS', type: 'COMPOUND', equipment: 'BARBELL', description: 'Pull barbell up along body to chin level.' },
   { name: 'Dumbbell Upright Row', muscleGroup: 'SHOULDERS', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Upright row with dumbbells.' },
   { name: 'Behind the Neck Press', muscleGroup: 'SHOULDERS', type: 'COMPOUND', equipment: 'BARBELL', description: 'Press barbell overhead from behind neck.' },
   { name: 'Push Press', muscleGroup: 'SHOULDERS', type: 'COMPOUND', equipment: 'BARBELL', description: 'Use leg drive to help press barbell overhead.' },
   { name: 'Z Press', muscleGroup: 'SHOULDERS', type: 'COMPOUND', equipment: 'BARBELL', description: 'Seated on floor with legs extended, press overhead.' },
   { name: 'Lu Raise', muscleGroup: 'SHOULDERS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Lateral raise with thumbs up, slight forward angle.' },
   { name: 'Cable Face Pull', muscleGroup: 'SHOULDERS', type: 'ISOLATED', equipment: 'CABLE', description: 'Pull rope to face level with external rotation.' },
   { name: 'Band Pull Apart', muscleGroup: 'SHOULDERS', type: 'ISOLATED', equipment: 'BAND', description: 'Pull resistance band apart at chest level.' },
   { name: 'Plate Front Raise', muscleGroup: 'SHOULDERS', type: 'ISOLATED', equipment: 'OTHER', description: 'Raise a plate to front until shoulder height.' },
   { name: 'Kettlebell Press', muscleGroup: 'SHOULDERS', type: 'COMPOUND', equipment: 'KETTLEBELL', description: 'Press kettlebell overhead from rack position.' },

   // ========== BICEPS (20) ==========
   { name: 'Barbell Curl', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Curl barbell up with underhand grip.' },
   { name: 'EZ Bar Curl', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Curl EZ bar for wrist-friendly bicep curl.' },
   { name: 'Dumbbell Curl', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Curl dumbbells alternating or simultaneously.' },
   { name: 'Hammer Curl', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Curl with neutral (hammer) grip.' },
   { name: 'Incline Dumbbell Curl', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Curl dumbbells while seated on incline bench.' },
   { name: 'Concentration Curl', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Seated, curl dumbbell with elbow braced on inner thigh.' },
   { name: 'Preacher Curl', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Curl on preacher bench to isolate biceps.' },
   { name: 'Dumbbell Preacher Curl', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'One-arm preacher curl with dumbbell.' },
   { name: 'Cable Curl', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'CABLE', description: 'Curl using cable machine for constant tension.' },
   { name: 'Cable Hammer Curl', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'CABLE', description: 'Hammer curl using rope attachment on cable.' },
   { name: 'Spider Curl', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Curl with chest on incline bench for strict form.' },
   { name: 'Machine Bicep Curl', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'MACHINE', description: 'Bicep curl on dedicated machine.' },
   { name: 'Reverse Curl', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Curl with overhand grip for brachioradialis.' },
   { name: 'Zottman Curl', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Curl up supinated, rotate, lower pronated.' },
   { name: 'Cross Body Hammer Curl', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Hammer curl across the body toward opposite shoulder.' },
   { name: 'Drag Curl', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Curl barbell keeping it close to body, elbows back.' },
   { name: 'Cable Bayesian Curl', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'CABLE', description: 'Curl with arm behind body for long head stretch.' },
   { name: '21s Curl', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'BARBELL', description: '7 lower half + 7 upper half + 7 full range curls.' },
   { name: 'Kettlebell Curl', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'KETTLEBELL', description: 'Bicep curl with kettlebell.' },
   { name: 'Band Curl', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'BAND', description: 'Bicep curl using resistance band.' },

   // ========== TRICEPS (20) ==========
   { name: 'Tricep Pushdown', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'CABLE', description: 'Push cable bar or rope down extending elbows.' },
   { name: 'Tricep Rope Pushdown', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'CABLE', description: 'Pushdown with rope attachment, split at bottom.' },
   { name: 'Overhead Tricep Extension (Cable)', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'CABLE', description: 'Face away from cable, extend rope overhead.' },
   { name: 'Overhead Tricep Extension (Dumbbell)', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Hold dumbbell overhead, lower behind head, extend.' },
   { name: 'Skull Crusher', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Lie on bench, lower barbell to forehead, extend.' },
   { name: 'Dumbbell Skull Crusher', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Skull crusher with dumbbells.' },
   { name: 'Close-Grip Bench Press', muscleGroup: 'TRICEPS', type: 'COMPOUND', equipment: 'BARBELL', description: 'Bench press with narrow grip for triceps emphasis.' },
   { name: 'Dips (Triceps)', muscleGroup: 'TRICEPS', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Upright dips on parallel bars for triceps.' },
   { name: 'Bench Dips', muscleGroup: 'TRICEPS', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Dips using bench behind back.' },
   { name: 'Kickback', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Bent over, extend dumbbell behind by straightening arm.' },
   { name: 'Cable Kickback', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'CABLE', description: 'Tricep kickback using cable for constant tension.' },
   { name: 'Overhead Barbell Extension', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Seated or standing, lower barbell behind head.' },
   { name: 'JM Press', muscleGroup: 'TRICEPS', type: 'COMPOUND', equipment: 'BARBELL', description: 'Hybrid bench press/skull crusher movement.' },
   { name: 'Tate Press', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Lower dumbbells to chest with elbows out, press up.' },
   { name: 'French Press', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Standing or seated overhead barbell tricep extension.' },
   { name: 'Machine Tricep Extension', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'MACHINE', description: 'Tricep extension on dedicated machine.' },
   { name: 'Diamond Push-Up', muscleGroup: 'TRICEPS', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Push-up with hands together forming diamond for triceps.' },
   { name: 'Single Arm Tricep Pushdown', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'CABLE', description: 'One-arm cable pushdown for triceps.' },
   { name: 'Reverse Grip Tricep Pushdown', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'CABLE', description: 'Pushdown with underhand grip.' },
   { name: 'Band Tricep Pushdown', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'BAND', description: 'Tricep pushdown using resistance band.' },

   // ========== ABS (20) ==========
   { name: 'Crunch', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Lie on back, curl shoulders toward hips.' },
   { name: 'Cable Crunch', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'CABLE', description: 'Kneel facing cable, crunch down against resistance.' },
   { name: 'Machine Crunch', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'MACHINE', description: 'Crunch on dedicated ab machine.' },
   { name: 'Hanging Leg Raise', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Hang from bar, raise legs to parallel or higher.' },
   { name: 'Hanging Knee Raise', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Hang from bar, raise knees to chest.' },
   { name: 'Plank', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Hold push-up position on forearms, keep body straight.' },
   { name: 'Side Plank', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Hold side position on one forearm.' },
   { name: 'Russian Twist', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Seated, lean back, rotate torso side to side.' },
   { name: 'Ab Wheel Rollout', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'OTHER', description: 'Roll ab wheel forward and return to kneeling.' },
   { name: 'Bicycle Crunch', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Alternate elbow to opposite knee in pedaling motion.' },
   { name: 'Mountain Climber', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'In push-up position, alternate driving knees forward.' },
   { name: 'Dead Bug', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'On back, extend opposite arm and leg alternately.' },
   { name: 'Reverse Crunch', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Lie on back, curl hips toward shoulders.' },
   { name: 'V-Up', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Lie flat, simultaneously raise legs and torso to V.' },
   { name: 'Pallof Press', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'CABLE', description: 'Anti-rotation exercise pressing cable handle forward.' },
   { name: 'Decline Sit-Up', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Sit-up on decline bench for added resistance.' },
   { name: 'Dragon Flag', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'On bench, raise body keeping rigid, lower slowly.' },
   { name: 'Woodchop (Cable)', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'CABLE', description: 'Rotate torso pulling cable diagonally across body.' },
   { name: 'Toe Touch', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Lie on back, legs vertical, reach for toes.' },
   { name: 'Flutter Kick', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Lie on back, alternate kicking legs up and down.' },

   // ========== GLUTES (10) ==========
   { name: 'Hip Thrust (Barbell)', muscleGroup: 'GLUTES', type: 'COMPOUND', equipment: 'BARBELL', description: 'Back on bench, thrust hips upward with barbell.' },
   { name: 'Cable Pull Through', muscleGroup: 'GLUTES', type: 'ISOLATED', equipment: 'CABLE', description: 'Face away from cable, hinge and pull through legs.' },
   { name: 'Glute Kickback (Cable)', muscleGroup: 'GLUTES', type: 'ISOLATED', equipment: 'CABLE', description: 'Kick leg back against cable resistance.' },
   { name: 'Glute Kickback (Machine)', muscleGroup: 'GLUTES', type: 'ISOLATED', equipment: 'MACHINE', description: 'Kick leg back on glute machine.' },
   { name: 'Frog Pump', muscleGroup: 'GLUTES', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Lie on back, soles together, thrust hips up.' },
   { name: 'Sumo Squat', muscleGroup: 'GLUTES', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Wide stance squat targeting glutes and inner thighs.' },
   { name: 'Single Leg Hip Thrust', muscleGroup: 'GLUTES', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Hip thrust on one leg for unilateral glute work.' },
   { name: 'Banded Clamshell', muscleGroup: 'GLUTES', type: 'ISOLATED', equipment: 'BAND', description: 'Side lying, open knees against band resistance.' },
   { name: 'Banded Side Walk', muscleGroup: 'GLUTES', type: 'ISOLATED', equipment: 'BAND', description: 'Walk sideways with band around ankles.' },
   { name: 'Romanian Deadlift (Dumbbell)', muscleGroup: 'GLUTES', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'RDL with dumbbells for glute and hamstring emphasis.' },

   // ========== TRAPS (8) ==========
   { name: 'Barbell Shrug', muscleGroup: 'TRAPS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Shrug shoulders up holding barbell.' },
   { name: 'Dumbbell Shrug', muscleGroup: 'TRAPS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Shrug shoulders up holding dumbbells.' },
   { name: 'Trap Bar Shrug', muscleGroup: 'TRAPS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Shrug using trap/hex bar.' },
   { name: 'Smith Machine Shrug', muscleGroup: 'TRAPS', type: 'ISOLATED', equipment: 'MACHINE', description: 'Shrug on Smith machine.' },
   { name: 'Cable Shrug', muscleGroup: 'TRAPS', type: 'ISOLATED', equipment: 'CABLE', description: 'Shrug using cable handles.' },
   { name: 'Farmer Walk', muscleGroup: 'TRAPS', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Walk carrying heavy dumbbells at sides.' },
   { name: 'Behind the Back Barbell Shrug', muscleGroup: 'TRAPS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Shrug with barbell behind body.' },
   { name: 'Overhead Shrug', muscleGroup: 'TRAPS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Shrug with barbell held overhead.' },

   // ========== FOREARMS (8) ==========
   { name: 'Wrist Curl', muscleGroup: 'FOREARMS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Forearms on bench, curl wrists up with barbell.' },
   { name: 'Reverse Wrist Curl', muscleGroup: 'FOREARMS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Forearms on bench, extend wrists up with overhand grip.' },
   { name: 'Dumbbell Wrist Curl', muscleGroup: 'FOREARMS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Wrist curl with dumbbell.' },
   { name: 'Behind the Back Wrist Curl', muscleGroup: 'FOREARMS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Barbell behind body, curl wrists up.' },
   { name: 'Reverse Barbell Curl', muscleGroup: 'FOREARMS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Curl with overhand grip for forearm development.' },
   { name: 'Plate Pinch', muscleGroup: 'FOREARMS', type: 'ISOLATED', equipment: 'OTHER', description: 'Pinch weight plates together for grip strength.' },
   { name: 'Dead Hang', muscleGroup: 'FOREARMS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Hang from bar for grip endurance.' },
   { name: 'Towel Pull-Up', muscleGroup: 'FOREARMS', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Pull-up gripping towels for grip strength.' },

   // ========== CARDIO (15) ==========
   { name: 'Treadmill Running', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'MACHINE', description: 'Run on treadmill at desired pace.' },
   { name: 'Treadmill Walking (Incline)', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'MACHINE', description: 'Walk at incline on treadmill.' },
   { name: 'Stationary Bike', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'MACHINE', description: 'Cycle on stationary bike.' },
   { name: 'Elliptical', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'MACHINE', description: 'Use elliptical machine for low-impact cardio.' },
   { name: 'Rowing Machine', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'MACHINE', description: 'Row on ergometer for full-body cardio.' },
   { name: 'Stair Climber', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'MACHINE', description: 'Climb on stair machine.' },
   { name: 'Jump Rope', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'OTHER', description: 'Skip rope for cardio conditioning.' },
   { name: 'Battle Ropes', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'OTHER', description: 'Wave heavy ropes for HIIT cardio.' },
   { name: 'Box Jump', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'OTHER', description: 'Jump onto elevated box.' },
   { name: 'Burpee', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'BODYWEIGHT', description: 'Full body movement: squat, push-up, jump.' },
   { name: 'Kettlebell Swing', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'KETTLEBELL', description: 'Swing kettlebell between legs and up to chest height.' },
   { name: 'Assault Bike', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'MACHINE', description: 'Air resistance bike with arm handles.' },
   { name: 'Swimming', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'OTHER', description: 'Swim laps for cardiovascular exercise.' },
   { name: 'Sled Push', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'OTHER', description: 'Push weighted sled across floor.' },
   { name: 'Sprints', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'BODYWEIGHT', description: 'Short distance maximal effort running.' },

   // ========== FULL BODY (10) ==========
   { name: 'Clean and Press', muscleGroup: 'FULL_BODY', type: 'COMPOUND', equipment: 'BARBELL', description: 'Clean barbell to shoulders then press overhead.' },
   { name: 'Clean and Jerk', muscleGroup: 'FULL_BODY', type: 'COMPOUND', equipment: 'BARBELL', description: 'Olympic lift: clean to shoulders then jerk overhead.' },
   { name: 'Snatch', muscleGroup: 'FULL_BODY', type: 'COMPOUND', equipment: 'BARBELL', description: 'Olympic lift: pull barbell from floor to overhead in one motion.' },
   { name: 'Thruster', muscleGroup: 'FULL_BODY', type: 'COMPOUND', equipment: 'BARBELL', description: 'Front squat into overhead press in one movement.' },
   { name: 'Dumbbell Thruster', muscleGroup: 'FULL_BODY', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Squat to overhead press with dumbbells.' },
   { name: 'Turkish Get-Up', muscleGroup: 'FULL_BODY', type: 'COMPOUND', equipment: 'KETTLEBELL', description: 'Multi-step movement from lying to standing holding weight overhead.' },
   { name: 'Man Maker', muscleGroup: 'FULL_BODY', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Push-up, row, clean, press combo with dumbbells.' },
   { name: 'Devil Press', muscleGroup: 'FULL_BODY', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Burpee with dumbbell snatch to overhead.' },
   { name: 'Bear Complex', muscleGroup: 'FULL_BODY', type: 'COMPOUND', equipment: 'BARBELL', description: 'Power clean, front squat, push press, back squat, behind neck press.' },
   { name: 'Muscle-Up', muscleGroup: 'FULL_BODY', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Pull-up transitioning into dip above bar/rings.' },
];

async function main() {
   console.log('🌱 Seeding database...');

   // Clear existing exercises (non-custom only)
   await prisma.exercise.deleteMany({
      where: { isCustom: false },
   });

   // Seed exercises
   const created = await prisma.exercise.createMany({
      data: exercises.map((e) => ({
         ...e,
         isCustom: false,
         userId: null,
      })),
   });

   console.log(`✅ Created ${created.count} exercises`);
   console.log('🌱 Seeding complete!');
}

main()
   .catch((e) => {
      console.error('❌ Seed failed:', e);
      process.exit(1);
   })
   .finally(async () => {
      await prisma.$disconnect();
   });
