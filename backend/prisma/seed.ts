import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ExerciseSeed {
   name: string;
   muscleGroup: string;
   type: string;
   equipment: string;
   description: string;
   videoUrl: string;
}

const exercises: ExerciseSeed[] = [
   // ========== PEITO (25) ==========
   { name: 'Supino Reto com Barra', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BARBELL', description: 'Deite no banco, desça a barra até o peito e empurre para cima.', videoUrl: 'https://www.youtube.com/watch?v=8UiTPNj66AU' },
   { name: 'Supino Inclinado com Barra', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BARBELL', description: 'Banco a 30-45° de inclinação, empurre a barra a partir do peito superior.', videoUrl: 'https://www.youtube.com/watch?v=TIMRYQKVvDk' },
   { name: 'Supino Declinado com Barra', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BARBELL', description: 'Banco em posição declinada, empurre a barra a partir do peito inferior.', videoUrl: 'https://www.youtube.com/watch?v=nHPw4qVQIsE' },
   { name: 'Supino Reto com Halteres', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Deite no banco, empurre os halteres para cima a partir do peito.', videoUrl: 'https://www.youtube.com/watch?v=31j_Io3ncRg' },
   { name: 'Supino Inclinado com Halteres', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Banco inclinado, empurre os halteres a partir do peito superior.', videoUrl: 'https://www.youtube.com/watch?v=YiP-Zhk5YMk' },
   { name: 'Supino Declinado com Halteres', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Banco declinado, empurre os halteres a partir do peito inferior.', videoUrl: 'https://www.youtube.com/watch?v=5oUAqXhViSg' },
   { name: 'Crucifixo Reto com Halteres', muscleGroup: 'CHEST', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Deite no banco, abra os braços para os lados e feche.', videoUrl: 'https://www.youtube.com/watch?v=ZjIKUMtW37c' },
   { name: 'Crucifixo Inclinado com Halteres', muscleGroup: 'CHEST', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Banco inclinado, abra os braços para os lados e feche.', videoUrl: 'https://www.youtube.com/watch?v=oQARSPqhvs8' },
   { name: 'Crucifixo Declinado com Halteres', muscleGroup: 'CHEST', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Banco declinado, abra os braços para os lados e feche.', videoUrl: 'https://www.youtube.com/watch?v=GlCULifKJrs' },
   { name: 'Crossover na Polia', muscleGroup: 'CHEST', type: 'ISOLATED', equipment: 'CABLE', description: 'De pé entre os cabos, traga as mãos juntas na frente do peito.', videoUrl: 'https://www.youtube.com/watch?v=E3aha5zhlc0' },
   { name: 'Peck Deck (Voador)', muscleGroup: 'CHEST', type: 'ISOLATED', equipment: 'MACHINE', description: 'Máquina sentada, junte as almofadas na frente do peito.', videoUrl: 'https://www.youtube.com/watch?v=yNWQgKorUgo' },
   { name: 'Flexão de Braços', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Mãos no chão, desça o corpo e empurre para cima.', videoUrl: 'https://www.youtube.com/watch?v=KJgBotMpj9c' },
   { name: 'Flexão de Braços Inclinada', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Flexão com as mãos em superfície elevada, facilitando o movimento.', videoUrl: 'https://www.youtube.com/watch?v=COpDKiH4byU' },
   { name: 'Flexão de Braços Declinada', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Flexão com os pés elevados no banco para maior ênfase no peito superior.', videoUrl: 'https://www.youtube.com/watch?v=62pjX7RrMp4' },
   { name: 'Pullover com Haltere', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Deite no banco, leve o haltere atrás da cabeça e puxe de volta.', videoUrl: 'https://www.youtube.com/watch?v=-KaMXMMIVrU' },
   { name: 'Supino na Máquina', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'MACHINE', description: 'Supino sentado na máquina para peito.', videoUrl: 'https://www.youtube.com/watch?v=z60iX0eYJG4' },
   { name: 'Supino com Cabos', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'CABLE', description: 'Empurre os cabos para frente na altura do peito.', videoUrl: 'https://www.youtube.com/watch?v=QobGWumYTng' },
   { name: 'Flexão Diamante', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Flexão com mãos juntas formando um diamante.', videoUrl: 'https://www.youtube.com/watch?v=yS3VSCCEmFU' },
   { name: 'Chest Press na Máquina', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'MACHINE', description: 'Empurre os braços da máquina para frente na posição sentada.', videoUrl: 'https://www.youtube.com/watch?v=QMAYqKRqG9c' },
   { name: 'Crucifixo no Cabo', muscleGroup: 'CHEST', type: 'ISOLATED', equipment: 'CABLE', description: 'Abra e feche os braços nos cabos para isolar o peito.', videoUrl: 'https://www.youtube.com/watch?v=Y5bLF_IONMg' },
   { name: 'Supino com Pegada Fechada', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BARBELL', description: 'Supino com pegada estreita para peito interno e tríceps.', videoUrl: 'https://www.youtube.com/watch?v=LrNifR3DJ1Q' },
   { name: 'Flexão com Palmas', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Flexão explosiva batendo palmas no ar entre cada repetição.', videoUrl: 'https://www.youtube.com/watch?v=_YrPBkZbCj0' },
   { name: 'Supino com Elástico', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BAND', description: 'Supino utilizando elástico de resistência.', videoUrl: 'https://www.youtube.com/watch?v=pMrBLrpr9N0' },
   { name: 'Flexão Hindu', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Flexão com movimento fluido mergulhando para frente e estendendo.', videoUrl: 'https://www.youtube.com/watch?v=bSYsaT8YgkA' },
   { name: 'Svend Press', muscleGroup: 'CHEST', type: 'ISOLATED', equipment: 'OTHER', description: 'Aperte anilhas juntas e empurre para frente a partir do peito.', videoUrl: 'https://www.youtube.com/watch?v=hWkTKN2fTn0' },

   // ========== COSTAS (27) ==========
   { name: 'Levantamento Terra com Barra', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BARBELL', description: 'Levante a barra do chão estendendo quadris e joelhos.', videoUrl: 'https://www.youtube.com/watch?v=QiqUXcz2iyA' },
   { name: 'Remada Curvada com Barra', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BARBELL', description: 'Incline o tronco, puxe a barra até o abdômen.', videoUrl: 'https://www.youtube.com/watch?v=VJHBEy2duVc' },
   { name: 'Puxada Frontal', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'CABLE', description: 'Puxe a barra até o peito superior.', videoUrl: 'https://www.youtube.com/watch?v=mPmfwbc_svw' },
   { name: 'Puxada por Trás', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'CABLE', description: 'Puxe a barra por trás da cabeça até a nuca.', videoUrl: 'https://www.youtube.com/watch?v=BbgYgtKEyC4' },
   { name: 'Remada Unilateral com Haltere', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Remada com um braço apoiando o joelho no banco.', videoUrl: 'https://www.youtube.com/watch?v=gDT81YBrh3k' },
   { name: 'Remada Cavaleiro', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BARBELL', description: 'Remada com barra T ou landmine.', videoUrl: 'https://www.youtube.com/watch?v=b-n8m51UIxc' },
   { name: 'Remada na Máquina', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'MACHINE', description: 'Remada na máquina com apoio no peito.', videoUrl: 'https://www.youtube.com/watch?v=VmGs8dwQ9Zg' },
   { name: 'Pullover na Polia', muscleGroup: 'BACK', type: 'ISOLATED', equipment: 'CABLE', description: 'Braços retos, puxe a barra de cima até as coxas na polia.', videoUrl: 'https://www.youtube.com/watch?v=fe8hkrddMtE' },
   { name: 'Remada Baixa no Cabo', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'CABLE', description: 'Sentado, puxe o cabo até o abdômen.', videoUrl: 'https://www.youtube.com/watch?v=nKEZgU_jZLE' },
   { name: 'Barra Fixa (Pegada Pronada)', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Pendurado na barra com pegada pronada, puxe o corpo até o queixo passar.', videoUrl: 'https://www.youtube.com/watch?v=1J4Q898FIck' },
   { name: 'Barra Fixa (Pegada Supinada)', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Barra fixa com pegada supinada, puxe o corpo para cima.', videoUrl: 'https://www.youtube.com/watch?v=YY9OtSQES4g' },
   { name: 'Remada com Barra T', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BARBELL', description: 'Remada utilizando barra T com apoio no peito.', videoUrl: 'https://www.youtube.com/watch?v=_Q8arhfv5DU' },
   { name: 'Remada Curvada com Halteres', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Incline o tronco, puxe os halteres até o abdômen.', videoUrl: 'https://www.youtube.com/watch?v=T0cMo0KJXvs' },
   { name: 'Puxada com Triângulo', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'CABLE', description: 'Puxada frontal com triângulo ou barra V fechada.', videoUrl: 'https://www.youtube.com/watch?v=dUy0chKG-yo' },
   { name: 'Remada Alta com Barra', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BARBELL', description: 'Puxe a barra para cima ao longo do corpo até o queixo.', videoUrl: 'https://www.youtube.com/watch?v=QZD6vq22qJg' },
   { name: 'Pulldown com Braços Retos', muscleGroup: 'BACK', type: 'ISOLATED', equipment: 'CABLE', description: 'Braços retos, puxe a barra de cima até as coxas.', videoUrl: 'https://www.youtube.com/watch?v=YiP-Zhk5YMk' },
   { name: 'Hiperextensão Lombar', muscleGroup: 'BACK', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'De bruços no banco, estenda o tronco para cima.', videoUrl: 'https://www.youtube.com/watch?v=0ssEGdsjGWw' },
   { name: 'Superman', muscleGroup: 'BACK', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Deite de bruços, eleve braços e pernas simultaneamente.', videoUrl: 'https://www.youtube.com/watch?v=rQzF5dMTvaA' },
   { name: 'Remada Renegada', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Na posição de flexão com halteres, alterne remadas.', videoUrl: 'https://www.youtube.com/watch?v=WMSNU1ARqFw' },
   { name: 'Puxada com Pegada Neutra', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'CABLE', description: 'Puxada frontal com pegada neutra (palmas se olhando).', videoUrl: 'https://www.youtube.com/watch?v=puBUMczTokI' },
   { name: 'Remada no Smith', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'MACHINE', description: 'Remada curvada no Smith Machine.', videoUrl: 'https://www.youtube.com/watch?v=iPf7e-K_rpY' },
   { name: 'Levantamento Terra Romeno', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BARBELL', description: 'Flexione o quadril com leve flexão nos joelhos, desça a barra.', videoUrl: 'https://www.youtube.com/watch?v=fxKIx1rFVdo' },
   { name: 'Remada com Elástico', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BAND', description: 'Remada utilizando elástico de resistência.', videoUrl: 'https://www.youtube.com/watch?v=nbeUmDlFwe4' },
   { name: 'Good Morning', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BARBELL', description: 'Barra nas costas, flexione o tronco para frente.', videoUrl: 'https://www.youtube.com/watch?v=48gi7GPzTLQ' },
   { name: 'Rack Pull', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BARBELL', description: 'Levantamento terra parcial a partir do rack.', videoUrl: 'https://www.youtube.com/watch?v=NCX7TmtGpSA' },
   { name: 'Seal Row', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BARBELL', description: 'Remada deitado de bruços no banco elevado, sem impulso.', videoUrl: 'https://www.youtube.com/watch?v=TEsaXW2tRSI' },
   { name: 'Meadows Row', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BARBELL', description: 'Remada unilateral com landmine em posição perpendicular.', videoUrl: 'https://www.youtube.com/watch?v=Gy3bLCtUzDA' },

   // ========== PERNAS (29) ==========
   { name: 'Agachamento Livre com Barra', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'BARBELL', description: 'Barra nas costas, agache e suba.', videoUrl: 'https://www.youtube.com/watch?v=x5vB3-LoPHc' },
   { name: 'Leg Press', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'MACHINE', description: 'Empurre a plataforma com os pés na posição sentada.', videoUrl: 'https://www.youtube.com/watch?v=nY8UsiAqwds' },
   { name: 'Cadeira Extensora', muscleGroup: 'LEGS', type: 'ISOLATED', equipment: 'MACHINE', description: 'Sentado, estenda os joelhos contra a almofada.', videoUrl: 'https://www.youtube.com/watch?v=el3oHblB5DM' },
   { name: 'Mesa Flexora', muscleGroup: 'LEGS', type: 'ISOLATED', equipment: 'MACHINE', description: 'Deitado de bruços, flexione os calcanhares em direção aos glúteos.', videoUrl: 'https://www.youtube.com/watch?v=Zss6E3VU6X0' },
   { name: 'Agachamento Hack', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'MACHINE', description: 'Agachamento na máquina hack com apoio nas costas.', videoUrl: 'https://www.youtube.com/watch?v=5Ix3fjf4w9o' },
   { name: 'Agachamento Búlgaro', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Pé de trás elevado no banco, agache na perna da frente.', videoUrl: 'https://www.youtube.com/watch?v=LT_nelifZ_k' },
   { name: 'Passada com Halteres', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Dê um passo à frente em afundo com halteres, alterne as pernas.', videoUrl: 'https://www.youtube.com/watch?v=9bxRdpUFW4c' },
   { name: 'Stiff com Barra', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'BARBELL', description: 'Pernas estendidas, flexione o quadril descendo a barra.', videoUrl: 'https://www.youtube.com/watch?v=F8q6ZIizAcY' },
   { name: 'Agachamento Frontal', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'BARBELL', description: 'Barra nos deltoides frontais, agache e suba.', videoUrl: 'https://www.youtube.com/watch?v=YU2buvcafOA' },
   { name: 'Agachamento Sumô', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'BARBELL', description: 'Agachamento com pernas afastadas e pés apontados para fora.', videoUrl: 'https://www.youtube.com/watch?v=mOtY705EJYg' },
   { name: 'Leg Press 45 Graus', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'MACHINE', description: 'Leg press na máquina com plataforma a 45 graus.', videoUrl: 'https://www.youtube.com/watch?v=NcmQ-wVlQdc' },
   { name: 'Cadeira Abdutora', muscleGroup: 'LEGS', type: 'ISOLATED', equipment: 'MACHINE', description: 'Máquina sentada para trabalhar músculos externos do quadril.', videoUrl: 'https://www.youtube.com/watch?v=e2gmqTG1OgQ' },
   { name: 'Cadeira Adutora', muscleGroup: 'LEGS', type: 'ISOLATED', equipment: 'MACHINE', description: 'Máquina sentada para trabalhar músculos internos da coxa.', videoUrl: 'https://www.youtube.com/watch?v=Wf602gn_9zU' },
   { name: 'Avanço com Barra', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'BARBELL', description: 'Dê um passo à frente em posição de afundo com barra nas costas.', videoUrl: 'https://www.youtube.com/watch?v=ntYn2HDw32I' },
   { name: 'Agachamento no Smith', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'MACHINE', description: 'Agachamento no Smith Machine guiado.', videoUrl: 'https://www.youtube.com/watch?v=uCT5wfQIQpk' },
   { name: 'Agachamento Goblet', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Segure o haltere no peito, agache e suba.', videoUrl: 'https://www.youtube.com/watch?v=ge1vdJRP0UA' },
   { name: 'Pistol Squat', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Agachamento unilateral com a outra perna estendida.', videoUrl: 'https://www.youtube.com/watch?v=YMvPC1byyGo' },
   { name: 'Step Up com Halteres', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Suba em um banco ou plataforma com halteres.', videoUrl: 'https://www.youtube.com/watch?v=KCu2QHbnIZE' },
   { name: 'Levantamento Terra Sumô', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'BARBELL', description: 'Levantamento terra com pernas afastadas e mãos por dentro.', videoUrl: 'https://www.youtube.com/watch?v=D2XypMcD39I' },
   { name: 'Sissy Squat', muscleGroup: 'LEGS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Incline para trás com joelhos para frente isolando quadríceps.', videoUrl: 'https://www.youtube.com/watch?v=1ja_-QhWgjs' },
   { name: 'Agachamento com Elástico', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'BAND', description: 'Agachamento utilizando elástico de resistência.', videoUrl: 'https://www.youtube.com/watch?v=2BztTEfFG6E' },
   { name: 'Wall Sit', muscleGroup: 'LEGS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Encoste as costas na parede e mantenha posição de agachamento isométrico.', videoUrl: 'https://www.youtube.com/watch?v=KBMTKkkPsPo' },
   { name: 'Leg Curl Deitado', muscleGroup: 'LEGS', type: 'ISOLATED', equipment: 'MACHINE', description: 'Deitado de bruços na máquina, flexione as pernas.', videoUrl: 'https://www.youtube.com/watch?v=y06lzl1ufLs' },
   { name: 'Agachamento Zercher', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'BARBELL', description: 'Barra apoiada na dobra dos cotovelos, agache.', videoUrl: 'https://www.youtube.com/watch?v=Da75bVCfTNo' },
   { name: 'Box Squat', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'BARBELL', description: 'Agache até sentar no caixote e suba.', videoUrl: 'https://www.youtube.com/watch?v=rMEPHwNhQfo' },
   { name: 'Passada Lateral', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Dê um passo para o lado em agachamento lateral com halteres.', videoUrl: 'https://www.youtube.com/watch?v=L8YswFGESE8' },
   { name: 'Nordic Hamstring Curl', muscleGroup: 'LEGS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Ajoelhado, desça o corpo controlando com os isquiotibiais.', videoUrl: 'https://www.youtube.com/watch?v=5RIw6l3O8f8' },
   { name: 'Agachamento Overhead', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'BARBELL', description: 'Agachamento segurando a barra acima da cabeça com braços estendidos.', videoUrl: 'https://www.youtube.com/watch?v=0nwWq4xze4M' },
   { name: 'Prensa de Pernas Horizontal', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'MACHINE', description: 'Prensa de pernas na máquina horizontal.', videoUrl: 'https://www.youtube.com/watch?v=-yCwhAgy4tI' },

   // ========== PANTURRILHA (6) ==========
   { name: 'Panturrilha em Pé na Máquina', muscleGroup: 'CALVES', type: 'ISOLATED', equipment: 'MACHINE', description: 'De pé na plataforma, eleve os calcanhares.', videoUrl: 'https://www.youtube.com/watch?v=PNLdWhbgxkU' },
   { name: 'Panturrilha Sentado', muscleGroup: 'CALVES', type: 'ISOLATED', equipment: 'MACHINE', description: 'Panturrilha sentada focando no sóleo.', videoUrl: 'https://www.youtube.com/watch?v=zKC9BR3M5tg' },
   { name: 'Panturrilha no Leg Press', muscleGroup: 'CALVES', type: 'ISOLATED', equipment: 'MACHINE', description: 'Panturrilha na máquina de leg press.', videoUrl: 'https://www.youtube.com/watch?v=mL23-bJ8J4o' },
   { name: 'Panturrilha em Pé com Halteres', muscleGroup: 'CALVES', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'De pé com halteres, eleve os calcanhares.', videoUrl: 'https://www.youtube.com/watch?v=9wf99TOtw6g' },
   { name: 'Panturrilha Unilateral', muscleGroup: 'CALVES', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Panturrilha em uma perna só para trabalho unilateral.', videoUrl: 'https://www.youtube.com/watch?v=rtIhNNi0qgo' },
   { name: 'Panturrilha no Smith', muscleGroup: 'CALVES', type: 'ISOLATED', equipment: 'MACHINE', description: 'Panturrilha no Smith Machine.', videoUrl: 'https://www.youtube.com/watch?v=IuyHpM4I4eY' },

   // ========== OMBROS (25) ==========
   { name: 'Desenvolvimento com Barra', muscleGroup: 'SHOULDERS', type: 'COMPOUND', equipment: 'BARBELL', description: 'Empurre a barra acima da cabeça a partir dos ombros.', videoUrl: 'https://www.youtube.com/watch?v=O-AiEp6B2OA' },
   { name: 'Elevação Lateral', muscleGroup: 'SHOULDERS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Eleve os halteres para os lados até a altura dos ombros.', videoUrl: 'https://www.youtube.com/watch?v=ORparUDksUk' },
   { name: 'Arnold Press', muscleGroup: 'SHOULDERS', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Gire os halteres da frente para o lado enquanto empurra para cima.', videoUrl: 'https://www.youtube.com/watch?v=d4dy7O2KLhw' },
   { name: 'Desenvolvimento com Halteres', muscleGroup: 'SHOULDERS', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Empurre os halteres acima da cabeça.', videoUrl: 'https://www.youtube.com/watch?v=eufDL9MmF8A' },
   { name: 'Elevação Frontal', muscleGroup: 'SHOULDERS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Eleve os halteres para frente até a altura dos ombros.', videoUrl: 'https://www.youtube.com/watch?v=CkGGwp5raGg' },
   { name: 'Crucifixo Inverso', muscleGroup: 'SHOULDERS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Inclinado, eleve os halteres para os lados para deltoides posteriores.', videoUrl: 'https://www.youtube.com/watch?v=eTVR9Zl_cYY' },
   { name: 'Desenvolvimento na Máquina', muscleGroup: 'SHOULDERS', type: 'COMPOUND', equipment: 'MACHINE', description: 'Desenvolvimento sentado na máquina.', videoUrl: 'https://www.youtube.com/watch?v=yK2SrMydYUo' },
   { name: 'Elevação Lateral no Cabo', muscleGroup: 'SHOULDERS', type: 'ISOLATED', equipment: 'CABLE', description: 'Elevação lateral usando cabo para tensão constante.', videoUrl: 'https://www.youtube.com/watch?v=hCc8OvAST7c' },
   { name: 'Face Pull', muscleGroup: 'SHOULDERS', type: 'ISOLATED', equipment: 'CABLE', description: 'Puxe a corda até o rosto com rotação externa.', videoUrl: 'https://www.youtube.com/watch?v=0Po47vvj9g4' },
   { name: 'Desenvolvimento Arnold', muscleGroup: 'SHOULDERS', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Variação do Arnold Press com rotação completa dos halteres.', videoUrl: 'https://www.youtube.com/watch?v=iK0ArfKkwpU' },
   { name: 'Encolhimento com Halteres', muscleGroup: 'SHOULDERS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Encolha os ombros para cima segurando halteres.', videoUrl: 'https://www.youtube.com/watch?v=rXxjturw02s' },
   { name: 'Remada Alta com Barra (Ombros)', muscleGroup: 'SHOULDERS', type: 'COMPOUND', equipment: 'BARBELL', description: 'Puxe a barra para cima ao longo do corpo até o queixo.', videoUrl: 'https://www.youtube.com/watch?v=IZRC8euB5J0' },
   { name: 'Elevação Lateral Inclinada', muscleGroup: 'SHOULDERS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Elevação lateral deitado de lado no banco inclinado.', videoUrl: 'https://www.youtube.com/watch?v=BjfnrLNk4Lo' },
   { name: 'Desenvolvimento Militar', muscleGroup: 'SHOULDERS', type: 'COMPOUND', equipment: 'BARBELL', description: 'Desenvolvimento em pé com barra, posição militar.', videoUrl: 'https://www.youtube.com/watch?v=9xPFj45VYDk' },
   { name: 'Press Landmine', muscleGroup: 'SHOULDERS', type: 'COMPOUND', equipment: 'BARBELL', description: 'Empurre a barra ancorada no chão a partir do ombro.', videoUrl: 'https://www.youtube.com/watch?v=qFXojXa-RCU' },
   { name: 'Elevação Frontal com Barra', muscleGroup: 'SHOULDERS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Eleve a barra para frente até a altura dos ombros.', videoUrl: 'https://www.youtube.com/watch?v=TaaWu3Ay7II' },
   { name: 'Desenvolvimento por Trás', muscleGroup: 'SHOULDERS', type: 'COMPOUND', equipment: 'BARBELL', description: 'Empurre a barra acima da cabeça por trás do pescoço.', videoUrl: 'https://www.youtube.com/watch?v=4uxJDMkpGJM' },
   { name: 'Pássaro no Cabo', muscleGroup: 'SHOULDERS', type: 'ISOLATED', equipment: 'CABLE', description: 'Crucifixo inverso no cabo para deltoides posteriores.', videoUrl: 'https://www.youtube.com/watch?v=Uz81XugWbG0' },
   { name: 'Elevação Lateral com Elástico', muscleGroup: 'SHOULDERS', type: 'ISOLATED', equipment: 'BAND', description: 'Elevação lateral utilizando elástico de resistência.', videoUrl: 'https://www.youtube.com/watch?v=o-o1kB2vcPU' },
   { name: 'Y Raise', muscleGroup: 'SHOULDERS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Eleve os halteres formando um Y acima da cabeça.', videoUrl: 'https://www.youtube.com/watch?v=IyjM9ur0oqE' },
   { name: 'Desenvolvimento com Kettlebell', muscleGroup: 'SHOULDERS', type: 'COMPOUND', equipment: 'KETTLEBELL', description: 'Empurre o kettlebell acima da cabeça.', videoUrl: 'https://www.youtube.com/watch?v=ThlTGtBPww8' },
   { name: 'Lu Raise', muscleGroup: 'SHOULDERS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Elevação lateral com polegares para cima e leve ângulo frontal.', videoUrl: 'https://www.youtube.com/watch?v=OdOewZO9qI8' },
   { name: 'Scarecrow', muscleGroup: 'SHOULDERS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Cotovelos na altura dos ombros, rotacione os antebraços para cima.', videoUrl: 'https://www.youtube.com/watch?v=zp1FFu24CrU' },
   { name: 'Bradford Press', muscleGroup: 'SHOULDERS', type: 'COMPOUND', equipment: 'BARBELL', description: 'Alterne o desenvolvimento pela frente e por trás da cabeça.', videoUrl: 'https://www.youtube.com/watch?v=DHlsHmlCVi8' },
   { name: 'Bus Driver', muscleGroup: 'SHOULDERS', type: 'ISOLATED', equipment: 'OTHER', description: 'Segure uma anilha com braços estendidos e gire como um volante.', videoUrl: 'https://www.youtube.com/watch?v=kUpyGwQ9LDM' },

   // ========== BÍCEPS (20) ==========
   { name: 'Rosca Direta com Barra', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Flexione os braços curvando a barra para cima.', videoUrl: 'https://www.youtube.com/watch?v=zqklqTcOsbo' },
   { name: 'Rosca Martelo', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Rosca com pegada neutra (martelo).', videoUrl: 'https://www.youtube.com/watch?v=OnNmaG_tZM4' },
   { name: 'Rosca Concentrada', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Sentado, flexione o haltere com cotovelo apoiado na coxa.', videoUrl: 'https://www.youtube.com/watch?v=x76-WEb0DCs' },
   { name: 'Rosca Alternada com Halteres', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Flexione os halteres alternando um braço de cada vez.', videoUrl: 'https://www.youtube.com/watch?v=AuBN9_8Iihc' },
   { name: 'Rosca Scott', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Rosca no banco Scott para isolar bíceps.', videoUrl: 'https://www.youtube.com/watch?v=dUlJKZfpyMU' },
   { name: 'Rosca no Cabo', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'CABLE', description: 'Rosca na polia para tensão constante.', videoUrl: 'https://www.youtube.com/watch?v=RqPIT19jxgg' },
   { name: 'Rosca Inclinada com Halteres', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Rosca sentado no banco inclinado.', videoUrl: 'https://www.youtube.com/watch?v=f0SZCxQB9iA' },
   { name: 'Rosca 21', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'BARBELL', description: '7 meio inferior + 7 meio superior + 7 completas.', videoUrl: 'https://www.youtube.com/watch?v=Ji8dLyjuo0Y' },
   { name: 'Rosca Inversa', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Rosca com pegada pronada para braquiorradial.', videoUrl: 'https://www.youtube.com/watch?v=jbSr9CzJPmA' },
   { name: 'Rosca Spider', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Rosca com peito apoiado no banco inclinado.', videoUrl: 'https://www.youtube.com/watch?v=d0pHY_iJRDQ' },
   { name: 'Rosca com Corda no Cabo', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'CABLE', description: 'Rosca com corda na polia baixa.', videoUrl: 'https://www.youtube.com/watch?v=BfbvQnjvwec' },
   { name: 'Rosca Direta com Halteres', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Flexione os halteres simultaneamente para cima.', videoUrl: 'https://www.youtube.com/watch?v=s1vf8LEPpDA' },
   { name: 'Rosca no Banco Inclinado', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Rosca com halteres deitado no banco inclinado.', videoUrl: 'https://www.youtube.com/watch?v=Cv0zCtntyto' },
   { name: 'Rosca com Barra W', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Rosca com barra W para conforto nos pulsos.', videoUrl: 'https://www.youtube.com/watch?v=9G5eHUIANz4' },
   { name: 'Rosca Martelo no Cabo', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'CABLE', description: 'Rosca martelo com corda no cabo.', videoUrl: 'https://www.youtube.com/watch?v=oIUuJFrtr5A' },
   { name: 'Rosca Concentrada no Cabo', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'CABLE', description: 'Rosca concentrada usando cabo para tensão constante.', videoUrl: 'https://www.youtube.com/watch?v=fnanldOsnZ4' },
   { name: 'Rosca com Elástico', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'BAND', description: 'Rosca direta com elástico de resistência.', videoUrl: 'https://www.youtube.com/watch?v=jW5KavREPiw' },
   { name: 'Rosca Zottman', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Suba supinado, gire e desça pronado.', videoUrl: 'https://www.youtube.com/watch?v=RJJiKpW6MUA' },
   { name: 'Rosca Drag Curl', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Rosca mantendo a barra colada ao corpo, cotovelos para trás.', videoUrl: 'https://www.youtube.com/watch?v=PYh6Xxmgl2E' },
   { name: 'Rosca Bayesian', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'CABLE', description: 'Rosca com braço atrás do corpo para alongar cabeça longa.', videoUrl: 'https://www.youtube.com/watch?v=VyhB_4ILuzs' },

   // ========== TRÍCEPS (18) ==========
   { name: 'Tríceps na Polia', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'CABLE', description: 'Empurre a barra para baixo estendendo os cotovelos.', videoUrl: 'https://www.youtube.com/watch?v=9cmeOVHOjck' },
   { name: 'Tríceps Testa com Barra', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Deite no banco, desça a barra até a testa e estenda.', videoUrl: 'https://www.youtube.com/watch?v=H6stJS2YIsE' },
   { name: 'Mergulho', muscleGroup: 'TRICEPS', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Mergulho nas barras paralelas focando em tríceps.', videoUrl: 'https://www.youtube.com/watch?v=TCVj8cliLNo' },
   { name: 'Tríceps Francês com Haltere', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Segure o haltere acima da cabeça, desça atrás e estenda.', videoUrl: 'https://www.youtube.com/watch?v=9FhesSQj4PI' },
   { name: 'Tríceps Coice com Haltere', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Inclinado, estenda o haltere para trás.', videoUrl: 'https://www.youtube.com/watch?v=DXGH9_WAP50' },
   { name: 'Tríceps com Corda na Polia', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'CABLE', description: 'Tríceps com corda na polia, abra no final.', videoUrl: 'https://www.youtube.com/watch?v=LOCarvWMhNQ' },
   { name: 'Tríceps no Banco', muscleGroup: 'TRICEPS', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Mergulho usando o banco atrás das costas.', videoUrl: 'https://www.youtube.com/watch?v=LdfpvZPnUSI' },
   { name: 'Tríceps Testa com Halteres', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Tríceps testa com halteres.', videoUrl: 'https://www.youtube.com/watch?v=VakpIeaaeXA' },
   { name: 'Mergulho entre Bancos', muscleGroup: 'TRICEPS', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Mergulho entre dois bancos com pés elevados.', videoUrl: 'https://www.youtube.com/watch?v=TCVj8cliLNo' },
   { name: 'Tríceps Overhead com Cabo', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'CABLE', description: 'De costas para o cabo, estenda a corda acima da cabeça.', videoUrl: 'https://www.youtube.com/watch?v=N0B1KPtuz9I' },
   { name: 'Tríceps na Máquina', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'MACHINE', description: 'Extensão de tríceps na máquina dedicada.', videoUrl: 'https://www.youtube.com/watch?v=CTjEwD3qWms' },
   { name: 'Tríceps com Barra W na Polia', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'CABLE', description: 'Tríceps na polia com barra W.', videoUrl: 'https://www.youtube.com/watch?v=WUPk8Gq20cs' },
   { name: 'Tríceps Unilateral no Cabo', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'CABLE', description: 'Tríceps unilateral no cabo.', videoUrl: 'https://www.youtube.com/watch?v=pCIxjSZiDG4' },
   { name: 'Tríceps com Elástico', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'BAND', description: 'Extensão de tríceps usando elástico de resistência.', videoUrl: 'https://www.youtube.com/watch?v=ljXS5e2fNKA' },
   { name: 'Close Grip Bench Press', muscleGroup: 'TRICEPS', type: 'COMPOUND', equipment: 'BARBELL', description: 'Supino com pegada fechada focando em tríceps.', videoUrl: 'https://www.youtube.com/watch?v=k8dmJBFfAu8' },
   { name: 'JM Press', muscleGroup: 'TRICEPS', type: 'COMPOUND', equipment: 'BARBELL', description: 'Movimento híbrido de supino e tríceps testa.', videoUrl: 'https://www.youtube.com/watch?v=sBCpjnJ1YKI' },
   { name: 'Tríceps Kickback no Cabo', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'CABLE', description: 'Tríceps coice usando cabo para tensão constante.', videoUrl: 'https://www.youtube.com/watch?v=S6NeH-7mqeQ' },
   { name: 'Tríceps Testa no Cabo', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'CABLE', description: 'Tríceps testa usando cabo.', videoUrl: 'https://www.youtube.com/watch?v=LOCarvWMhNQ' },

   // ========== ABDÔMEN (20) ==========
   { name: 'Abdominal', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Deite de costas, enrole os ombros em direção ao quadril.', videoUrl: 'https://www.youtube.com/watch?v=O0pIQ2UqeCY' },
   { name: 'Prancha', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Posição de flexão nos antebraços, mantenha o corpo reto.', videoUrl: 'https://www.youtube.com/watch?v=qNRqGqESAWU' },
   { name: 'Elevação de Pernas na Barra', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Pendurado na barra, eleve as pernas até paralelo ou acima.', videoUrl: 'https://www.youtube.com/watch?v=AcVENMSAaw0' },
   { name: 'Abdominal Infra', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Deite de costas, eleve as pernas e o quadril do chão.', videoUrl: 'https://www.youtube.com/watch?v=ixJcUH8AlL8' },
   { name: 'Abdominal Oblíquo', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Abdominal com rotação do tronco para trabalhar oblíquos.', videoUrl: 'https://www.youtube.com/watch?v=MeNKk3-ujF8' },
   { name: 'Prancha Lateral', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Mantenha posição lateral apoiado em um antebraço.', videoUrl: 'https://www.youtube.com/watch?v=zt7PjySXWCw' },
   { name: 'Abdominal na Máquina', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'MACHINE', description: 'Abdominal na máquina dedicada.', videoUrl: 'https://www.youtube.com/watch?v=OcjLM6Weh-0' },
   { name: 'Abdominal com Corda na Polia', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'CABLE', description: 'Ajoelhado de frente para o cabo, flexione contra a resistência.', videoUrl: 'https://www.youtube.com/watch?v=xBUocF1laq4' },
   { name: 'Bicicleta no Ar', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Alterne cotovelo ao joelho oposto em movimento de pedalar.', videoUrl: 'https://www.youtube.com/watch?v=R7pPye80x8g' },
   { name: 'Mountain Climber', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Na posição de flexão, alterne joelhos para frente rapidamente.', videoUrl: 'https://www.youtube.com/watch?v=8wuUiihTbdw' },
   { name: 'Russian Twist', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Sentado, incline para trás, gire o tronco lado a lado.', videoUrl: 'https://www.youtube.com/watch?v=ZPcOXF2csrQ' },
   { name: 'Abdominal Canivete', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Deite reto, levante pernas e tronco simultaneamente em V.', videoUrl: 'https://www.youtube.com/watch?v=CYlgFvn0xUA' },
   { name: 'Prancha com Elevação de Braço', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Na posição de prancha, alterne elevações de braço.', videoUrl: 'https://www.youtube.com/watch?v=Q2cUl16Mm_Q' },
   { name: 'Dead Bug', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'De costas, estenda braço e perna opostos alternadamente.', videoUrl: 'https://www.youtube.com/watch?v=uQfzuKBMJeE' },
   { name: 'Pallof Press', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'CABLE', description: 'Exercício anti-rotação empurrando o cabo para frente.', videoUrl: 'https://www.youtube.com/watch?v=91zJZhRx2u0' },
   { name: 'Ab Wheel Rollout', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'OTHER', description: 'Role a roda para frente e volte ajoelhado.', videoUrl: 'https://www.youtube.com/watch?v=kMjbpumsN9U' },
   { name: 'Hollow Body Hold', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Deite de costas, eleve braços e pernas mantendo lombar no chão.', videoUrl: 'https://www.youtube.com/watch?v=EsnM8eBtazU' },
   { name: 'Dragon Flag', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'No banco, eleve o corpo rígido e desça lentamente.', videoUrl: 'https://www.youtube.com/watch?v=fAaC36c66fo' },
   { name: 'Abdominal Declinado', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Abdominal no banco declinado para maior resistência.', videoUrl: 'https://www.youtube.com/watch?v=UQjvL8GlGxA' },
   { name: 'Leg Raise Deitado', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Deite de costas, eleve as pernas estendidas até 90°.', videoUrl: 'https://www.youtube.com/watch?v=Wp4BlxcFTkE' },

   // ========== GLÚTEOS (10) ==========
   { name: 'Hip Thrust com Barra', muscleGroup: 'GLUTES', type: 'COMPOUND', equipment: 'BARBELL', description: 'Costas no banco, empurre o quadril para cima com barra no colo.', videoUrl: 'https://www.youtube.com/watch?v=WA2Q1auA1zY' },
   { name: 'Pull Through no Cabo', muscleGroup: 'GLUTES', type: 'ISOLATED', equipment: 'CABLE', description: 'De costas para o cabo, flexione e puxe entre as pernas.', videoUrl: 'https://www.youtube.com/watch?v=IU-ERkjTKXA' },
   { name: 'Glúteo na Máquina', muscleGroup: 'GLUTES', type: 'ISOLATED', equipment: 'MACHINE', description: 'Chute a perna para trás na máquina de glúteos.', videoUrl: 'https://www.youtube.com/watch?v=JhodVO0l1vw' },
   { name: 'Elevação Pélvica', muscleGroup: 'GLUTES', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Deite no chão, eleve o quadril contraindo os glúteos.', videoUrl: 'https://www.youtube.com/watch?v=Z-dSAVAkC-8' },
   { name: 'Kickback no Cabo', muscleGroup: 'GLUTES', type: 'ISOLATED', equipment: 'CABLE', description: 'Chute a perna para trás contra a resistência do cabo.', videoUrl: 'https://www.youtube.com/watch?v=DUIMAiuwv2w' },
   { name: 'Abdução de Quadril no Cabo', muscleGroup: 'GLUTES', type: 'ISOLATED', equipment: 'CABLE', description: 'Abra a perna para o lado contra a resistência do cabo.', videoUrl: 'https://www.youtube.com/watch?v=fjCAUVpKFUo' },
   { name: 'Glúteo no Smith', muscleGroup: 'GLUTES', type: 'COMPOUND', equipment: 'MACHINE', description: 'Hip thrust ou kickback no Smith Machine para glúteos.', videoUrl: 'https://www.youtube.com/watch?v=7ruqgpNrSKY' },
   { name: 'Frog Pump', muscleGroup: 'GLUTES', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Deite de costas, solas dos pés juntas, eleve o quadril.', videoUrl: 'https://www.youtube.com/watch?v=Go_zmegBty8' },
   { name: 'Glute Bridge com Haltere', muscleGroup: 'GLUTES', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Ponte de glúteos com haltere apoiado no quadril.', videoUrl: 'https://www.youtube.com/watch?v=aBl3iHmNQSM' },
   { name: 'Clamshell com Elástico', muscleGroup: 'GLUTES', type: 'ISOLATED', equipment: 'BAND', description: 'Deitado de lado, abra os joelhos contra resistência do elástico.', videoUrl: 'https://www.youtube.com/watch?v=m_ZPapmqeNM' },

   // ========== TRAPÉZIO (8) ==========
   { name: 'Encolhimento com Barra', muscleGroup: 'TRAPS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Encolha os ombros para cima segurando a barra.', videoUrl: 'https://www.youtube.com/watch?v=oYHnVHe2dFM' },
   { name: 'Farmer Walk', muscleGroup: 'TRAPS', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Caminhe carregando halteres pesados ao lado do corpo.', videoUrl: 'https://www.youtube.com/watch?v=CeUKHZFNYHs' },
   { name: 'Encolhimento com Halteres (Trapézio)', muscleGroup: 'TRAPS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Encolha os ombros para cima segurando halteres.', videoUrl: 'https://www.youtube.com/watch?v=08W2LHolqho' },
   { name: 'Encolhimento no Smith', muscleGroup: 'TRAPS', type: 'ISOLATED', equipment: 'MACHINE', description: 'Encolhimento no Smith Machine.', videoUrl: 'https://www.youtube.com/watch?v=YOY9ie5RJ4Y' },
   { name: 'Remada Alta com Halteres', muscleGroup: 'TRAPS', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Remada alta com halteres para trapézio.', videoUrl: 'https://www.youtube.com/watch?v=S1SFzG1PsFY' },
   { name: 'Face Pull com Corda', muscleGroup: 'TRAPS', type: 'ISOLATED', equipment: 'CABLE', description: 'Puxe a corda até o rosto com rotação externa para trapézio.', videoUrl: 'https://www.youtube.com/watch?v=0Po47vvj9g4' },
   { name: 'Encolhimento com Cabos', muscleGroup: 'TRAPS', type: 'ISOLATED', equipment: 'CABLE', description: 'Encolhimento usando cabos.', videoUrl: 'https://www.youtube.com/watch?v=rYyBAjehdx0' },
   { name: 'Shrug com Barra por Trás', muscleGroup: 'TRAPS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Encolhimento com barra atrás do corpo.', videoUrl: 'https://www.youtube.com/watch?v=oYHnVHe2dFM' },

   // ========== ANTEBRAÇO (8) ==========
   { name: 'Rosca de Punho com Barra', muscleGroup: 'FOREARMS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Antebraços no banco, flexione os punhos com barra.', videoUrl: 'https://www.youtube.com/watch?v=oNnCO4-Qj64' },
   { name: 'Suspensão na Barra', muscleGroup: 'FOREARMS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Fique pendurado na barra para resistência de pegada.', videoUrl: 'https://www.youtube.com/watch?v=b0DkOIfxq38' },
   { name: 'Rosca Inversa de Punho', muscleGroup: 'FOREARMS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Antebraços no banco, estenda os punhos com pegada pronada.', videoUrl: 'https://www.youtube.com/watch?v=jbSr9CzJPmA' },
   { name: 'Farmer Walk com Halteres', muscleGroup: 'FOREARMS', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Caminhe carregando halteres pesados para força de pegada.', videoUrl: 'https://www.youtube.com/watch?v=CeUKHZFNYHs' },
   { name: 'Wrist Roller', muscleGroup: 'FOREARMS', type: 'ISOLATED', equipment: 'OTHER', description: 'Enrole e desenrole o peso no bastão giratório.', videoUrl: 'https://www.youtube.com/watch?v=KGAh4bPwLgk' },
   { name: 'Rosca de Punho com Haltere', muscleGroup: 'FOREARMS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Rosca de punho com haltere unilateral.', videoUrl: 'https://www.youtube.com/watch?v=ZYnYu-WAA98' },
   { name: 'Finger Curl', muscleGroup: 'FOREARMS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Segure a barra com as pontas dos dedos e flexione.', videoUrl: 'https://www.youtube.com/watch?v=mp61xNRZcrk' },
   { name: 'Hand Gripper', muscleGroup: 'FOREARMS', type: 'ISOLATED', equipment: 'OTHER', description: 'Aperte o hand gripper para força de pegada.', videoUrl: 'https://www.youtube.com/watch?v=XVlGHmeISEQ' },

   // ========== CARDIO (15) ==========
   { name: 'Corrida na Esteira', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'MACHINE', description: 'Corra na esteira no ritmo desejado.', videoUrl: 'https://www.youtube.com/watch?v=6NL4KkOeX0s' },
   { name: 'Burpee', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'BODYWEIGHT', description: 'Movimento completo: agachamento, flexão, salto.', videoUrl: 'https://www.youtube.com/watch?v=ApxlA_sn2yc' },
   { name: 'Pular Corda', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'OTHER', description: 'Pule corda para condicionamento cardio.', videoUrl: 'https://www.youtube.com/watch?v=gJUIzcOR1RM' },
   { name: 'Bicicleta Ergométrica', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'MACHINE', description: 'Pedale na bicicleta ergométrica.', videoUrl: 'https://www.youtube.com/watch?v=D7oQfQiE00A' },
   { name: 'Elíptico', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'MACHINE', description: 'Use o elíptico para cardio de baixo impacto.', videoUrl: 'https://www.youtube.com/watch?v=Qfldvl3Zugk' },
   { name: 'Remo Ergométrico', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'MACHINE', description: 'Reme no ergômetro para cardio corpo inteiro.', videoUrl: 'https://www.youtube.com/watch?v=vQC6zd3m0Zw' },
   { name: 'Jumping Jack', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'BODYWEIGHT', description: 'Salte abrindo e fechando braços e pernas.', videoUrl: 'https://www.youtube.com/watch?v=XR0xeuK5zBU' },
   { name: 'Sprint', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'BODYWEIGHT', description: 'Corrida de curta distância em esforço máximo.', videoUrl: 'https://www.youtube.com/watch?v=COFC8eswLuU' },
   { name: 'Escada', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'MACHINE', description: 'Suba na máquina de escada.', videoUrl: 'https://www.youtube.com/watch?v=lfRZ2Ru0VZo' },
   { name: 'Battle Rope', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'OTHER', description: 'Balance cordas pesadas para HIIT cardio.', videoUrl: 'https://www.youtube.com/watch?v=R7qd3Moor-s' },
   { name: 'Box Jump', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'OTHER', description: 'Salte sobre caixote elevado.', videoUrl: 'https://www.youtube.com/watch?v=k7dmYdknbac' },
   { name: 'High Knees', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'BODYWEIGHT', description: 'Corra no lugar elevando os joelhos ao máximo.', videoUrl: 'https://www.youtube.com/watch?v=QIwxSeKpHtI' },
   { name: 'Agachamento com Salto', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'BODYWEIGHT', description: 'Agache e salte explosivamente para cima.', videoUrl: 'https://www.youtube.com/watch?v=5HqB1xSgmpQ' },
   { name: 'Kettlebell Swing', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'KETTLEBELL', description: 'Balance o kettlebell entre as pernas e até o peito.', videoUrl: 'https://www.youtube.com/watch?v=YSxHifyI6s8' },
   { name: 'Bear Crawl', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'BODYWEIGHT', description: 'Caminhe em quatro apoios com joelhos elevados do chão.', videoUrl: 'https://www.youtube.com/watch?v=qpaxI2m75RY' },

   // ========== CORPO INTEIRO (10) ==========
   { name: 'Clean and Press', muscleGroup: 'FULL_BODY', type: 'COMPOUND', equipment: 'BARBELL', description: 'Limpe a barra até os ombros e empurre acima da cabeça.', videoUrl: 'https://www.youtube.com/watch?v=ukDylVbucxM' },
   { name: 'Thruster com Barra', muscleGroup: 'FULL_BODY', type: 'COMPOUND', equipment: 'BARBELL', description: 'Agachamento frontal seguido de desenvolvimento em um movimento.', videoUrl: 'https://www.youtube.com/watch?v=ymXTRkIMEOU' },
   { name: 'Turkish Get-Up', muscleGroup: 'FULL_BODY', type: 'COMPOUND', equipment: 'KETTLEBELL', description: 'Movimento multi-etapa de deitado para em pé com peso acima.', videoUrl: 'https://www.youtube.com/watch?v=sgd8n917Zv0' },
   { name: 'Man Maker', muscleGroup: 'FULL_BODY', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Combo de flexão, remada, clean e press com halteres.', videoUrl: 'https://www.youtube.com/watch?v=mgFWlG8Ahok' },
   { name: 'Devil Press', muscleGroup: 'FULL_BODY', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Burpee com snatch de haltere acima da cabeça.', videoUrl: 'https://www.youtube.com/watch?v=0_7yOTeEzkg' },
   { name: 'Snatch com Barra', muscleGroup: 'FULL_BODY', type: 'COMPOUND', equipment: 'BARBELL', description: 'Levantamento olímpico: puxe a barra do chão acima da cabeça.', videoUrl: 'https://www.youtube.com/watch?v=z1j2QMBJF6c' },
   { name: 'Clean com Barra', muscleGroup: 'FULL_BODY', type: 'COMPOUND', equipment: 'BARBELL', description: 'Levante a barra do chão até a posição de rack nos ombros.', videoUrl: 'https://www.youtube.com/watch?v=e8TpDdMYq4Y' },
   { name: 'Hang Clean', muscleGroup: 'FULL_BODY', type: 'COMPOUND', equipment: 'BARBELL', description: 'Clean partindo da posição suspensa na altura dos joelhos.', videoUrl: 'https://www.youtube.com/watch?v=n6lRtVV7LYY' },
   { name: 'Power Clean', muscleGroup: 'FULL_BODY', type: 'COMPOUND', equipment: 'BARBELL', description: 'Clean recebendo a barra em posição de meio agachamento.', videoUrl: 'https://www.youtube.com/watch?v=e8TpDdMYq4Y' },
   { name: 'Push Press', muscleGroup: 'FULL_BODY', type: 'COMPOUND', equipment: 'BARBELL', description: 'Use impulso das pernas para empurrar a barra acima da cabeça.', videoUrl: 'https://www.youtube.com/watch?v=oMWJ8RQ3t20' },
];

async function main() {
   console.log('🌱 Seeding database...');

   // Upsert exercises (safe: does not delete existing exercises, preserving user workout data)
   let upserted = 0;
   for (const e of exercises) {
      await prisma.exercise.upsert({
         where: {
            name: e.name,
         },
         update: {
            muscleGroup: e.muscleGroup,
            type: e.type,
            equipment: e.equipment,
            description: e.description,
            videoUrl: e.videoUrl,
         },
         create: {
            ...e,
         },
      });
      upserted++;
   }

   console.log(`✅ Upserted ${upserted} exercises`);

   // Remove stale system exercises that are no longer in the seed list
   // Only deletes exercises with no references (safe for user data)
   const seedNames = exercises.map(e => e.name);
   const stale = await prisma.exercise.findMany({
      where: {
         name: { notIn: seedNames },
      },
      include: {
         _count: {
            select: {
               workoutPlanExercises: true,
               workoutLogExercises: true,
               personalRecords: true,
            },
         },
      },
   });

   let removed = 0;
   for (const ex of stale) {
      const refs = ex._count.workoutPlanExercises + ex._count.workoutLogExercises + ex._count.personalRecords;
      if (refs === 0) {
         await prisma.exercise.delete({ where: { id: ex.id } });
         removed++;
      } else {
         console.log(`⚠️  Keeping stale exercise "${ex.name}" (${refs} references)`);
      }
   }
   if (removed > 0) console.log(`🗑️  Removed ${removed} stale unreferenced exercises`);

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
