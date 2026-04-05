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
   { name: 'Supino Reto com Barra', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BARBELL', description: 'Deite no banco, desça a barra até o peito e empurre para cima.', videoUrl: 'https://www.youtube.com/watch?v=pMpGE2ckMJw' },
   { name: 'Supino Inclinado com Barra', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BARBELL', description: 'Banco a 30-45° de inclinação, empurre a barra a partir do peito superior.', videoUrl: 'https://www.youtube.com/watch?v=DbFgADa2PL8' },
   { name: 'Supino Declinado com Barra', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BARBELL', description: 'Banco em posição declinada, empurre a barra a partir do peito inferior.', videoUrl: 'https://www.youtube.com/watch?v=vc1d-bEzGOo' },
   { name: 'Supino Reto com Halteres', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Deite no banco, empurre os halteres para cima a partir do peito.', videoUrl: 'https://www.youtube.com/watch?v=VmB1G1K7v94' },
   { name: 'Supino Inclinado com Halteres', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Banco inclinado, empurre os halteres a partir do peito superior.', videoUrl: 'https://www.youtube.com/watch?v=IP4oeKh1Sd4' },
   { name: 'Supino Declinado com Halteres', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Banco declinado, empurre os halteres a partir do peito inferior.', videoUrl: 'https://www.youtube.com/watch?v=0G2_XV7slIg' },
   { name: 'Crucifixo Reto com Halteres', muscleGroup: 'CHEST', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Deite no banco, abra os braços para os lados e feche.', videoUrl: 'https://www.youtube.com/watch?v=QENKPHhQVi4' },
   { name: 'Crucifixo Inclinado com Halteres', muscleGroup: 'CHEST', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Banco inclinado, abra os braços para os lados e feche.', videoUrl: 'https://www.youtube.com/watch?v=beazP7HuqCo' },
   { name: 'Crossover', muscleGroup: 'CHEST', type: 'ISOLATED', equipment: 'CABLE', description: 'De pé entre os cabos, traga as mãos juntas na frente do peito.', videoUrl: 'https://www.youtube.com/watch?v=taI4XduLpTk' },
   { name: 'Crossover Polia Baixa', muscleGroup: 'CHEST', type: 'ISOLATED', equipment: 'CABLE', description: 'Polias baixas, traga os cabos para cima e junte.', videoUrl: 'https://www.youtube.com/watch?v=0UoJGBPa-hg' },
   { name: 'Supino na Máquina', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'MACHINE', description: 'Supino sentado na máquina para peito.', videoUrl: 'https://www.youtube.com/watch?v=xEKh7OdSFOc' },
   { name: 'Peck Deck', muscleGroup: 'CHEST', type: 'ISOLATED', equipment: 'MACHINE', description: 'Máquina sentada, junte as almofadas na frente.', videoUrl: 'https://www.youtube.com/watch?v=Z57CtFmRMxA' },
   { name: 'Flexão de Braço', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Mãos no chão, desça o corpo e empurre para cima.', videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4' },
   { name: 'Flexão Diamante', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Flexão com mãos juntas formando um diamante.', videoUrl: 'https://www.youtube.com/watch?v=J0DnG1_S92I' },
   { name: 'Flexão Aberta', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Flexão com mãos mais abertas que a largura dos ombros.', videoUrl: 'https://www.youtube.com/watch?v=pfKDHfPfOTE' },
   { name: 'Flexão Declinada', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Flexão com os pés elevados no banco.', videoUrl: 'https://www.youtube.com/watch?v=SKPab2YC8BE' },
   { name: 'Mergulho (Peito)', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Incline para frente nas barras paralelas, desça e suba.', videoUrl: 'https://www.youtube.com/watch?v=dX_nSOOJIsE' },
   { name: 'Landmine Press', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BARBELL', description: 'Empurre a barra ancorada no chão a partir do peito.', videoUrl: 'https://www.youtube.com/watch?v=Dvdp0JZFmE4' },
   { name: 'Supino no Smith Machine', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'MACHINE', description: 'Supino na máquina Smith para movimento guiado.', videoUrl: 'https://www.youtube.com/watch?v=BCw34_-FxXE' },
   { name: 'Supino Inclinado na Máquina', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'MACHINE', description: 'Supino inclinado na máquina para peito superior.', videoUrl: 'https://www.youtube.com/watch?v=WlF4JKNbZhc' },
   { name: 'Supino no Cabo', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'CABLE', description: 'Empurre o cabo para frente na altura do peito.', videoUrl: 'https://www.youtube.com/watch?v=JgR5JgyAfWI' },
   { name: 'Svend Press', muscleGroup: 'CHEST', type: 'ISOLATED', equipment: 'OTHER', description: 'Aperte anilhas juntas e empurre para frente a partir do peito.', videoUrl: 'https://www.youtube.com/watch?v=l8lBruaH1rU' },
   { name: 'Supino no Chão', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BARBELL', description: 'Supino deitado no chão, amplitude reduzida.', videoUrl: 'https://www.youtube.com/watch?v=Pqt3ceKnbsg' },
   { name: 'Pullover com Halter', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Deite no banco, leve o halter atrás da cabeça e puxe.', videoUrl: 'https://www.youtube.com/watch?v=FK4rHfWKEac' },
   { name: 'Supino Pegada Fechada', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BARBELL', description: 'Supino com pegada estreita para peito interno e tríceps.', videoUrl: 'https://www.youtube.com/watch?v=wxBBhy9tqqo' },

   // ========== COSTAS (27) ==========
   { name: 'Levantamento Terra com Barra', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BARBELL', description: 'Levante a barra do chão estendendo quadris e joelhos.', videoUrl: 'https://www.youtube.com/watch?v=ytGaGIn3SjE' },
   { name: 'Levantamento Terra Convencional', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BARBELL', description: 'Levantamento terra com pés na largura do quadril.', videoUrl: 'https://www.youtube.com/watch?v=op9kVnSso6Q' },
   { name: 'Levantamento Terra Sumo', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BARBELL', description: 'Levantamento terra com pernas afastadas e mãos por dentro.', videoUrl: 'https://www.youtube.com/watch?v=pfJrMnVJPZo' },
   { name: 'Levantamento Terra Romeno', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BARBELL', description: 'Flexione o quadril com leve flexão nos joelhos, desça a barra.', videoUrl: 'https://www.youtube.com/watch?v=7AaaYhMqSbY' },
   { name: 'Remada Curvada com Barra', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BARBELL', description: 'Incline o tronco, puxe a barra até o abdômen.', videoUrl: 'https://www.youtube.com/watch?v=FWJR5Ve8bnQ' },
   { name: 'Remada Pendlay', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BARBELL', description: 'Remada curvada estrita partindo do chão a cada repetição.', videoUrl: 'https://www.youtube.com/watch?v=JoRJTTDB_CY' },
   { name: 'Remada Unilateral com Halter', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Remada com um braço apoiando o joelho no banco.', videoUrl: 'https://www.youtube.com/watch?v=pYcpY20QaE8' },
   { name: 'Remada Cavalinho', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BARBELL', description: 'Remada com barra T ou landmine.', videoUrl: 'https://www.youtube.com/watch?v=j3Igk5nyZE4' },
   { name: 'Remada Sentada no Cabo', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'CABLE', description: 'Sentado, puxe o cabo até o abdômen.', videoUrl: 'https://www.youtube.com/watch?v=GZbfZ033f74' },
   { name: 'Remada Sentada Pegada Aberta', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'CABLE', description: 'Remada sentada no cabo com barra larga.', videoUrl: 'https://www.youtube.com/watch?v=UCXxvVItLoM' },
   { name: 'Puxada Frontal', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'CABLE', description: 'Puxe a barra até o peito superior.', videoUrl: 'https://www.youtube.com/watch?v=CAwf7n6Luuc' },
   { name: 'Puxada Frontal Aberta', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'CABLE', description: 'Puxada frontal com pegada aberta.', videoUrl: 'https://www.youtube.com/watch?v=1VAC0TdbGns' },
   { name: 'Puxada Frontal Fechada', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'CABLE', description: 'Puxada frontal com triângulo ou barra V.', videoUrl: 'https://www.youtube.com/watch?v=ecREB6WYTHE' },
   { name: 'Puxada Supinada', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'CABLE', description: 'Puxada frontal com pegada supinada.', videoUrl: 'https://www.youtube.com/watch?v=PZqlI2GD_9o' },
   { name: 'Barra Fixa (Pronada)', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Pendurado na barra, puxe o corpo até o queixo passar.', videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g' },
   { name: 'Barra Fixa (Supinada)', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Barra fixa com pegada supinada.', videoUrl: 'https://www.youtube.com/watch?v=UfhT0OSUU0w' },
   { name: 'Barra Fixa (Neutra)', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Barra fixa com palmas se olhando.', videoUrl: 'https://www.youtube.com/watch?v=brhRXlOhGMY' },
   { name: 'Remada na Máquina', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'MACHINE', description: 'Remada na máquina com apoio no peito.', videoUrl: 'https://www.youtube.com/watch?v=6M_bPwYaG_o' },
   { name: 'Remada com Halter no Banco Inclinado', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Remada com halteres apoiado no banco inclinado.', videoUrl: 'https://www.youtube.com/watch?v=5PoEteIO944' },

   { name: 'Pulldown com Braços Estendidos', muscleGroup: 'BACK', type: 'ISOLATED', equipment: 'CABLE', description: 'Braços retos, puxe a barra de cima até as coxas.', videoUrl: 'https://www.youtube.com/watch?v=AjCCGN2tU3Q' },
   { name: 'Remada Meadows', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BARBELL', description: 'Remada unilateral com landmine em posição perpendicular.', videoUrl: 'https://www.youtube.com/watch?v=wBqKJrTSE5o' },
   { name: 'Remada Invertida', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Puxe o corpo até a barra por baixo.', videoUrl: 'https://www.youtube.com/watch?v=KOaCM1HMwU0' },
   { name: 'Rack Pull', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BARBELL', description: 'Levantamento terra parcial a partir do rack.', videoUrl: 'https://www.youtube.com/watch?v=_55-MpIXHwg' },
   { name: 'Good Morning', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'BARBELL', description: 'Barra nas costas, flexione o tronco para frente.', videoUrl: 'https://www.youtube.com/watch?v=YA-h3n9L4YU' },
   { name: 'Hiperextensão Lombar', muscleGroup: 'BACK', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'De bruços no banco, estenda o tronco para cima.', videoUrl: 'https://www.youtube.com/watch?v=ph3pddpKzzw' },
   { name: 'Hiperextensão Reversa', muscleGroup: 'BACK', type: 'ISOLATED', equipment: 'MACHINE', description: 'Na máquina de hiperextensão reversa, estenda as pernas.', videoUrl: 'https://www.youtube.com/watch?v=-_btDKK44xQ' },

   { name: 'Remada Unilateral no Cabo', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'CABLE', description: 'Remada unilateral no cabo para trabalho unilateral de costas.', videoUrl: 'https://www.youtube.com/watch?v=lHKzsDj3Mxs' },

   // ========== PERNAS (29) ==========
   { name: 'Agachamento Livre com Barra', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'BARBELL', description: 'Barra nas costas, agache e suba.', videoUrl: 'https://www.youtube.com/watch?v=u8hMpBnp2qs' },
   { name: 'Agachamento Frontal', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'BARBELL', description: 'Barra nos deltoides frontais, agache e suba.', videoUrl: 'https://www.youtube.com/watch?v=v-mQm_droHg' },
   { name: 'Agachamento Goblet', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Segure o halter no peito, agache e suba.', videoUrl: 'https://www.youtube.com/watch?v=MeIiIdhvXT4' },
   { name: 'Hack Squat', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'MACHINE', description: 'Agachamento na máquina com apoio nas costas.', videoUrl: 'https://www.youtube.com/watch?v=EdtaJRBqwes' },
   { name: 'Agachamento no Smith', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'MACHINE', description: 'Agachamento no Smith Machine guiado.', videoUrl: 'https://www.youtube.com/watch?v=0LnpCGXb6p4' },
   { name: 'Leg Press', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'MACHINE', description: 'Empurre a plataforma com os pés na posição sentada.', videoUrl: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ' },
   { name: 'Cadeira Extensora', muscleGroup: 'LEGS', type: 'ISOLATED', equipment: 'MACHINE', description: 'Sentado, estenda os joelhos contra a almofada.', videoUrl: 'https://www.youtube.com/watch?v=YyvSfVjQeL0' },
   { name: 'Mesa Flexora', muscleGroup: 'LEGS', type: 'ISOLATED', equipment: 'MACHINE', description: 'Deitado de bruços, flexione os calcanhares em direção aos glúteos.', videoUrl: 'https://www.youtube.com/watch?v=1Tq3QdYUuHs' },
   { name: 'Cadeira Flexora', muscleGroup: 'LEGS', type: 'ISOLATED', equipment: 'MACHINE', description: 'Sentado, flexione os calcanhares para baixo do assento.', videoUrl: 'https://www.youtube.com/watch?v=Orxowest56U' },
   { name: 'Flexora em Pé', muscleGroup: 'LEGS', type: 'ISOLATED', equipment: 'MACHINE', description: 'Flexão de perna em pé unilateral na máquina.', videoUrl: 'https://www.youtube.com/watch?v=Orxowest56U' },
   { name: 'Agachamento Búlgaro', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Pé de trás elevado no banco, agache na perna da frente.', videoUrl: 'https://www.youtube.com/watch?v=2C-uNgKwPLE' },
   { name: 'Afundo Caminhando', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Dê um passo à frente em afundo, alterne as pernas.', videoUrl: 'https://www.youtube.com/watch?v=L8fvypPrzzs' },
   { name: 'Afundo Reverso', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Dê um passo para trás em posição de afundo.', videoUrl: 'https://www.youtube.com/watch?v=xrPteyQLGAo' },
   { name: 'Afundo Lateral', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Dê um passo para o lado em agachamento lateral.', videoUrl: 'https://www.youtube.com/watch?v=gwWv7aPcD88' },
   { name: 'Step Up', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Suba em um banco ou plataforma com halteres.', videoUrl: 'https://www.youtube.com/watch?v=dQqApCGd5Ag' },
   { name: 'Stiff com Halteres', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Stiff com halteres para posterior de coxa.', videoUrl: 'https://www.youtube.com/watch?v=hCDlSqe0IG0' },
   { name: 'Stiff Unilateral', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Stiff em uma perna para equilíbrio e posterior.', videoUrl: 'https://www.youtube.com/watch?v=iDwsgrKQmz8' },
   { name: 'Hip Thrust com Barra', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'BARBELL', description: 'Costas no banco, empurre o quadril para cima com barra no colo.', videoUrl: 'https://www.youtube.com/watch?v=SEdqd1s0GKs' },
   { name: 'Elevação de Quadril', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Deite no chão, eleve o quadril contraindo os glúteos.', videoUrl: 'https://www.youtube.com/watch?v=OUgsJ8-Vi0E' },
   { name: 'Hip Thrust com Halter', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Hip thrust com halter no colo.', videoUrl: 'https://www.youtube.com/watch?v=SEdqd1s0GKs' },
   { name: 'Sissy Squat', muscleGroup: 'LEGS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Incline para trás com joelhos para frente isolando quadríceps.', videoUrl: 'https://www.youtube.com/watch?v=ie6bBrCAnk0' },
   { name: 'Agachamento no Caixote', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'BARBELL', description: 'Agache até sentar no caixote e suba.', videoUrl: 'https://www.youtube.com/watch?v=GKi6SSDoWOU' },
   { name: 'Agachamento Zercher', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'BARBELL', description: 'Barra apoiada na dobra dos cotovelos, agache.', videoUrl: 'https://www.youtube.com/watch?v=wp-Gp5jbOHk' },
   { name: 'Pistol Squat', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Agachamento unilateral com a outra perna estendida.', videoUrl: 'https://www.youtube.com/watch?v=qDcniqddTeE' },
   { name: 'Belt Squat', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'MACHINE', description: 'Agachamento com peso preso ao cinto.', videoUrl: 'https://www.youtube.com/watch?v=_8jP7wS0qKg' },
   { name: 'Agachamento Pendular', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'MACHINE', description: 'Agachamento na máquina com movimento pendular.', videoUrl: 'https://www.youtube.com/watch?v=zOMby8GibRk' },
   { name: 'Cadeira Adutora', muscleGroup: 'LEGS', type: 'ISOLATED', equipment: 'MACHINE', description: 'Máquina sentada para trabalhar músculos internos da coxa.', videoUrl: 'https://www.youtube.com/watch?v=4D1kWBKB-fk' },
   { name: 'Cadeira Abdutora', muscleGroup: 'LEGS', type: 'ISOLATED', equipment: 'MACHINE', description: 'Máquina sentada para trabalhar músculos externos do quadril.', videoUrl: 'https://www.youtube.com/watch?v=MkGEaQmM3KM' },
   { name: 'Nordic Curl', muscleGroup: 'LEGS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Ajoelhado, desça o corpo controlando com os isquiotibiais.', videoUrl: 'https://www.youtube.com/watch?v=WKJ1UBDCRkE' },
   { name: 'Panturrilha em Pé na Máquina', muscleGroup: 'CALVES', type: 'ISOLATED', equipment: 'MACHINE', description: 'De pé na plataforma, eleve os calcanhares.', videoUrl: 'https://www.youtube.com/watch?v=JbyjNymZOt0' },
   { name: 'Panturrilha Sentado', muscleGroup: 'CALVES', type: 'ISOLATED', equipment: 'MACHINE', description: 'Panturrilha sentada focando no sóleo.', videoUrl: 'https://www.youtube.com/watch?v=JbyjNymZOt0' },
   { name: 'Panturrilha Donkey', muscleGroup: 'CALVES', type: 'ISOLATED', equipment: 'MACHINE', description: 'Panturrilha inclinada na máquina donkey.', videoUrl: 'https://www.youtube.com/watch?v=druOaGsUfhc' },
   { name: 'Panturrilha no Smith', muscleGroup: 'CALVES', type: 'ISOLATED', equipment: 'MACHINE', description: 'Panturrilha no Smith Machine.', videoUrl: 'https://www.youtube.com/watch?v=hh-GCt3v2O8' },
   { name: 'Panturrilha com Peso Corporal', muscleGroup: 'CALVES', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Panturrilha usando apenas o peso do corpo na escada.', videoUrl: 'https://www.youtube.com/watch?v=gwLzBJYoWlI' },
   { name: 'Panturrilha no Leg Press', muscleGroup: 'CALVES', type: 'ISOLATED', equipment: 'MACHINE', description: 'Panturrilha na máquina de leg press.', videoUrl: 'https://www.youtube.com/watch?v=KSzNoC--cxM' },

   // ========== OMBROS (25) ==========
   { name: 'Desenvolvimento com Barra', muscleGroup: 'SHOULDERS', type: 'COMPOUND', equipment: 'BARBELL', description: 'Empurre a barra acima da cabeça a partir dos ombros.', videoUrl: 'https://www.youtube.com/watch?v=2yjwXTZQDDI' },
   { name: 'Desenvolvimento Sentado com Halteres', muscleGroup: 'SHOULDERS', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Sentado, empurre os halteres acima da cabeça.', videoUrl: 'https://www.youtube.com/watch?v=qEwKCR5JCog' },
   { name: 'Desenvolvimento em Pé com Halteres', muscleGroup: 'SHOULDERS', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Em pé, empurre os halteres acima da cabeça.', videoUrl: 'https://www.youtube.com/watch?v=qEwKCR5JCog' },
   { name: 'Arnold Press', muscleGroup: 'SHOULDERS', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Gire os halteres da frente para o lado enquanto empurra.', videoUrl: 'https://www.youtube.com/watch?v=6Z15_WdXmVw' },
   { name: 'Desenvolvimento na Máquina', muscleGroup: 'SHOULDERS', type: 'COMPOUND', equipment: 'MACHINE', description: 'Desenvolvimento sentado na máquina.', videoUrl: 'https://www.youtube.com/watch?v=Wqq43dKW1TU' },
   { name: 'Desenvolvimento no Smith', muscleGroup: 'SHOULDERS', type: 'COMPOUND', equipment: 'MACHINE', description: 'Desenvolvimento no Smith Machine.', videoUrl: 'https://www.youtube.com/watch?v=yGSFI54EzUI' },
   { name: 'Elevação Lateral', muscleGroup: 'SHOULDERS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Eleve os halteres para os lados até a altura dos ombros.', videoUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo' },
   { name: 'Elevação Lateral no Cabo', muscleGroup: 'SHOULDERS', type: 'ISOLATED', equipment: 'CABLE', description: 'Elevação lateral usando cabo para tensão constante.', videoUrl: 'https://www.youtube.com/watch?v=PPrzBWJDqjA' },
   { name: 'Elevação Lateral na Máquina', muscleGroup: 'SHOULDERS', type: 'ISOLATED', equipment: 'MACHINE', description: 'Elevação lateral na máquina dedicada.', videoUrl: 'https://www.youtube.com/watch?v=5tuvBfajSwg' },
   { name: 'Elevação Frontal', muscleGroup: 'SHOULDERS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Eleve os halteres para frente até a altura dos ombros.', videoUrl: 'https://www.youtube.com/watch?v=-t7fuZ0KhDA' },
   { name: 'Elevação Frontal no Cabo', muscleGroup: 'SHOULDERS', type: 'ISOLATED', equipment: 'CABLE', description: 'Elevação frontal usando cabo.', videoUrl: 'https://www.youtube.com/watch?v=cXMvKgmRoTc' },
   { name: 'Elevação Frontal com Barra', muscleGroup: 'SHOULDERS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Eleve a barra para frente até a altura dos ombros.', videoUrl: 'https://www.youtube.com/watch?v=sxzEQ0dHBJk' },
   { name: 'Crucifixo Inverso', muscleGroup: 'SHOULDERS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Inclinado, eleve os halteres para os lados para deltoides posteriores.', videoUrl: 'https://www.youtube.com/watch?v=EA7u4Q_8HQ0' },
   { name: 'Peck Deck Inverso', muscleGroup: 'SHOULDERS', type: 'ISOLATED', equipment: 'MACHINE', description: 'Crucifixo inverso na máquina peck deck para deltoides posteriores.', videoUrl: 'https://www.youtube.com/watch?v=DVhGOnJv0dE' },
   { name: 'Crucifixo Inverso no Cabo', muscleGroup: 'SHOULDERS', type: 'ISOLATED', equipment: 'CABLE', description: 'Crucifixo inverso usando cabos.', videoUrl: 'https://www.youtube.com/watch?v=4GC0h_qCScQ' },
   { name: 'Remada Alta com Barra', muscleGroup: 'SHOULDERS', type: 'COMPOUND', equipment: 'BARBELL', description: 'Puxe a barra para cima ao longo do corpo até o queixo.', videoUrl: 'https://www.youtube.com/watch?v=amCU-ziHITM' },
   { name: 'Remada Alta com Halteres', muscleGroup: 'SHOULDERS', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Remada alta com halteres.', videoUrl: 'https://www.youtube.com/watch?v=amCU-ziHITM' },
   { name: 'Desenvolvimento Nuca', muscleGroup: 'SHOULDERS', type: 'COMPOUND', equipment: 'BARBELL', description: 'Empurre a barra acima da cabeça por trás do pescoço.', videoUrl: 'https://www.youtube.com/watch?v=WJKXuIHa8bY' },
   { name: 'Push Press', muscleGroup: 'SHOULDERS', type: 'COMPOUND', equipment: 'BARBELL', description: 'Use impulso das pernas para empurrar a barra acima da cabeça.', videoUrl: 'https://www.youtube.com/watch?v=X6-DMh-t4bQ' },
   { name: 'Z Press', muscleGroup: 'SHOULDERS', type: 'COMPOUND', equipment: 'BARBELL', description: 'Sentado no chão com pernas estendidas, empurre acima.', videoUrl: 'https://www.youtube.com/watch?v=JN_3YFHTL5s' },
   { name: 'Lu Raise', muscleGroup: 'SHOULDERS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Elevação lateral com polegares para cima e leve ângulo frontal.', videoUrl: 'https://www.youtube.com/watch?v=kDMcleGFOrc' },
   { name: 'Face Pull no Cabo', muscleGroup: 'SHOULDERS', type: 'ISOLATED', equipment: 'CABLE', description: 'Puxe a corda até o rosto com rotação externa.', videoUrl: 'https://www.youtube.com/watch?v=rep-qVOkqgk' },
   { name: 'Pull Apart com Elástico', muscleGroup: 'SHOULDERS', type: 'ISOLATED', equipment: 'BAND', description: 'Puxe o elástico para os lados na altura do peito.', videoUrl: 'https://www.youtube.com/watch?v=JObYtU7Y7ag' },
   { name: 'Elevação Frontal com Anilha', muscleGroup: 'SHOULDERS', type: 'ISOLATED', equipment: 'OTHER', description: 'Eleve uma anilha para frente até a altura dos ombros.', videoUrl: 'https://www.youtube.com/watch?v=nRgM1HpnHvY' },
   { name: 'Desenvolvimento com Kettlebell', muscleGroup: 'SHOULDERS', type: 'COMPOUND', equipment: 'KETTLEBELL', description: 'Empurre o kettlebell acima da cabeça.', videoUrl: 'https://www.youtube.com/watch?v=QI54KbRl1ZU' },

   // ========== BÍCEPS (20) ==========
   { name: 'Rosca Direta com Barra', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Flexione os braços curvando a barra para cima.', videoUrl: 'https://www.youtube.com/watch?v=kwG2ipFRgFo' },
   { name: 'Rosca Direta com Barra W', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Rosca com barra W para conforto nos pulsos.', videoUrl: 'https://www.youtube.com/watch?v=kwG2ipFRgFo' },
   { name: 'Rosca Direta com Halteres', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Flexione os halteres alternando ou simultaneamente.', videoUrl: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo' },
   { name: 'Rosca Martelo', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Rosca com pegada neutra (martelo).', videoUrl: 'https://www.youtube.com/watch?v=zC3nLlEkg5A' },
   { name: 'Rosca Inclinada com Halteres', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Rosca sentado no banco inclinado.', videoUrl: 'https://www.youtube.com/watch?v=soxrZlIl35U' },
   { name: 'Rosca Concentrada', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Sentado, flexione o halter com cotovelo apoiado na coxa.', videoUrl: 'https://www.youtube.com/watch?v=0AUGkch3tzc' },
   { name: 'Rosca Scott com Barra', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Rosca no banco Scott para isolar bíceps.', videoUrl: 'https://www.youtube.com/watch?v=fIWP-FRFNU0' },
   { name: 'Rosca Scott com Halter', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Rosca Scott unilateral com halter.', videoUrl: 'https://www.youtube.com/watch?v=fIWP-FRFNU0' },
   { name: 'Rosca no Cabo', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'CABLE', description: 'Rosca na polia para tensão constante.', videoUrl: 'https://www.youtube.com/watch?v=NFzTWp2qpiE' },
   { name: 'Rosca Martelo no Cabo', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'CABLE', description: 'Rosca martelo com corda no cabo.', videoUrl: 'https://www.youtube.com/watch?v=TwD-YGVP4Bk' },
   { name: 'Rosca Spider', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Rosca com peito apoiado no banco inclinado.', videoUrl: 'https://www.youtube.com/watch?v=i4CLayxPE5k' },
   { name: 'Rosca na Máquina', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'MACHINE', description: 'Rosca na máquina dedicada de bíceps.', videoUrl: 'https://www.youtube.com/watch?v=MshcXH91CS0' },
   { name: 'Rosca Inversa', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Rosca com pegada pronada para braquiorradial.', videoUrl: 'https://www.youtube.com/watch?v=nRgM1HpnHvY' },
   { name: 'Rosca Zottman', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Suba supinado, gire e desça pronado.', videoUrl: 'https://www.youtube.com/watch?v=ZrpRBgswtHs' },
   { name: 'Rosca Martelo Cross Body', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Rosca martelo cruzando em direção ao ombro oposto.', videoUrl: 'https://www.youtube.com/watch?v=a-hjvGaKYBE' },
   { name: 'Rosca Drag', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Rosca mantendo a barra colada ao corpo, cotovelos para trás.', videoUrl: 'https://www.youtube.com/watch?v=pKlxDRhR-jE' },
   { name: 'Rosca Bayesian no Cabo', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'CABLE', description: 'Rosca com braço atrás do corpo para alongar cabeça longa.', videoUrl: 'https://www.youtube.com/watch?v=X2yjA1r5NkI' },
   { name: 'Rosca 21', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'BARBELL', description: '7 meio inferior + 7 meio superior + 7 completas.', videoUrl: 'https://www.youtube.com/watch?v=LPJgYyLUxjE' },
   { name: 'Rosca com Kettlebell', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'KETTLEBELL', description: 'Rosca direta com kettlebell.', videoUrl: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo' },
   { name: 'Rosca com Elástico', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'BAND', description: 'Rosca direta com elástico de resistência.', videoUrl: 'https://www.youtube.com/watch?v=yijilMYqDoA' },

   // ========== TRÍCEPS (18) ==========
   { name: 'Tríceps na Polia (Barra)', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'CABLE', description: 'Empurre a barra para baixo estendendo os cotovelos.', videoUrl: 'https://www.youtube.com/watch?v=HEJHrDEdxK4' },
   { name: 'Tríceps Corda na Polia', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'CABLE', description: 'Tríceps com corda na polia, abra no final.', videoUrl: 'https://www.youtube.com/watch?v=2-LAMcpzODU' },
   { name: 'Extensão de Tríceps no Cabo', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'CABLE', description: 'De costas para o cabo, estenda a corda acima da cabeça.', videoUrl: 'https://www.youtube.com/watch?v=iLBakvBUpCA' },
   { name: 'Extensão de Tríceps com Halter', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Segure o halter acima da cabeça, desça atrás e estenda.', videoUrl: 'https://www.youtube.com/watch?v=YbX7Wd3jQ6Q' },
   { name: 'Tríceps Testa com Barra', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Deite no banco, desça a barra até a testa e estenda.', videoUrl: 'https://www.youtube.com/watch?v=d_KZxkY_0cM' },
   { name: 'Tríceps Testa com Halteres', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Tríceps testa com halteres.', videoUrl: 'https://www.youtube.com/watch?v=ir5PsbniVSc' },

   { name: 'Mergulho (Tríceps)', muscleGroup: 'TRICEPS', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Mergulho nas barras paralelas focando em tríceps.', videoUrl: 'https://www.youtube.com/watch?v=dX_nSOOJIsE' },
   { name: 'Mergulho no Banco', muscleGroup: 'TRICEPS', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Mergulho usando o banco atrás das costas.', videoUrl: 'https://www.youtube.com/watch?v=c3ZGl4pAwZ4' },
   { name: 'Tríceps Coice com Halter', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Inclinado, estenda o halter para trás.', videoUrl: 'https://www.youtube.com/watch?v=ZO81bExngMI' },
   { name: 'Tríceps Coice no Cabo', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'CABLE', description: 'Tríceps coice usando cabo para tensão constante.', videoUrl: 'https://www.youtube.com/watch?v=HEJHrDEdxK4' },
   { name: 'Extensão de Tríceps com Barra', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Em pé ou sentado, desça a barra atrás da cabeça.', videoUrl: 'https://www.youtube.com/watch?v=YbX7Wd3jQ6Q' },
   { name: 'JM Press', muscleGroup: 'TRICEPS', type: 'COMPOUND', equipment: 'BARBELL', description: 'Movimento híbrido de supino e tríceps testa.', videoUrl: 'https://www.youtube.com/watch?v=6e0aKO1GXOU' },
   { name: 'Tate Press', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Desça os halteres até o peito com cotovelos abertos, empurre.', videoUrl: 'https://www.youtube.com/watch?v=LY7R7dSosdQ' },
   { name: 'Tríceps Francês', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Extensão de tríceps acima da cabeça com barra.', videoUrl: 'https://www.youtube.com/watch?v=YbX7Wd3jQ6Q' },
   { name: 'Tríceps na Máquina', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'MACHINE', description: 'Extensão de tríceps na máquina dedicada.', videoUrl: 'https://www.youtube.com/watch?v=JgR5JgyAfWI' },

   { name: 'Tríceps Unilateral na Polia', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'CABLE', description: 'Tríceps unilateral no cabo.', videoUrl: 'https://www.youtube.com/watch?v=HEJHrDEdxK4' },
   { name: 'Tríceps Supinado na Polia', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'CABLE', description: 'Tríceps na polia com pegada supinada.', videoUrl: 'https://www.youtube.com/watch?v=HEJHrDEdxK4' },
   { name: 'Tríceps com Elástico', muscleGroup: 'TRICEPS', type: 'ISOLATED', equipment: 'BAND', description: 'Extensão de tríceps usando elástico de resistência.', videoUrl: 'https://www.youtube.com/watch?v=2-LAMcpzODU' },

   // ========== ABDÔMEN (20) ==========
   { name: 'Abdominal', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Deite de costas, enrole os ombros em direção ao quadril.', videoUrl: 'https://www.youtube.com/watch?v=Xyd_fa5zoEU' },
   { name: 'Abdominal no Cabo', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'CABLE', description: 'Ajoelhado de frente para o cabo, flexione contra a resistência.', videoUrl: 'https://www.youtube.com/watch?v=AV5PmrSHFRw' },
   { name: 'Abdominal na Máquina', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'MACHINE', description: 'Abdominal na máquina dedicada.', videoUrl: 'https://www.youtube.com/watch?v=AV5PmrSHFRw' },
   { name: 'Elevação de Pernas na Barra', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Pendurado na barra, eleve as pernas até paralelo ou acima.', videoUrl: 'https://www.youtube.com/watch?v=Pr1ieGZ5atk' },
   { name: 'Elevação de Joelhos na Barra', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Pendurado na barra, eleve os joelhos até o peito.', videoUrl: 'https://www.youtube.com/watch?v=Pr1ieGZ5atk' },
   { name: 'Prancha', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Posição de flexão nos antebraços, mantenha o corpo reto.', videoUrl: 'https://www.youtube.com/watch?v=ASdvN_XEl_c' },
   { name: 'Prancha Lateral', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Mantenha posição lateral apoiado em um antebraço.', videoUrl: 'https://www.youtube.com/watch?v=YU-fSsifbJA' },
   { name: 'Rotação Russa', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Sentado, incline para trás, gire o tronco lado a lado.', videoUrl: 'https://www.youtube.com/watch?v=wkD8rjkodUI' },
   { name: 'Roda Abdominal', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'OTHER', description: 'Role a roda para frente e volte ajoelhado.', videoUrl: 'https://www.youtube.com/watch?v=rqiTPl2pEk8' },
   { name: 'Abdominal Bicicleta', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Alterne cotovelo ao joelho oposto em movimento de pedalar.', videoUrl: 'https://www.youtube.com/watch?v=9FGilxCbdz8' },
   { name: 'Escalador', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Na posição de flexão, alterne joelhos para frente.', videoUrl: 'https://www.youtube.com/watch?v=nmwgirgXLYM' },
   { name: 'Dead Bug', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'De costas, estenda braço e perna opostos alternadamente.', videoUrl: 'https://www.youtube.com/watch?v=4XLEnwUr1d8' },
   { name: 'Abdominal Reverso', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Deite de costas, enrole o quadril em direção aos ombros.', videoUrl: 'https://www.youtube.com/watch?v=hyv14e2QDq0' },
   { name: 'Abdominal V-Up', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Deite reto, levante pernas e tronco simultaneamente em V.', videoUrl: 'https://www.youtube.com/watch?v=iP2fjvG0g3w' },
   { name: 'Pallof Press', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'CABLE', description: 'Exercício anti-rotação empurrando o cabo para frente.', videoUrl: 'https://www.youtube.com/watch?v=AH_QZLm_0-s' },
   { name: 'Abdominal no Banco Declinado', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Abdominal no banco declinado para maior resistência.', videoUrl: 'https://www.youtube.com/watch?v=Xyd_fa5zoEU' },
   { name: 'Dragon Flag', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'No banco, eleve o corpo rígido e desça lentamente.', videoUrl: 'https://www.youtube.com/watch?v=moyFIvRrS0s' },
   { name: 'Woodchop no Cabo', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'CABLE', description: 'Gire o tronco puxando o cabo na diagonal.', videoUrl: 'https://www.youtube.com/watch?v=pAplQXk3dkU' },
   { name: 'Toque nos Pés', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Deite de costas, pernas para cima, alcance os pés.', videoUrl: 'https://www.youtube.com/watch?v=Xyd_fa5zoEU' },
   { name: 'Tesoura', muscleGroup: 'ABS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Deite de costas, alterne chutes com as pernas para cima e baixo.', videoUrl: 'https://www.youtube.com/watch?v=ANVdMDaTvtM' },

   // ========== GLÚTEOS (10) ==========
   { name: 'Hip Thrust com Barra (Glúteos)', muscleGroup: 'GLUTES', type: 'COMPOUND', equipment: 'BARBELL', description: 'Costas no banco, empurre o quadril para cima com barra focando glúteos.', videoUrl: 'https://www.youtube.com/watch?v=SEdqd1s0GKs' },
   { name: 'Pull Through no Cabo', muscleGroup: 'GLUTES', type: 'ISOLATED', equipment: 'CABLE', description: 'De costas para o cabo, flexione e puxe entre as pernas.', videoUrl: 'https://www.youtube.com/watch?v=5AaPzzGFPKs' },
   { name: 'Glúteo no Cabo', muscleGroup: 'GLUTES', type: 'ISOLATED', equipment: 'CABLE', description: 'Chute a perna para trás contra a resistência do cabo.', videoUrl: 'https://www.youtube.com/watch?v=5tuvBfajSwg' },
   { name: 'Glúteo na Máquina', muscleGroup: 'GLUTES', type: 'ISOLATED', equipment: 'MACHINE', description: 'Chute a perna para trás na máquina de glúteos.', videoUrl: 'https://www.youtube.com/watch?v=5tuvBfajSwg' },
   { name: 'Frog Pump', muscleGroup: 'GLUTES', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Deite de costas, solas dos pés juntas, eleve o quadril.', videoUrl: 'https://www.youtube.com/watch?v=Akh5bNI2ask' },
   { name: 'Agachamento Sumô', muscleGroup: 'GLUTES', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Agachamento com pernas afastadas focando glúteos e adutores.', videoUrl: 'https://www.youtube.com/watch?v=ElDsF2DZjro' },
   { name: 'Hip Thrust Unilateral', muscleGroup: 'GLUTES', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Hip thrust em uma perna para trabalho unilateral.', videoUrl: 'https://www.youtube.com/watch?v=SEdqd1s0GKs' },
   { name: 'Clamshell com Elástico', muscleGroup: 'GLUTES', type: 'ISOLATED', equipment: 'BAND', description: 'Deitado de lado, abra os joelhos contra resistência do elástico.', videoUrl: 'https://www.youtube.com/watch?v=cETPHqVg5GY' },
   { name: 'Caminhada Lateral com Elástico', muscleGroup: 'GLUTES', type: 'ISOLATED', equipment: 'BAND', description: 'Caminhe de lado com elástico nos tornozelos.', videoUrl: 'https://www.youtube.com/watch?v=8JGhlkHiHQ4' },
   { name: 'Stiff com Halteres (Glúteos)', muscleGroup: 'GLUTES', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Stiff com halteres focando em glúteos e isquiotibiais.', videoUrl: 'https://www.youtube.com/watch?v=hCDlSqe0IG0' },

   // ========== TRAPÉZIO (8) ==========
   { name: 'Encolhimento com Barra', muscleGroup: 'TRAPS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Encolha os ombros para cima segurando a barra.', videoUrl: 'https://www.youtube.com/watch?v=Bun6kPPaQtk' },
   { name: 'Encolhimento com Halteres', muscleGroup: 'TRAPS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Encolha os ombros para cima segurando halteres.', videoUrl: 'https://www.youtube.com/watch?v=cJRVVxmytaM' },
   { name: 'Encolhimento com Barra Hexagonal', muscleGroup: 'TRAPS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Encolhimento usando barra hexagonal.', videoUrl: 'https://www.youtube.com/watch?v=Bun6kPPaQtk' },
   { name: 'Encolhimento no Smith', muscleGroup: 'TRAPS', type: 'ISOLATED', equipment: 'MACHINE', description: 'Encolhimento no Smith Machine.', videoUrl: 'https://www.youtube.com/watch?v=Bun6kPPaQtk' },
   { name: 'Encolhimento no Cabo', muscleGroup: 'TRAPS', type: 'ISOLATED', equipment: 'CABLE', description: 'Encolhimento usando cabos.', videoUrl: 'https://www.youtube.com/watch?v=Bun6kPPaQtk' },
   { name: 'Farmer Walk', muscleGroup: 'TRAPS', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Caminhe carregando halteres pesados ao lado do corpo.', videoUrl: 'https://www.youtube.com/watch?v=Fkzk_RqlYig' },
   { name: 'Encolhimento por Trás com Barra', muscleGroup: 'TRAPS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Encolhimento com barra atrás do corpo.', videoUrl: 'https://www.youtube.com/watch?v=Bun6kPPaQtk' },
   { name: 'Encolhimento Acima da Cabeça', muscleGroup: 'TRAPS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Encolhimento com barra acima da cabeça.', videoUrl: 'https://www.youtube.com/watch?v=Bun6kPPaQtk' },

   // ========== ANTEBRAÇO (8) ==========
   { name: 'Rosca de Punho com Barra', muscleGroup: 'FOREARMS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Antebraços no banco, flexione os punhos com barra.', videoUrl: 'https://www.youtube.com/watch?v=DBMYNal_JJA' },
   { name: 'Rosca de Punho Inversa', muscleGroup: 'FOREARMS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Antebraços no banco, estenda os punhos com pegada pronada.', videoUrl: 'https://www.youtube.com/watch?v=DBMYNal_JJA' },
   { name: 'Rosca de Punho com Halter', muscleGroup: 'FOREARMS', type: 'ISOLATED', equipment: 'DUMBBELL', description: 'Rosca de punho com halter.', videoUrl: 'https://www.youtube.com/watch?v=DBMYNal_JJA' },
   { name: 'Rosca de Punho por Trás', muscleGroup: 'FOREARMS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Barra atrás do corpo, flexione os punhos.', videoUrl: 'https://www.youtube.com/watch?v=DBMYNal_JJA' },
   { name: 'Rosca Inversa com Barra', muscleGroup: 'FOREARMS', type: 'ISOLATED', equipment: 'BARBELL', description: 'Rosca com pegada pronada para desenvolvimento do antebraço.', videoUrl: 'https://www.youtube.com/watch?v=nRgM1HpnHvY' },
   { name: 'Preensão de Anilha', muscleGroup: 'FOREARMS', type: 'ISOLATED', equipment: 'OTHER', description: 'Aperte anilhas juntas para força de pegada.', videoUrl: 'https://www.youtube.com/watch?v=T4V6fJxNBBo' },
   { name: 'Suspensão na Barra', muscleGroup: 'FOREARMS', type: 'ISOLATED', equipment: 'BODYWEIGHT', description: 'Fique pendurado na barra para resistência de pegada.', videoUrl: 'https://www.youtube.com/watch?v=fxZdV2Gt05A' },
   { name: 'Barra Fixa com Toalha', muscleGroup: 'FOREARMS', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Barra fixa segurando toalhas para força de pegada.', videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g' },

   // ========== CARDIO (15) ==========
   { name: 'Corrida na Esteira', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'MACHINE', description: 'Corra na esteira no ritmo desejado.', videoUrl: 'https://www.youtube.com/watch?v=QFWN5DUTTG4' },
   { name: 'Caminhada Inclinada na Esteira', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'MACHINE', description: 'Caminhe na esteira com inclinação.', videoUrl: 'https://www.youtube.com/watch?v=QFWN5DUTTG4' },
   { name: 'Bicicleta Ergométrica', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'MACHINE', description: 'Pedale na bicicleta ergométrica.', videoUrl: 'https://www.youtube.com/watch?v=swmOGyzF0v4' },
   { name: 'Elíptico', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'MACHINE', description: 'Use o elíptico para cardio de baixo impacto.', videoUrl: 'https://www.youtube.com/watch?v=gJsDe2Y6lhI' },
   { name: 'Remo Ergométrico', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'MACHINE', description: 'Reme no ergômetro para cardio corpo inteiro.', videoUrl: 'https://www.youtube.com/watch?v=zQ82RYIFLN8' },
   { name: 'Escada Ergométrica', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'MACHINE', description: 'Suba na máquina de escada.', videoUrl: 'https://www.youtube.com/watch?v=eQp5Ep-I5Bg' },
   { name: 'Pular Corda', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'OTHER', description: 'Pule corda para condicionamento cardio.', videoUrl: 'https://www.youtube.com/watch?v=7l6GRjLQm54' },
   { name: 'Corda Naval', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'OTHER', description: 'Balance cordas pesadas para HIIT cardio.', videoUrl: 'https://www.youtube.com/watch?v=sSIy7jBLjwE' },
   { name: 'Salto no Caixote', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'OTHER', description: 'Salte sobre caixote elevado.', videoUrl: 'https://www.youtube.com/watch?v=52r_Ul5k03g' },
   { name: 'Burpee', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'BODYWEIGHT', description: 'Movimento completo: agachamento, flexão, salto.', videoUrl: 'https://www.youtube.com/watch?v=dZgVxmf6jkA' },
   { name: 'Swing com Kettlebell', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'KETTLEBELL', description: 'Balance o kettlebell entre as pernas e até o peito.', videoUrl: 'https://www.youtube.com/watch?v=0oc88FBaF9I' },
   { name: 'Assault Bike', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'MACHINE', description: 'Bicicleta de resistência a ar com braços.', videoUrl: 'https://www.youtube.com/watch?v=swmOGyzF0v4' },
   { name: 'Natação', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'OTHER', description: 'Nade voltas para exercício cardiovascular.', videoUrl: 'https://www.youtube.com/watch?v=5HLW2AI1Ink' },
   { name: 'Empurrar Trenó', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'OTHER', description: 'Empurre o trenó com peso pelo chão.', videoUrl: 'https://www.youtube.com/watch?v=Yze2RRsGAHE' },
   { name: 'Sprint', muscleGroup: 'CARDIO', type: 'CARDIO', equipment: 'BODYWEIGHT', description: 'Corrida de curta distância em esforço máximo.', videoUrl: 'https://www.youtube.com/watch?v=QFWN5DUTTG4' },

   // ========== CORPO INTEIRO (10) ==========
   { name: 'Clean and Press', muscleGroup: 'FULL_BODY', type: 'COMPOUND', equipment: 'BARBELL', description: 'Limpe a barra até os ombros e empurre acima da cabeça.', videoUrl: 'https://www.youtube.com/watch?v=of4ub3M1oKM' },
   { name: 'Clean and Jerk', muscleGroup: 'FULL_BODY', type: 'COMPOUND', equipment: 'BARBELL', description: 'Levantamento olímpico: limpe e arremesse acima da cabeça.', videoUrl: 'https://www.youtube.com/watch?v=2jkmyU8VKdQ' },
   { name: 'Snatch (Arranco)', muscleGroup: 'FULL_BODY', type: 'COMPOUND', equipment: 'BARBELL', description: 'Levantamento olímpico: puxe a barra do chão acima da cabeça.', videoUrl: 'https://www.youtube.com/watch?v=9xQp2sldyts' },
   { name: 'Thruster com Barra', muscleGroup: 'FULL_BODY', type: 'COMPOUND', equipment: 'BARBELL', description: 'Agachamento frontal seguido de desenvolvimento em um movimento.', videoUrl: 'https://www.youtube.com/watch?v=1MZMhZbBxNk' },
   { name: 'Thruster com Halteres', muscleGroup: 'FULL_BODY', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Agachamento e desenvolvimento com halteres.', videoUrl: 'https://www.youtube.com/watch?v=1MZMhZbBxNk' },
   { name: 'Turkish Get-Up', muscleGroup: 'FULL_BODY', type: 'COMPOUND', equipment: 'KETTLEBELL', description: 'Movimento multi-etapa de deitado para em pé com peso acima.', videoUrl: 'https://www.youtube.com/watch?v=0bWRPC49-KI' },
   { name: 'Man Maker', muscleGroup: 'FULL_BODY', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Combo de flexão, remada, clean e press com halteres.', videoUrl: 'https://www.youtube.com/watch?v=dDI2Pp97pVo' },
   { name: 'Devil Press', muscleGroup: 'FULL_BODY', type: 'COMPOUND', equipment: 'DUMBBELL', description: 'Burpee com snatch de halter acima da cabeça.', videoUrl: 'https://www.youtube.com/watch?v=A_6BPfH8a8w' },
   { name: 'Bear Complex', muscleGroup: 'FULL_BODY', type: 'COMPOUND', equipment: 'BARBELL', description: 'Clean, agachamento frontal, push press, agachamento costas, press.', videoUrl: 'https://www.youtube.com/watch?v=rQQIuT8RfN4' },
   { name: 'Muscle-Up', muscleGroup: 'FULL_BODY', type: 'COMPOUND', equipment: 'BODYWEIGHT', description: 'Barra fixa transitando para mergulho acima da barra.', videoUrl: 'https://www.youtube.com/watch?v=1AcPxpT-vbM' },
];

async function main() {
   console.log('🌱 Seeding database...');

   // Remove old non-custom exercises (names changed to pt-BR)
   const deleted = await prisma.exercise.deleteMany({ where: { isCustom: false } });
   console.log(`🗑️  Removed ${deleted.count} old exercises`);

   // Create exercises with pt-BR names
   let upserted = 0;
   for (const e of exercises) {
      await prisma.exercise.upsert({
         where: {
            name_isCustom: { name: e.name, isCustom: false },
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
            isCustom: false,
            userId: null,
         },
      });
      upserted++;
   }

   console.log(`✅ Upserted ${upserted} exercises`);
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
