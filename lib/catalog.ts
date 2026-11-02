import type { AppData, Exercise, Muscle, Routine } from './types';
import { exerciseVideos } from './exercise-videos';

/**
 * Catálogo RB: 100 ejercicios curados para el equipo habitual de Planet Fitness
 * (máquinas selectorizadas, poleas, mancuernas, Smith y peso corporal).
 * Los textos son propios. Las dos fotos de cada ejercicio (posición inicial y final) provienen de
 * Free Exercise DB (https://github.com/yuhonas/free-exercise-db), publicado en dominio público (Unlicense);
 * `media.source` guarda el identificador original. Ver public/exercises/CREDITS.md.
 */
export const MEDIA_CREDIT = 'Fotos: Free Exercise DB (dominio público).';

export const catalog: Exercise[] = [
  {
    id: 'chest-press',
    name: 'Press de pecho en máquina',
    muscle: 'Pecho',
    equipment: 'Máquina',
    instruction:
      'Ajusta el asiento para que las empuñaduras queden a la altura del pecho. Empuja al frente sin bloquear los codos y regresa con control.',
    tip: 'Mantén los hombros lejos de las orejas y la espalda apoyada.',
    media: {
      frames: ['/exercises/chest-press/0.webp', '/exercises/chest-press/1.webp'],
      source: 'Leverage_Chest_Press',
    },
  },
  {
    id: 'machine-incline-press',
    name: 'Press inclinado en máquina',
    muscle: 'Pecho',
    equipment: 'Máquina',
    instruction:
      'Siéntate con la espalda apoyada y empuja las empuñaduras hacia arriba y al frente. Baja despacio hasta sentir el estiramiento del pecho.',
    tip: 'No arquees la zona lumbar para ayudar al empuje.',
    media: {
      frames: ['/exercises/machine-incline-press/0.webp', '/exercises/machine-incline-press/1.webp'],
      source: 'Leverage_Incline_Chest_Press',
    },
  },
  {
    id: 'incline-dumbbell',
    name: 'Press inclinado con mancuernas',
    muscle: 'Pecho',
    equipment: 'Mancuernas',
    instruction:
      'Coloca el banco con una inclinación moderada. Baja las mancuernas a los lados del pecho y empuja hacia arriba juntándolas ligeramente.',
    tip: 'Evita rebotar abajo; controla la bajada.',
    media: {
      frames: ['/exercises/incline-dumbbell/0.webp', '/exercises/incline-dumbbell/1.webp'],
      source: 'Incline_Dumbbell_Press',
    },
  },
  {
    id: 'dumbbell-bench',
    name: 'Press plano con mancuernas',
    muscle: 'Pecho',
    equipment: 'Mancuernas',
    instruction:
      'Tumbado en banco plano, baja las mancuernas hasta la altura del pecho con los codos a unos 45 grados y empuja hasta extender los brazos.',
    tip: 'Pies firmes en el suelo y escápulas juntas.',
    media: {
      frames: ['/exercises/dumbbell-bench/0.webp', '/exercises/dumbbell-bench/1.webp'],
      source: 'Dumbbell_Bench_Press',
    },
  },
  {
    id: 'dumbbell-fly',
    name: 'Aperturas con mancuernas',
    muscle: 'Pecho',
    equipment: 'Mancuernas',
    instruction:
      'Con los codos ligeramente flexionados, abre los brazos en arco hasta sentir el estiramiento y vuelve a juntar las mancuernas sobre el pecho.',
    tip: 'Usa menos peso del que crees: es un ejercicio de estiramiento, no de fuerza máxima.',
    media: {
      frames: ['/exercises/dumbbell-fly/0.webp', '/exercises/dumbbell-fly/1.webp'],
      source: 'Dumbbell_Flyes',
    },
  },
  {
    id: 'pec-deck',
    name: 'Aperturas en peck deck',
    muscle: 'Pecho',
    equipment: 'Máquina',
    instruction:
      'Ajusta el asiento, mantén una leve flexión de codos y junta los brazos frente al pecho. Regresa despacio.',
    tip: 'No abras más allá de la línea de los hombros.',
    media: { frames: ['/exercises/pec-deck/0.webp', '/exercises/pec-deck/1.webp'], source: 'Butterfly' },
  },
  {
    id: 'smith-bench',
    name: 'Press de banca en Smith',
    muscle: 'Pecho',
    equipment: 'Smith',
    instruction:
      'Alinea la barra con la mitad del pecho, desbloquea y baja hasta rozar el pecho. Empuja hasta extender los brazos y bloquea al terminar.',
    tip: 'Aprende los seguros de la máquina antes de cargar peso.',
    media: {
      frames: ['/exercises/smith-bench/0.webp', '/exercises/smith-bench/1.webp'],
      source: 'Smith_Machine_Bench_Press',
    },
  },
  {
    id: 'smith-incline',
    name: 'Press inclinado en Smith',
    muscle: 'Pecho',
    equipment: 'Smith',
    instruction:
      'Con el banco inclinado bajo la barra, baja hasta la parte alta del pecho y empuja hacia arriba.',
    tip: 'Mantén las muñecas rectas sobre los codos.',
    media: {
      frames: ['/exercises/smith-incline/0.webp', '/exercises/smith-incline/1.webp'],
      source: 'Smith_Machine_Incline_Bench_Press',
    },
  },
  {
    id: 'cable-crossover',
    name: 'Cruce de poleas',
    muscle: 'Pecho',
    equipment: 'Polea',
    instruction:
      'Con las poleas altas, da un paso al frente y lleva las manos hacia abajo y adelante hasta cruzarlas frente a la cadera. Regresa controlando.',
    tip: 'Inclina el torso levemente hacia adelante y mantén los codos suaves.',
    media: {
      frames: ['/exercises/cable-crossover/0.webp', '/exercises/cable-crossover/1.webp'],
      source: 'Cable_Crossover',
    },
  },
  {
    id: 'low-cable-crossover',
    name: 'Cruce de poleas bajas',
    muscle: 'Pecho',
    equipment: 'Polea',
    instruction:
      'Con las poleas bajas, eleva los brazos en arco hasta juntar las manos frente al pecho alto.',
    tip: 'Trabaja la parte superior del pecho; no encojas los hombros.',
    media: {
      frames: ['/exercises/low-cable-crossover/0.webp', '/exercises/low-cable-crossover/1.webp'],
      source: 'Low_Cable_Crossover',
    },
  },
  {
    id: 'pushup',
    name: 'Flexiones de brazos',
    muscle: 'Pecho',
    equipment: 'Peso corporal',
    instruction:
      'Manos algo más abiertas que los hombros, cuerpo en línea recta. Baja el pecho hacia el suelo y empuja hasta extender los brazos.',
    tip: 'Si cuesta, apoya las manos en un banco (flexiones inclinadas).',
    media: { frames: ['/exercises/pushup/0.webp', '/exercises/pushup/1.webp'], source: 'Pushups' },
  },
  {
    id: 'incline-pushup',
    name: 'Flexiones inclinadas en banco',
    muscle: 'Pecho',
    equipment: 'Peso corporal',
    instruction:
      'Apoya las manos en un banco o barra de la Smith y realiza la flexión manteniendo el cuerpo alineado.',
    tip: 'Cuanto más alto el apoyo, más fácil el ejercicio.',
    media: {
      frames: ['/exercises/incline-pushup/0.webp', '/exercises/incline-pushup/1.webp'],
      source: 'Incline_Push-Up',
    },
  },
  {
    id: 'dumbbell-pullover',
    name: 'Pullover con mancuerna',
    muscle: 'Pecho',
    equipment: 'Mancuernas',
    instruction:
      'Tumbado en banco, sujeta una mancuerna con ambas manos sobre el pecho y bájala por detrás de la cabeza con los brazos casi rectos. Vuelve arriba.',
    tip: 'Baja solo hasta donde el hombro se sienta cómodo.',
    media: {
      frames: ['/exercises/dumbbell-pullover/0.webp', '/exercises/dumbbell-pullover/1.webp'],
      source: 'Straight-Arm_Dumbbell_Pullover',
    },
  },
  {
    id: 'lat-pulldown',
    name: 'Jalón al pecho',
    muscle: 'Espalda',
    equipment: 'Polea',
    instruction:
      'Ajusta el soporte de piernas. Lleva la barra a la parte alta del pecho bajando los codos y juntando escápulas. Sube con control.',
    tip: 'Evita jalar detrás de la cabeza.',
    media: {
      frames: ['/exercises/lat-pulldown/0.webp', '/exercises/lat-pulldown/1.webp'],
      source: 'Wide-Grip_Lat_Pulldown',
    },
  },
  {
    id: 'close-grip-pulldown',
    name: 'Jalón con agarre cerrado',
    muscle: 'Espalda',
    equipment: 'Polea',
    instruction:
      'Con el agarre en V, tira hacia el esternón manteniendo el pecho alto y los codos pegados al cuerpo.',
    tip: 'No te balancees hacia atrás para mover más peso.',
    media: {
      frames: ['/exercises/close-grip-pulldown/0.webp', '/exercises/close-grip-pulldown/1.webp'],
      source: 'Close-Grip_Front_Lat_Pulldown',
    },
  },
  {
    id: 'underhand-pulldown',
    name: 'Jalón supino',
    muscle: 'Espalda',
    equipment: 'Polea',
    instruction:
      'Agarre con palmas hacia ti al ancho de hombros. Tira de la barra hasta el pecho y regresa despacio.',
    tip: 'Involucra más el bíceps; útil si las dominadas aún cuestan.',
    media: {
      frames: ['/exercises/underhand-pulldown/0.webp', '/exercises/underhand-pulldown/1.webp'],
      source: 'Underhand_Cable_Pulldowns',
    },
  },
  {
    id: 'straight-arm-pulldown',
    name: 'Jalón con brazos rectos',
    muscle: 'Espalda',
    equipment: 'Polea',
    instruction:
      'De pie frente a la polea alta, baja la barra hacia los muslos con los brazos casi extendidos y vuelve hasta la altura de los hombros.',
    tip: 'El movimiento sale del hombro, no del codo.',
    media: {
      frames: ['/exercises/straight-arm-pulldown/0.webp', '/exercises/straight-arm-pulldown/1.webp'],
      source: 'Straight-Arm_Pulldown',
    },
  },
  {
    id: 'seated-row',
    name: 'Remo sentado en máquina',
    muscle: 'Espalda',
    equipment: 'Máquina',
    instruction:
      'Apoya el pecho en el soporte, tira de las empuñaduras hacia el torso juntando escápulas y regresa lentamente.',
    tip: 'Evita encorvar la zona lumbar.',
    media: {
      frames: ['/exercises/seated-row/0.webp', '/exercises/seated-row/1.webp'],
      source: 'Leverage_Iso_Row',
    },
  },
  {
    id: 'cable-row',
    name: 'Remo en polea baja',
    muscle: 'Espalda',
    equipment: 'Polea',
    instruction:
      'Sentado con las rodillas semiflexionadas, tira del agarre hacia el abdomen manteniendo la espalda recta. Extiende los brazos sin encorvarte.',
    tip: 'Lleva los codos atrás, no los hombros hacia las orejas.',
    media: {
      frames: ['/exercises/cable-row/0.webp', '/exercises/cable-row/1.webp'],
      source: 'Seated_Cable_Rows',
    },
  },
  {
    id: 'high-row',
    name: 'Remo alto en máquina',
    muscle: 'Espalda',
    equipment: 'Máquina',
    instruction:
      'Sujeta las empuñaduras altas y tira hacia abajo y atrás, llevando los codos hacia las costillas.',
    tip: 'Pecho firme contra el apoyo durante todo el recorrido.',
    media: {
      frames: ['/exercises/high-row/0.webp', '/exercises/high-row/1.webp'],
      source: 'Leverage_High_Row',
    },
  },
  {
    id: 'one-arm-row',
    name: 'Remo con mancuerna',
    muscle: 'Espalda',
    equipment: 'Mancuernas',
    instruction:
      'Apoya una mano y una rodilla en el banco, espalda neutra, y lleva la mancuerna hacia la cadera. Baja controlando.',
    tip: 'No gires el torso para elevar el peso.',
    media: {
      frames: ['/exercises/one-arm-row/0.webp', '/exercises/one-arm-row/1.webp'],
      source: 'One-Arm_Dumbbell_Row',
    },
  },
  {
    id: 'bent-over-db-row',
    name: 'Remo inclinado con mancuernas',
    muscle: 'Espalda',
    equipment: 'Mancuernas',
    instruction:
      'Inclina el torso hacia adelante con la espalda recta y tira de ambas mancuernas hacia el abdomen.',
    tip: 'Si la zona lumbar se cansa, apoya el pecho en un banco inclinado.',
    media: {
      frames: ['/exercises/bent-over-db-row/0.webp', '/exercises/bent-over-db-row/1.webp'],
      source: 'Bent_Over_Two-Dumbbell_Row',
    },
  },
  {
    id: 'smith-row',
    name: 'Remo inclinado en Smith',
    muscle: 'Espalda',
    equipment: 'Smith',
    instruction:
      'Con el torso inclinado y la espalda recta, tira de la barra hacia el abdomen y bájala con control.',
    tip: 'Mantén las rodillas flexionadas y el peso en los talones.',
    media: {
      frames: ['/exercises/smith-row/0.webp', '/exercises/smith-row/1.webp'],
      source: 'Smith_Machine_Bent_Over_Row',
    },
  },
  {
    id: 'assisted-pullup',
    name: 'Dominadas asistidas',
    muscle: 'Espalda',
    equipment: 'Máquina',
    instruction:
      'En la máquina de dominadas asistidas, ajusta el contrapeso, sujeta las barras y sube hasta que la barbilla pase el agarre. Baja despacio.',
    tip: 'Menos contrapeso cada semana es una forma clara de progresar.',
    media: {
      frames: ['/exercises/assisted-pullup/0.webp', '/exercises/assisted-pullup/1.webp'],
      source: 'Pullups',
    },
  },
  {
    id: 'chin-up',
    name: 'Dominadas supinas asistidas',
    muscle: 'Espalda',
    equipment: 'Máquina',
    instruction:
      'Agarre con palmas hacia ti. Sube llevando el pecho a la barra y baja hasta extender los brazos.',
    tip: 'Trabaja mucho el bíceps; combínalo con jalones.',
    media: { frames: ['/exercises/chin-up/0.webp', '/exercises/chin-up/1.webp'], source: 'Chin-Up' },
  },
  {
    id: 'back-extension',
    name: 'Extensión lumbar',
    muscle: 'Espalda',
    equipment: 'Máquina',
    instruction:
      'En la máquina o banco de extensiones, baja el torso con la espalda recta y sube hasta alinear el cuerpo, sin pasarte.',
    tip: 'Movimiento lento; aprieta glúteos al subir.',
    media: {
      frames: ['/exercises/back-extension/0.webp', '/exercises/back-extension/1.webp'],
      source: 'Hyperextensions_With_No_Hyperextension_Bench',
    },
  },
  {
    id: 'shoulder-press',
    name: 'Press de hombros en máquina',
    muscle: 'Hombros',
    equipment: 'Máquina',
    instruction:
      'Ajusta el asiento para que las empuñaduras queden a la altura de los hombros y empuja hacia arriba sin bloquear los codos.',
    tip: 'Mantén el abdomen firme y la espalda apoyada.',
    media: {
      frames: ['/exercises/shoulder-press/0.webp', '/exercises/shoulder-press/1.webp'],
      source: 'Leverage_Shoulder_Press',
    },
  },
  {
    id: 'dumbbell-shoulder-press',
    name: 'Press de hombros con mancuernas',
    muscle: 'Hombros',
    equipment: 'Mancuernas',
    instruction:
      'Sentado con respaldo, mancuernas a la altura de las orejas. Empuja hacia arriba hasta casi juntarlas y baja controlando.',
    tip: 'No arquees la espalda; si pasa, baja el peso.',
    media: {
      frames: ['/exercises/dumbbell-shoulder-press/0.webp', '/exercises/dumbbell-shoulder-press/1.webp'],
      source: 'Seated_Dumbbell_Press',
    },
  },
  {
    id: 'arnold-press',
    name: 'Press Arnold',
    muscle: 'Hombros',
    equipment: 'Mancuernas',
    instruction:
      'Empieza con las palmas hacia ti frente al pecho y, mientras subes, gira las muñecas hasta terminar con las palmas al frente.',
    tip: 'Hazlo lento: la rotación es la parte importante.',
    media: {
      frames: ['/exercises/arnold-press/0.webp', '/exercises/arnold-press/1.webp'],
      source: 'Arnold_Dumbbell_Press',
    },
  },
  {
    id: 'smith-shoulder-press',
    name: 'Press militar en Smith',
    muscle: 'Hombros',
    equipment: 'Smith',
    instruction:
      'Sentado bajo la barra, bájala hasta la barbilla y empuja hacia arriba. Bloquea los seguros al terminar.',
    tip: 'Coloca el banco de modo que la barra pase justo frente a la cara.',
    media: {
      frames: ['/exercises/smith-shoulder-press/0.webp', '/exercises/smith-shoulder-press/1.webp'],
      source: 'Smith_Machine_Overhead_Shoulder_Press',
    },
  },
  {
    id: 'lateral-raise',
    name: 'Elevaciones laterales',
    muscle: 'Hombros',
    equipment: 'Mancuernas',
    instruction:
      'Eleva los brazos hacia los lados hasta la altura de los hombros con los codos suaves y baja despacio.',
    tip: 'No balancees el torso para generar impulso.',
    media: {
      frames: ['/exercises/lateral-raise/0.webp', '/exercises/lateral-raise/1.webp'],
      source: 'Side_Lateral_Raise',
    },
  },
  {
    id: 'cable-lateral-raise',
    name: 'Elevación lateral en polea',
    muscle: 'Hombros',
    equipment: 'Polea',
    instruction:
      'Con la polea baja cruzada frente al cuerpo, eleva el brazo lateralmente hasta la altura del hombro.',
    tip: 'La polea mantiene tensión todo el recorrido; usa poco peso.',
    media: {
      frames: ['/exercises/cable-lateral-raise/0.webp', '/exercises/cable-lateral-raise/1.webp'],
      source: 'Standing_Low-Pulley_Deltoid_Raise',
    },
  },
  {
    id: 'front-raise',
    name: 'Elevaciones frontales',
    muscle: 'Hombros',
    equipment: 'Mancuernas',
    instruction:
      'Eleva las mancuernas al frente hasta la altura de los hombros, alternando o a la vez, y baja controlando.',
    tip: 'Codos ligeramente flexionados; no subas por encima del hombro.',
    media: {
      frames: ['/exercises/front-raise/0.webp', '/exercises/front-raise/1.webp'],
      source: 'Front_Dumbbell_Raise',
    },
  },
  {
    id: 'rear-delt-fly-db',
    name: 'Pájaros con mancuernas',
    muscle: 'Hombros',
    equipment: 'Mancuernas',
    instruction:
      'Inclinado hacia adelante con la espalda recta, abre los brazos hacia los lados apretando la parte posterior del hombro.',
    tip: 'Peso ligero y codos suaves; el movimiento es corto.',
    media: {
      frames: ['/exercises/rear-delt-fly-db/0.webp', '/exercises/rear-delt-fly-db/1.webp'],
      source: 'Reverse_Flyes',
    },
  },
  {
    id: 'reverse-machine-fly',
    name: 'Aperturas invertidas en máquina',
    muscle: 'Hombros',
    equipment: 'Máquina',
    instruction:
      'De frente al respaldo del peck deck, abre los brazos hacia atrás hasta la línea de los hombros y vuelve despacio.',
    tip: 'Imagina juntar las escápulas al final del recorrido.',
    media: {
      frames: ['/exercises/reverse-machine-fly/0.webp', '/exercises/reverse-machine-fly/1.webp'],
      source: 'Reverse_Machine_Flyes',
    },
  },
  {
    id: 'face-pull',
    name: 'Face pull',
    muscle: 'Hombros',
    equipment: 'Polea',
    instruction:
      'Con la cuerda en polea alta, tira hacia la cara separando las manos y llevando los codos atrás y arriba.',
    tip: 'Excelente para la salud del hombro; úsalo con peso moderado.',
    media: { frames: ['/exercises/face-pull/0.webp', '/exercises/face-pull/1.webp'], source: 'Face_Pull' },
  },
  {
    id: 'upright-row-cable',
    name: 'Remo al mentón en polea',
    muscle: 'Hombros',
    equipment: 'Polea',
    instruction:
      'Tira de la barra hacia la barbilla con los codos por encima de las manos y baja controlando.',
    tip: 'Si molesta el hombro, abre el agarre o sustitúyelo por elevaciones laterales.',
    media: {
      frames: ['/exercises/upright-row-cable/0.webp', '/exercises/upright-row-cable/1.webp'],
      source: 'Upright_Cable_Row',
    },
  },
  {
    id: 'shrug-db',
    name: 'Encogimientos con mancuernas',
    muscle: 'Hombros',
    equipment: 'Mancuernas',
    instruction: 'De pie con una mancuerna en cada mano, eleva los hombros hacia las orejas y baja despacio.',
    tip: 'Sube recto, sin girar los hombros.',
    media: { frames: ['/exercises/shrug-db/0.webp', '/exercises/shrug-db/1.webp'], source: 'Dumbbell_Shrug' },
  },
  {
    id: 'tricep-pushdown',
    name: 'Extensión de tríceps en polea',
    muscle: 'Tríceps',
    equipment: 'Polea',
    instruction:
      'Codos pegados al torso, extiende los antebrazos hacia abajo hasta bloquear y regresa controlando.',
    tip: 'El brazo superior se mantiene fijo.',
    media: {
      frames: ['/exercises/tricep-pushdown/0.webp', '/exercises/tricep-pushdown/1.webp'],
      source: 'Triceps_Pushdown',
    },
  },
  {
    id: 'rope-pushdown',
    name: 'Extensión de tríceps con cuerda',
    muscle: 'Tríceps',
    equipment: 'Polea',
    instruction:
      'Con la cuerda, extiende los brazos hacia abajo separando los extremos al final del recorrido.',
    tip: 'Aprieta un segundo abajo antes de volver.',
    media: {
      frames: ['/exercises/rope-pushdown/0.webp', '/exercises/rope-pushdown/1.webp'],
      source: 'Triceps_Pushdown_-_Rope_Attachment',
    },
  },
  {
    id: 'overhead-rope-extension',
    name: 'Extensión de tríceps sobre la cabeza con cuerda',
    muscle: 'Tríceps',
    equipment: 'Polea',
    instruction:
      'De espaldas a la polea, con la cuerda sobre la cabeza, extiende los brazos al frente y regresa despacio.',
    tip: 'Codos apuntando al frente, no abiertos.',
    media: {
      frames: ['/exercises/overhead-rope-extension/0.webp', '/exercises/overhead-rope-extension/1.webp'],
      source: 'Cable_Rope_Overhead_Triceps_Extension',
    },
  },
  {
    id: 'machine-triceps-extension',
    name: 'Extensión de tríceps en máquina',
    muscle: 'Tríceps',
    equipment: 'Máquina',
    instruction: 'Apoya los brazos en el soporte y extiende los codos empujando las empuñaduras hacia abajo.',
    tip: 'Ajusta el asiento para que el eje de la máquina coincida con el codo.',
    media: {
      frames: ['/exercises/machine-triceps-extension/0.webp', '/exercises/machine-triceps-extension/1.webp'],
      source: 'Machine_Triceps_Extension',
    },
  },
  {
    id: 'dip-machine',
    name: 'Fondos en máquina',
    muscle: 'Tríceps',
    equipment: 'Máquina',
    instruction:
      'Empuja las empuñaduras hacia abajo hasta extender los brazos, con el torso erguido, y vuelve con control.',
    tip: 'Hombros abajo y atrás durante todo el movimiento.',
    media: {
      frames: ['/exercises/dip-machine/0.webp', '/exercises/dip-machine/1.webp'],
      source: 'Dip_Machine',
    },
  },
  {
    id: 'bench-dips',
    name: 'Fondos en banco',
    muscle: 'Tríceps',
    equipment: 'Peso corporal',
    instruction:
      'Manos en el borde del banco, piernas al frente. Flexiona los codos hasta 90 grados y empuja hasta extender.',
    tip: 'Si duele el hombro, acorta el recorrido.',
    media: { frames: ['/exercises/bench-dips/0.webp', '/exercises/bench-dips/1.webp'], source: 'Bench_Dips' },
  },
  {
    id: 'db-overhead-extension',
    name: 'Extensión de tríceps con mancuerna',
    muscle: 'Tríceps',
    equipment: 'Mancuernas',
    instruction:
      'Sujeta una mancuerna con ambas manos sobre la cabeza, bájala por detrás flexionando los codos y extiende.',
    tip: 'Mantén los codos cerca de la cabeza.',
    media: {
      frames: ['/exercises/db-overhead-extension/0.webp', '/exercises/db-overhead-extension/1.webp'],
      source: 'Standing_Dumbbell_Triceps_Extension',
    },
  },
  {
    id: 'lying-db-extension',
    name: 'Extensión de tríceps tumbado',
    muscle: 'Tríceps',
    equipment: 'Mancuernas',
    instruction:
      'Tumbado en banco, baja las mancuernas hacia los lados de la cabeza flexionando solo los codos y extiende.',
    tip: 'Los brazos superiores quedan quietos, perpendiculares al banco.',
    media: {
      frames: ['/exercises/lying-db-extension/0.webp', '/exercises/lying-db-extension/1.webp'],
      source: 'Lying_Dumbbell_Tricep_Extension',
    },
  },
  {
    id: 'kickback',
    name: 'Patada de tríceps',
    muscle: 'Tríceps',
    equipment: 'Mancuernas',
    instruction:
      'Inclinado con el brazo superior pegado al torso, extiende el codo hacia atrás hasta bloquear y regresa.',
    tip: 'Peso ligero; el recorrido es corto y preciso.',
    media: {
      frames: ['/exercises/kickback/0.webp', '/exercises/kickback/1.webp'],
      source: 'Tricep_Dumbbell_Kickback',
    },
  },
  {
    id: 'close-grip-smith',
    name: 'Press cerrado en Smith',
    muscle: 'Tríceps',
    equipment: 'Smith',
    instruction:
      'Agarre al ancho de hombros o algo menos. Baja la barra a la parte baja del pecho con los codos cerca del cuerpo y empuja.',
    tip: 'No cierres demasiado el agarre: cansa las muñecas.',
    media: {
      frames: ['/exercises/close-grip-smith/0.webp', '/exercises/close-grip-smith/1.webp'],
      source: 'Smith_Machine_Close-Grip_Bench_Press',
    },
  },
  {
    id: 'bicep-curl',
    name: 'Curl de bíceps con mancuernas',
    muscle: 'Bíceps',
    equipment: 'Mancuernas',
    instruction:
      'Codos junto al torso, flexiona los brazos girando las palmas hacia arriba y baja completamente con control.',
    tip: 'Sin balanceo: si te mueves, el peso es excesivo.',
    media: {
      frames: ['/exercises/bicep-curl/0.webp', '/exercises/bicep-curl/1.webp'],
      source: 'Dumbbell_Bicep_Curl',
    },
  },
  {
    id: 'hammer-curl',
    name: 'Curl martillo',
    muscle: 'Bíceps',
    equipment: 'Mancuernas',
    instruction:
      'Con las palmas enfrentadas, flexiona los codos llevando las mancuernas hacia los hombros y baja despacio.',
    tip: 'Trabaja también el antebrazo; buen complemento del curl normal.',
    media: {
      frames: ['/exercises/hammer-curl/0.webp', '/exercises/hammer-curl/1.webp'],
      source: 'Hammer_Curls',
    },
  },
  {
    id: 'incline-curl',
    name: 'Curl inclinado',
    muscle: 'Bíceps',
    equipment: 'Mancuernas',
    instruction:
      'Sentado en banco inclinado con los brazos colgando, flexiona los codos sin adelantar los hombros.',
    tip: 'El estiramiento inicial es la clave; no acortes el recorrido.',
    media: {
      frames: ['/exercises/incline-curl/0.webp', '/exercises/incline-curl/1.webp'],
      source: 'Incline_Dumbbell_Curl',
    },
  },
  {
    id: 'concentration-curl',
    name: 'Curl concentrado',
    muscle: 'Bíceps',
    equipment: 'Mancuernas',
    instruction:
      'Sentado, apoya el codo en la cara interna del muslo y flexiona llevando la mancuerna al hombro.',
    tip: 'Mantén el codo fijo contra la pierna.',
    media: {
      frames: ['/exercises/concentration-curl/0.webp', '/exercises/concentration-curl/1.webp'],
      source: 'Concentration_Curls',
    },
  },
  {
    id: 'preacher-curl',
    name: 'Curl de bíceps en máquina',
    muscle: 'Bíceps',
    equipment: 'Máquina',
    instruction:
      'Ajusta el asiento y alinea los codos con el eje de la máquina. Flexiona sin despegar los brazos del apoyo.',
    tip: 'No hiperextiendas los codos al bajar.',
    media: {
      frames: ['/exercises/preacher-curl/0.webp', '/exercises/preacher-curl/1.webp'],
      source: 'Machine_Preacher_Curls',
    },
  },
  {
    id: 'machine-curl',
    name: 'Curl en máquina',
    muscle: 'Bíceps',
    equipment: 'Máquina',
    instruction:
      'Sujeta las empuñaduras con los brazos apoyados y flexiona los codos hasta arriba. Baja controlando.',
    tip: 'Aprieta arriba un segundo.',
    media: {
      frames: ['/exercises/machine-curl/0.webp', '/exercises/machine-curl/1.webp'],
      source: 'Machine_Bicep_Curl',
    },
  },
  {
    id: 'cable-curl',
    name: 'Curl en polea baja',
    muscle: 'Bíceps',
    equipment: 'Polea',
    instruction:
      'De pie frente a la polea baja, flexiona los codos llevando la barra a los hombros y baja despacio.',
    tip: 'La polea mantiene tensión también abajo; aprovéchalo.',
    media: {
      frames: ['/exercises/cable-curl/0.webp', '/exercises/cable-curl/1.webp'],
      source: 'Standing_Biceps_Cable_Curl',
    },
  },
  {
    id: 'rope-hammer-curl',
    name: 'Curl martillo con cuerda',
    muscle: 'Bíceps',
    equipment: 'Polea',
    instruction: 'Con la cuerda en polea baja, flexiona los codos con las palmas enfrentadas.',
    tip: 'Codos pegados al cuerpo todo el tiempo.',
    media: {
      frames: ['/exercises/rope-hammer-curl/0.webp', '/exercises/rope-hammer-curl/1.webp'],
      source: 'Cable_Hammer_Curls_-_Rope_Attachment',
    },
  },
  {
    id: 'reverse-curl',
    name: 'Curl inverso',
    muscle: 'Bíceps',
    equipment: 'Mancuernas',
    instruction: 'Con las palmas hacia abajo, flexiona los codos y baja controlando.',
    tip: 'Fortalece antebrazos; usa poco peso.',
    media: {
      frames: ['/exercises/reverse-curl/0.webp', '/exercises/reverse-curl/1.webp'],
      source: 'Standing_Dumbbell_Reverse_Curl',
    },
  },
  {
    id: 'zottman-curl',
    name: 'Curl Zottman',
    muscle: 'Bíceps',
    equipment: 'Mancuernas',
    instruction:
      'Sube con las palmas hacia arriba, gira las muñecas arriba y baja con las palmas hacia abajo.',
    tip: 'La bajada lenta es la parte que más trabaja.',
    media: {
      frames: ['/exercises/zottman-curl/0.webp', '/exercises/zottman-curl/1.webp'],
      source: 'Zottman_Curl',
    },
  },
  {
    id: 'leg-press',
    name: 'Prensa de piernas',
    muscle: 'Cuádriceps',
    equipment: 'Máquina',
    instruction:
      'Pies al ancho de hombros en la plataforma. Baja hasta que las rodillas formen unos 90 grados y empuja sin bloquearlas.',
    tip: 'No despegues la cadera del respaldo.',
    media: { frames: ['/exercises/leg-press/0.webp', '/exercises/leg-press/1.webp'], source: 'Leg_Press' },
  },
  {
    id: 'narrow-leg-press',
    name: 'Prensa con pies juntos',
    muscle: 'Cuádriceps',
    equipment: 'Máquina',
    instruction:
      'Igual que la prensa, con los pies juntos y en la parte baja de la plataforma para cargar más el cuádriceps.',
    tip: 'Baja solo hasta donde la zona lumbar siga pegada.',
    media: {
      frames: ['/exercises/narrow-leg-press/0.webp', '/exercises/narrow-leg-press/1.webp'],
      source: 'Narrow_Stance_Leg_Press',
    },
  },
  {
    id: 'hack-squat',
    name: 'Sentadilla hack',
    muscle: 'Cuádriceps',
    equipment: 'Máquina',
    instruction: 'Hombros bajo las almohadillas, pies al frente. Baja controlando hasta 90 grados y empuja.',
    tip: 'Rodillas alineadas con la punta de los pies.',
    media: { frames: ['/exercises/hack-squat/0.webp', '/exercises/hack-squat/1.webp'], source: 'Hack_Squat' },
  },
  {
    id: 'smith-squat',
    name: 'Sentadilla en Smith',
    muscle: 'Cuádriceps',
    equipment: 'Smith',
    instruction:
      'Barra sobre la parte alta de la espalda, pies un poco adelantados. Baja hasta donde te sientas estable y sube.',
    tip: 'Aprende los seguros y topes de la máquina antes de cargar peso.',
    media: {
      frames: ['/exercises/smith-squat/0.webp', '/exercises/smith-squat/1.webp'],
      source: 'Smith_Machine_Squat',
    },
  },
  {
    id: 'smith-split-squat',
    name: 'Zancada estática en Smith',
    muscle: 'Cuádriceps',
    equipment: 'Smith',
    instruction:
      'Un pie adelante y otro atrás bajo la barra. Baja flexionando ambas rodillas y sube empujando con la pierna delantera.',
    tip: 'El tronco se mantiene vertical.',
    media: {
      frames: ['/exercises/smith-split-squat/0.webp', '/exercises/smith-split-squat/1.webp'],
      source: 'Smith_Single-Leg_Split_Squat',
    },
  },
  {
    id: 'leg-extension',
    name: 'Extensión de piernas',
    muscle: 'Cuádriceps',
    equipment: 'Máquina',
    instruction:
      'Alinea las rodillas con el eje de la máquina y el rodillo sobre la parte baja de las tibias. Extiende de forma controlada.',
    tip: 'Sin sacudidas ni impulso.',
    media: {
      frames: ['/exercises/leg-extension/0.webp', '/exercises/leg-extension/1.webp'],
      source: 'Leg_Extensions',
    },
  },
  {
    id: 'single-leg-extension',
    name: 'Extensión de piernas a una pierna',
    muscle: 'Cuádriceps',
    equipment: 'Máquina',
    instruction: 'Igual que la extensión, con una sola pierna, para corregir diferencias entre lados.',
    tip: 'Mismo peso y repeticiones en ambas piernas.',
    media: {
      frames: ['/exercises/single-leg-extension/0.webp', '/exercises/single-leg-extension/1.webp'],
      source: 'Single-Leg_Leg_Extension',
    },
  },
  {
    id: 'dumbbell-squat',
    name: 'Sentadilla con mancuernas',
    muscle: 'Cuádriceps',
    equipment: 'Mancuernas',
    instruction:
      'Con una mancuerna en cada mano a los lados, baja flexionando rodillas y cadera hasta donde te sientas firme y sube.',
    tip: 'Pecho alto y peso en todo el pie.',
    media: {
      frames: ['/exercises/dumbbell-squat/0.webp', '/exercises/dumbbell-squat/1.webp'],
      source: 'Dumbbell_Squat',
    },
  },
  {
    id: 'bodyweight-squat',
    name: 'Sentadilla con peso corporal',
    muscle: 'Cuádriceps',
    equipment: 'Peso corporal',
    instruction: 'Pies al ancho de hombros, baja como si fueras a sentarte y sube empujando el suelo.',
    tip: 'Ideal para calentar y aprender la técnica.',
    media: {
      frames: ['/exercises/bodyweight-squat/0.webp', '/exercises/bodyweight-squat/1.webp'],
      source: 'Bodyweight_Squat',
    },
  },
  {
    id: 'lunges',
    name: 'Zancadas con mancuernas',
    muscle: 'Cuádriceps',
    equipment: 'Mancuernas',
    instruction:
      'Da un paso al frente y baja hasta que la rodilla trasera casi toque el suelo. Vuelve y alterna piernas.',
    tip: 'La rodilla delantera no sobrepasa mucho la punta del pie.',
    media: { frames: ['/exercises/lunges/0.webp', '/exercises/lunges/1.webp'], source: 'Dumbbell_Lunges' },
  },
  {
    id: 'split-squat',
    name: 'Zancada estática con mancuernas',
    muscle: 'Cuádriceps',
    equipment: 'Mancuernas',
    instruction:
      'Con un pie adelante y otro atrás, baja y sube sin mover los pies. Cambia de pierna al terminar la serie.',
    tip: 'Más estable que la zancada: buena para cargar peso.',
    media: {
      frames: ['/exercises/split-squat/0.webp', '/exercises/split-squat/1.webp'],
      source: 'Split_Squat_with_Dumbbells',
    },
  },
  {
    id: 'step-ups',
    name: 'Subidas al cajón',
    muscle: 'Cuádriceps',
    equipment: 'Mancuernas',
    instruction:
      'Sube a un banco o cajón empujando con la pierna de arriba y baja controlando. Alterna piernas.',
    tip: 'No te impulses con la pierna de abajo.',
    media: {
      frames: ['/exercises/step-ups/0.webp', '/exercises/step-ups/1.webp'],
      source: 'Dumbbell_Step_Ups',
    },
  },
  {
    id: 'leg-curl',
    name: 'Curl femoral sentado',
    muscle: 'Femoral',
    equipment: 'Máquina',
    instruction:
      'Ajusta el eje a las rodillas y el rodillo sobre los tobillos. Flexiona las rodillas hacia atrás y vuelve con control.',
    tip: 'Evita arquear la espalda para ayudar al movimiento.',
    media: {
      frames: ['/exercises/leg-curl/0.webp', '/exercises/leg-curl/1.webp'],
      source: 'Seated_Leg_Curl',
    },
  },
  {
    id: 'lying-leg-curl',
    name: 'Curl femoral tumbado',
    muscle: 'Femoral',
    equipment: 'Máquina',
    instruction:
      'Boca abajo con el rodillo sobre los tobillos, flexiona las rodillas llevando los talones a los glúteos.',
    tip: 'La cadera no se despega del banco.',
    media: {
      frames: ['/exercises/lying-leg-curl/0.webp', '/exercises/lying-leg-curl/1.webp'],
      source: 'Lying_Leg_Curls',
    },
  },
  {
    id: 'standing-leg-curl',
    name: 'Curl femoral de pie',
    muscle: 'Femoral',
    equipment: 'Máquina',
    instruction: 'Con una pierna apoyada, flexiona la otra rodilla contra el rodillo y baja despacio.',
    tip: 'Trabaja una pierna cada vez y mantén la cadera quieta.',
    media: {
      frames: ['/exercises/standing-leg-curl/0.webp', '/exercises/standing-leg-curl/1.webp'],
      source: 'Standing_Leg_Curl',
    },
  },
  {
    id: 'db-rdl',
    name: 'Peso muerto rumano con mancuernas',
    muscle: 'Femoral',
    equipment: 'Mancuernas',
    instruction:
      'Con las rodillas casi rectas, baja las mancuernas pegadas a las piernas llevando la cadera atrás y sube apretando glúteos.',
    tip: 'La espalda se mantiene recta; baja solo hasta donde no se redondee.',
    media: {
      frames: ['/exercises/db-rdl/0.webp', '/exercises/db-rdl/1.webp'],
      source: 'Stiff-Legged_Dumbbell_Deadlift',
    },
  },
  {
    id: 'smith-rdl',
    name: 'Peso muerto rumano en Smith',
    muscle: 'Femoral',
    equipment: 'Smith',
    instruction:
      'Barra frente a los muslos, baja llevando la cadera atrás con la espalda recta y sube extendiendo la cadera.',
    tip: 'Siente el estiramiento del femoral al bajar.',
    media: {
      frames: ['/exercises/smith-rdl/0.webp', '/exercises/smith-rdl/1.webp'],
      source: 'Smith_Machine_Stiff-Legged_Deadlift',
    },
  },
  {
    id: 'hip-thrust',
    name: 'Puente de glúteo (hip thrust)',
    muscle: 'Glúteos',
    equipment: 'Peso corporal',
    instruction:
      'Tumbado o con la espalda alta apoyada en un banco, empuja la cadera hacia arriba hasta alinear tronco y muslos. Baja despacio.',
    tip: 'Aprieta glúteos arriba; no exageres la extensión lumbar.',
    media: {
      frames: ['/exercises/hip-thrust/0.webp', '/exercises/hip-thrust/1.webp'],
      source: 'Butt_Lift_Bridge',
    },
  },
  {
    id: 'single-glute-bridge',
    name: 'Puente de glúteo a una pierna',
    muscle: 'Glúteos',
    equipment: 'Peso corporal',
    instruction:
      'Como el puente, con una pierna extendida en el aire. Empuja la cadera arriba con la pierna apoyada.',
    tip: 'Cadera nivelada, sin girarla.',
    media: {
      frames: ['/exercises/single-glute-bridge/0.webp', '/exercises/single-glute-bridge/1.webp'],
      source: 'Single_Leg_Glute_Bridge',
    },
  },
  {
    id: 'hip-abductor',
    name: 'Abductores en máquina',
    muscle: 'Glúteos',
    equipment: 'Máquina',
    instruction:
      'Sentado con las almohadillas en la cara externa de las rodillas, abre las piernas contra la resistencia y vuelve despacio.',
    tip: 'Inclina el torso levemente hacia adelante para activar más el glúteo.',
    media: {
      frames: ['/exercises/hip-abductor/0.webp', '/exercises/hip-abductor/1.webp'],
      source: 'Thigh_Abductor',
    },
  },
  {
    id: 'hip-adductor',
    name: 'Aductores en máquina',
    muscle: 'Glúteos',
    equipment: 'Máquina',
    instruction:
      'Sentado con las almohadillas en la cara interna de las rodillas, junta las piernas contra la resistencia.',
    tip: 'Empieza con poca apertura y aumenta según la movilidad.',
    media: {
      frames: ['/exercises/hip-adductor/0.webp', '/exercises/hip-adductor/1.webp'],
      source: 'Thigh_Adductor',
    },
  },
  {
    id: 'cable-kickback',
    name: 'Patada de glúteo en polea',
    muscle: 'Glúteos',
    equipment: 'Polea',
    instruction:
      'Con la tobillera en la polea baja, lleva la pierna hacia atrás apretando el glúteo y vuelve controlando.',
    tip: 'No arquees la zona lumbar; el movimiento sale de la cadera.',
    media: {
      frames: ['/exercises/cable-kickback/0.webp', '/exercises/cable-kickback/1.webp'],
      source: 'One-Legged_Cable_Kickback',
    },
  },
  {
    id: 'pull-through',
    name: 'Pull through en polea',
    muscle: 'Glúteos',
    equipment: 'Polea',
    instruction:
      'De espaldas a la polea baja con la cuerda entre las piernas, lleva la cadera atrás y vuelve a extenderla apretando glúteos.',
    tip: 'Es una bisagra de cadera: espalda recta y rodillas suaves.',
    media: {
      frames: ['/exercises/pull-through/0.webp', '/exercises/pull-through/1.webp'],
      source: 'Pull_Through',
    },
  },
  {
    id: 'rear-lunge',
    name: 'Zancada hacia atrás',
    muscle: 'Glúteos',
    equipment: 'Mancuernas',
    instruction:
      'Da un paso atrás y baja hasta que la rodilla trasera casi toque el suelo. Vuelve empujando con la pierna delantera.',
    tip: 'Más amable con las rodillas que la zancada al frente.',
    media: {
      frames: ['/exercises/rear-lunge/0.webp', '/exercises/rear-lunge/1.webp'],
      source: 'Dumbbell_Rear_Lunge',
    },
  },
  {
    id: 'plie-squat',
    name: 'Sentadilla sumo con mancuerna',
    muscle: 'Glúteos',
    equipment: 'Mancuernas',
    instruction:
      'Pies abiertos y puntas hacia afuera, sujeta una mancuerna entre las piernas. Baja y sube manteniendo el tronco erguido.',
    tip: 'Empuja las rodillas hacia afuera al subir.',
    media: {
      frames: ['/exercises/plie-squat/0.webp', '/exercises/plie-squat/1.webp'],
      source: 'Plie_Dumbbell_Squat',
    },
  },
  {
    id: 'calf-raise',
    name: 'Elevación de gemelos de pie',
    muscle: 'Gemelos',
    equipment: 'Máquina',
    instruction:
      'Apoya el antepié en el escalón y eleva los talones lo más alto posible; baja despacio hasta estirar.',
    tip: 'Pausa arriba y abajo; sin rebotes.',
    media: {
      frames: ['/exercises/calf-raise/0.webp', '/exercises/calf-raise/1.webp'],
      source: 'Standing_Calf_Raises',
    },
  },
  {
    id: 'seated-calf',
    name: 'Elevación de gemelos sentado',
    muscle: 'Gemelos',
    equipment: 'Máquina',
    instruction: 'Con las almohadillas sobre las rodillas, eleva los talones y baja hasta estirar el gemelo.',
    tip: 'Trabaja el sóleo; complementa la versión de pie.',
    media: {
      frames: ['/exercises/seated-calf/0.webp', '/exercises/seated-calf/1.webp'],
      source: 'Seated_Calf_Raise',
    },
  },
  {
    id: 'leg-press-calf',
    name: 'Gemelos en prensa',
    muscle: 'Gemelos',
    equipment: 'Máquina',
    instruction:
      'Con las piernas extendidas en la prensa, apoya solo el antepié y empuja la plataforma con los tobillos.',
    tip: 'No bloquees las rodillas con fuerza.',
    media: {
      frames: ['/exercises/leg-press-calf/0.webp', '/exercises/leg-press-calf/1.webp'],
      source: 'Calf_Press_On_The_Leg_Press_Machine',
    },
  },
  {
    id: 'smith-calf',
    name: 'Gemelos en Smith',
    muscle: 'Gemelos',
    equipment: 'Smith',
    instruction:
      'Con la barra sobre los hombros y el antepié en un escalón, eleva los talones y baja controlando.',
    tip: 'Un escalón bajo basta; lo importante es el recorrido completo.',
    media: {
      frames: ['/exercises/smith-calf/0.webp', '/exercises/smith-calf/1.webp'],
      source: 'Smith_Machine_Calf_Raise',
    },
  },
  {
    id: 'db-calf',
    name: 'Gemelos con mancuerna a una pierna',
    muscle: 'Gemelos',
    equipment: 'Mancuernas',
    instruction:
      'Con una mancuerna en la mano del lado que trabaja y la otra mano apoyada, eleva el talón de una pierna.',
    tip: 'Ideal para igualar fuerza entre ambos lados.',
    media: {
      frames: ['/exercises/db-calf/0.webp', '/exercises/db-calf/1.webp'],
      source: 'Standing_Dumbbell_Calf_Raise',
    },
  },
  {
    id: 'ab-crunch',
    name: 'Crunch abdominal en máquina',
    muscle: 'Abdomen',
    equipment: 'Máquina',
    instruction: 'Ajusta la máquina y acerca el tórax a la pelvis contrayendo el abdomen. Regresa despacio.',
    tip: 'No tires con los brazos ni con el cuello.',
    media: {
      frames: ['/exercises/ab-crunch/0.webp', '/exercises/ab-crunch/1.webp'],
      source: 'Ab_Crunch_Machine',
    },
  },
  {
    id: 'cable-crunch',
    name: 'Crunch en polea',
    muscle: 'Abdomen',
    equipment: 'Polea',
    instruction:
      'Arrodillado frente a la polea alta con la cuerda junto a la cabeza, flexiona el tronco llevando los codos a las rodillas.',
    tip: 'La cadera se queda quieta; se mueve la columna.',
    media: {
      frames: ['/exercises/cable-crunch/0.webp', '/exercises/cable-crunch/1.webp'],
      source: 'Cable_Crunch',
    },
  },
  {
    id: 'hanging-leg-raise',
    name: 'Elevación de piernas en silla romana',
    muscle: 'Abdomen',
    equipment: 'Peso corporal',
    instruction:
      'Apoyado en los antebrazos, eleva las rodillas (o las piernas rectas) hacia el pecho y baja controlando.',
    tip: 'Evita balancearte; si pasa, flexiona más las rodillas.',
    media: {
      frames: ['/exercises/hanging-leg-raise/0.webp', '/exercises/hanging-leg-raise/1.webp'],
      source: 'Hanging_Leg_Raise',
    },
  },
  {
    id: 'reverse-crunch',
    name: 'Crunch inverso',
    muscle: 'Abdomen',
    equipment: 'Peso corporal',
    instruction:
      'Tumbado, con las rodillas flexionadas, lleva la pelvis hacia el pecho despegando la zona lumbar y baja despacio.',
    tip: 'El movimiento es pequeño; no uses impulso.',
    media: {
      frames: ['/exercises/reverse-crunch/0.webp', '/exercises/reverse-crunch/1.webp'],
      source: 'Reverse_Crunch',
    },
  },
  {
    id: 'crunch',
    name: 'Crunch en el suelo',
    muscle: 'Abdomen',
    equipment: 'Peso corporal',
    instruction:
      'Tumbado con rodillas flexionadas, eleva los hombros del suelo contrayendo el abdomen y baja con control.',
    tip: 'Mirada al techo para no tirar del cuello.',
    media: { frames: ['/exercises/crunch/0.webp', '/exercises/crunch/1.webp'], source: 'Crunches' },
  },
  {
    id: 'bicycle-crunch',
    name: 'Bicicleta',
    muscle: 'Abdomen',
    equipment: 'Peso corporal',
    instruction:
      'Tumbado, alterna llevar el codo hacia la rodilla contraria mientras extiendes la otra pierna.',
    tip: 'Lento y controlado vale más que rápido.',
    media: {
      frames: ['/exercises/bicycle-crunch/0.webp', '/exercises/bicycle-crunch/1.webp'],
      source: 'Air_Bike',
    },
  },
  {
    id: 'russian-twist',
    name: 'Giros rusos',
    muscle: 'Abdomen',
    equipment: 'Peso corporal',
    instruction:
      'Sentado con el tronco inclinado atrás y los pies apoyados o elevados, gira el torso de un lado a otro.',
    tip: 'Gira desde el tronco, no solo los brazos.',
    media: {
      frames: ['/exercises/russian-twist/0.webp', '/exercises/russian-twist/1.webp'],
      source: 'Russian_Twist',
    },
  },
  {
    id: 'dead-bug',
    name: 'Dead bug',
    muscle: 'Abdomen',
    equipment: 'Peso corporal',
    instruction:
      'Boca arriba con brazos y piernas elevados, extiende brazo y pierna contrarios sin despegar la zona lumbar del suelo.',
    tip: 'Exhala al extender; es un ejercicio de control.',
    media: { frames: ['/exercises/dead-bug/0.webp', '/exercises/dead-bug/1.webp'], source: 'Dead_Bug' },
  },
  {
    id: 'plank',
    name: 'Plancha',
    muscle: 'Abdomen',
    equipment: 'Peso corporal',
    instruction: 'Antebrazos bajo los hombros y cuerpo alineado; respira de forma continua.',
    tip: 'Detén la serie si pierdes la posición neutra.',
    media: { frames: ['/exercises/plank/0.webp', '/exercises/plank/1.webp'], source: 'Plank' },
  },
  {
    id: 'side-plank',
    name: 'Plancha lateral',
    muscle: 'Abdomen',
    equipment: 'Peso corporal',
    instruction:
      'Apoyado en un antebrazo y el borde del pie, eleva la cadera hasta alinear el cuerpo y mantén.',
    tip: 'Si cuesta, apoya la rodilla de abajo.',
    media: {
      frames: ['/exercises/side-plank/0.webp', '/exercises/side-plank/1.webp'],
      source: 'Side_Bridge',
    },
  },
  {
    id: 'woodchop',
    name: 'Leñador en polea',
    muscle: 'Abdomen',
    equipment: 'Polea',
    instruction:
      'Con la polea alta, lleva el agarre en diagonal desde arriba hacia la cadera contraria girando el tronco.',
    tip: 'Los brazos van casi rectos; gira desde el centro.',
    media: {
      frames: ['/exercises/woodchop/0.webp', '/exercises/woodchop/1.webp'],
      source: 'Standing_Cable_Wood_Chop',
    },
  },
  {
    id: 'pallof-press',
    name: 'Press Pallof',
    muscle: 'Abdomen',
    equipment: 'Polea',
    instruction:
      'De lado a la polea, sujeta el agarre frente al pecho y extiende los brazos al frente resistiendo el giro. Vuelve y repite.',
    tip: 'Cuanto más lejos extiendas, más trabaja el abdomen.',
    media: {
      frames: ['/exercises/pallof-press/0.webp', '/exercises/pallof-press/1.webp'],
      source: 'Pallof_Press',
    },
  },
];

const Rx = (exerciseId: string, targetSets = 3, minReps = 8, maxReps = 12, restSeconds = 90) => ({
  exerciseId,
  targetSets,
  minReps,
  maxReps,
  restSeconds,
});

export const defaultRoutines: Routine[] = [
  {
    id: 'push',
    name: 'Pecho, tríceps y hombros',
    subtitle: 'Día 1 · Empuje',
    tag: 'PUSH DAY',
    exercises: [
      Rx('chest-press'),
      Rx('incline-dumbbell'),
      Rx('shoulder-press'),
      Rx('lateral-raise', 3, 12, 15, 60),
      Rx('tricep-pushdown', 3, 10, 15, 60),
    ],
  },
  {
    id: 'pull',
    name: 'Espalda y bíceps',
    subtitle: 'Día 2 · Tracción',
    tag: 'PULL DAY',
    exercises: [
      Rx('lat-pulldown'),
      Rx('seated-row'),
      Rx('one-arm-row'),
      Rx('bicep-curl'),
      Rx('preacher-curl'),
    ],
  },
  {
    id: 'rest',
    name: 'Recuperación',
    subtitle: 'Día 3 · Descanso',
    tag: 'REST DAY',
    isRest: true,
    exercises: [],
  },
  {
    id: 'legs',
    name: 'Piernas y abdominales',
    subtitle: 'Día 4 · Tren inferior',
    tag: 'LEG DAY',
    exercises: [
      Rx('leg-press'),
      Rx('smith-squat'),
      Rx('leg-curl'),
      Rx('leg-extension'),
      Rx('calf-raise', 3, 12, 20, 60),
      Rx('ab-crunch', 3, 12, 15, 60),
    ],
  },
  {
    id: 'flex',
    isFlexible: true,
    name: 'Día flexible',
    subtitle: 'Día 5 · Tú decides',
    tag: 'FLEX DAY',
    exercises: [Rx('chest-press'), Rx('seated-row'), Rx('lateral-raise'), Rx('bicep-curl')],
  },
];

export const initialData: AppData = {
  version: 1,
  profile: {
    name: 'Atleta',
    gym: 'Planet Fitness',
    goal: 'muscle',
    daysPerWeek: 4,
    bodyweightKg: null,
    weightUnit: 'kg',
  },
  routines: defaultRoutines,
  workouts: [],
  active: null,
  cycleIndex: 0,
  theme: 'dark',
  lastRestDate: null,
};

export const majorMuscles: Muscle[] = [
  'Pecho',
  'Espalda',
  'Hombros',
  'Tríceps',
  'Bíceps',
  'Cuádriceps',
  'Femoral',
  'Glúteos',
  'Gemelos',
  'Abdomen',
];
export const equipmentKinds = ['Máquina', 'Polea', 'Mancuernas', 'Smith', 'Peso corporal'] as const;

// Optional clips live in lib/exercise-videos.ts so the generated catalog above never needs editing.
for (const exercise of catalog) {
  const video = exerciseVideos[exercise.id];
  if (video && exercise.media) exercise.media.video = video;
}

const byId = new Map(catalog.map((exercise) => [exercise.id, exercise]));
export const getExercise = (id: string) => byId.get(id);
