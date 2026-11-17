// Pruebas del motor de propuestas (lib/planner.ts): recorre todas las combinaciones del cuestionario.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
Module._extensions['.ts'] = (module, filename) =>
  module._compile(
    ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      fileName: filename,
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
    }).outputText,
    filename
  );
const {
  weekPattern,
  splitsFor,
  volumeFor,
  exerciseBudget,
  excludedBy,
  buildWeek,
  estimateMinutes,
  proposals,
} = require(path.join(root, 'lib/planner.ts'));
const { catalog, initialData } = require(path.join(root, 'lib/catalog.ts'));
const { buildOwnWeek } = require(path.join(root, 'lib/own-week.ts'));
const { safeParse } = require(path.join(root, 'lib/storage.ts'));

const ids = new Set(catalog.map((exercise) => exercise.id));
let seq = 0;
const uid = () => `id-${++seq}`;
const T = true;
const F = false;
const vol = (targetSets, minReps, maxReps, restSeconds) => ({ targetSets, minReps, maxReps, restSeconds });

const tests = [];
function test(label, fn) {
  fn();
  tests.push(label);
}

test('Semana por días', () => {
  assert.deepEqual(weekPattern(2), [T, F, F, T, F, F, F]);
  assert.deepEqual(weekPattern(3), [T, F, T, F, T, F, F]);
  assert.deepEqual(weekPattern(4), [T, T, F, T, T, F, F]);
  assert.deepEqual(weekPattern(5), [T, T, T, T, T, F, F]);
  assert.deepEqual(weekPattern(6), [T, T, T, T, T, T, F]);
});
test('Repartos por días', () => {
  assert.deepEqual(splitsFor(2), ['fullbody', 'upperlower']);
  assert.deepEqual(splitsFor(3), ['fullbody', 'ppl']);
  assert.deepEqual(splitsFor(4), ['upperlower', 'pplfull']);
  assert.deepEqual(splitsFor(5), ['pplul', 'bodypart']);
  assert.deepEqual(splitsFor(6), ['ppl', 'upperlower']);
});
test('Volumen por objetivo y experiencia', () => {
  assert.deepEqual(volumeFor('muscle', 'intermediate', 'compound'), vol(3, 6, 10, 120));
  assert.deepEqual(volumeFor('muscle', 'intermediate', 'accessory'), vol(3, 8, 12, 90));
  assert.deepEqual(volumeFor('strength', 'beginner', 'compound'), vol(3, 5, 8, 120));
  assert.deepEqual(volumeFor('strength', 'intermediate', 'compound'), vol(4, 4, 6, 150));
  assert.deepEqual(volumeFor('loss', 'beginner', 'accessory'), vol(2, 12, 15, 60));
  assert.deepEqual(volumeFor('maintenance', 'intermediate', 'compound'), vol(3, 10, 15, 60));
  assert.deepEqual(volumeFor('muscle', 'advanced', 'compound'), vol(4, 6, 10, 120));
  assert.deepEqual(volumeFor('strength', 'advanced', 'compound'), vol(5, 4, 6, 150));
});
test('Presupuesto de ejercicios', () => {
  assert.equal(exerciseBudget('beginner', 60), 5);
  assert.equal(exerciseBudget('intermediate', 30), 4);
  assert.equal(exerciseBudget('intermediate', 45), 5);
  assert.equal(exerciseBudget('advanced', 75), 8);
});
test('Exclusiones por limitación', () => {
  assert.ok(excludedBy(['knees']).has('lunges'));
  assert.ok(!excludedBy(['knees']).has('leg-press'));
  assert.equal(excludedBy([]).size, 0);
  assert.ok(excludedBy(['shoulders', 'wrists']).has('pushup'));
});

const goals = ['muscle', 'strength', 'loss', 'maintenance'];
const experiences = ['beginner', 'intermediate', 'advanced'];
const kits = ['machines', 'full', 'dumbbells'];
const limitationSets = [[], ['knees'], ['shoulders'], ['lowerBack'], ['wrists']];
let combos = 0;
for (const daysPerWeek of [2, 3, 4, 5, 6])
  for (const kit of kits)
    for (const limitations of limitationSets)
      for (const goal of goals)
        for (const experience of experiences)
          for (const minutes of [30, 45, 60, 75]) {
            const input = { goal, experience, daysPerWeek, sessionMinutes: minutes, kit, limitations };
            const label = JSON.stringify(input);
            const list = proposals(input, uid);
            assert.ok(list.length >= 2 && list.length <= 3, `2–3 propuestas ${label}`);
            assert.equal(list[0].daysPerWeek, daysPerWeek, `principal con los días pedidos ${label}`);
            assert.equal(
              list.some((p) => p.daysPerWeek === daysPerWeek - 1),
              daysPerWeek > 2,
              `propuesta de un día menos ${label}`
            );
            const excluded = excludedBy(limitations);
            for (const p of list) {
              assert.equal(p.week.length, 7, `semana de 7 ${label}`);
              const pattern = weekPattern(p.daysPerWeek);
              p.week.forEach((routine, i) =>
                assert.equal(!routine.isRest, pattern[i], `descansos en su sitio ${p.split} ${label}`)
              );
              assert.ok(p.minutes >= 20 && p.minutes <= 100, `minutos ${p.minutes} ${label}`);
              for (const routine of p.week.filter((r) => !r.isRest)) {
                const exIds = routine.exercises.map((rx) => rx.exerciseId);
                assert.ok(
                  exIds.length >= 4 && exIds.length <= 8,
                  `${exIds.length} ejercicios en ${routine.name} ${label}`
                );
                assert.equal(new Set(exIds).size, exIds.length, `sin repetidos en ${routine.name} ${label}`);
                for (const id of exIds) {
                  assert.ok(ids.has(id), `id ${id} existe`);
                  assert.ok(!excluded.has(id), `${id} excluido por ${limitations} en ${routine.name}`);
                }
                // Los minutos elegidos mandan: la estimación nunca supera los minutos pedidos en más de 10.
                const est = estimateMinutes(routine);
                assert.ok(
                  est <= minutes + 10,
                  `${est} min con ${routine.exercises.length} ejercicios para ${minutes} min en ${routine.name} ${label}`
                );
                assert.ok(
                  routine.exercises.every((rx) => rx.targetSets >= 2),
                  `mínimo 2 series ${label}`
                );
                // Con 75 min no hay recorte de volumen: cada día tiene un básico con su volumen; si la plantilla se
                // quedó sin básicos, el primero lleva una serie más.
                const pick = ({ targetSets, minReps, maxReps, restSeconds }) => ({
                  targetSets,
                  minReps,
                  maxReps,
                  restSeconds,
                });
                const compound = volumeFor(goal, experience, 'compound');
                const accessory = volumeFor(goal, experience, 'accessory');
                const hasCompound = routine.exercises.some(
                  (rx) => JSON.stringify(pick(rx)) === JSON.stringify(compound)
                );
                const first = pick(routine.exercises[0]);
                if (minutes === 75)
                  assert.ok(
                    hasCompound ||
                      JSON.stringify(first) ===
                        JSON.stringify({ ...accessory, targetSets: accessory.targetSets + 1 }),
                    `volumen del primer ejercicio en ${routine.name} ${label}: ${JSON.stringify(first)}`
                  );
              }
            }
            combos++;
          }
tests.push(`${combos} combinaciones del cuestionario`);

test('Torso A y Torso B difieren', () => {
  const week = buildWeek(
    'upperlower',
    {
      goal: 'muscle',
      experience: 'intermediate',
      daysPerWeek: 4,
      sessionMinutes: 60,
      kit: 'machines',
      limitations: [],
    },
    uid
  );
  assert.deepEqual(
    week.map((r) => r.name),
    ['Torso A', 'Pierna A', 'Descanso', 'Torso B', 'Pierna B', 'Descanso', 'Descanso']
  );
  const a = week[0].exercises.map((rx) => rx.exerciseId);
  const b = week[3].exercises.map((rx) => rx.exerciseId);
  assert.ok(
    a.some((id) => !b.includes(id)),
    'A y B varían'
  );
  assert.equal(week[2].tag, 'REST DAY');
});
test('Rodillas + mancuernas: sin sentadilla y el día sigue completo', () => {
  const week = buildWeek(
    'fullbody',
    {
      goal: 'muscle',
      experience: 'intermediate',
      daysPerWeek: 2,
      sessionMinutes: 60,
      kit: 'dumbbells',
      limitations: ['knees'],
    },
    uid
  );
  const day = week[0].exercises.map((rx) => rx.exerciseId);
  for (const id of ['dumbbell-squat', 'bodyweight-squat', 'plie-squat', 'lunges', 'split-squat'])
    assert.ok(!day.includes(id));
  assert.ok(day.length >= 4, `${day.length} ejercicios`);
});
test('Minutos estimados crecen con el volumen', () => {
  const light = buildWeek(
    'fullbody',
    {
      goal: 'loss',
      experience: 'beginner',
      daysPerWeek: 2,
      sessionMinutes: 30,
      kit: 'machines',
      limitations: [],
    },
    uid
  )[0];
  const heavy = buildWeek(
    'ppl',
    {
      goal: 'strength',
      experience: 'advanced',
      daysPerWeek: 6,
      sessionMinutes: 75,
      kit: 'full',
      limitations: [],
    },
    uid
  )[0];
  assert.ok(estimateMinutes(light) < estimateMinutes(heavy));
});

test('buildOwnWeek: diez músculos siguen cabiendo en el subtítulo y pasan safeParse', () => {
  const muscles = [
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
  const list = [
    { name: 'Todo', muscles, exerciseIds: ['chest-press', 'lat-pulldown'] },
    { name: '', muscles: [], exerciseIds: [] },
  ];
  const week = buildOwnWeek(2, list, 'muscle', 'intermediate', uid);
  assert.equal(week.length, 7);
  assert.equal(week.filter((r) => !r.isRest).length, 2);
  const all = week.find((r) => r.name === 'Todo');
  assert.ok(all.subtitle.length <= 90, all.subtitle);
  assert.ok(all.subtitle.includes('+'), all.subtitle);
  assert.equal(week.filter((r) => !r.isRest)[1].name, 'Día 2');
  const parsed = safeParse(JSON.stringify({ ...initialData, routines: week, setup: 'done' }));
  assert.ok(parsed, 'safeParse acepta la semana del asistente');
  assert.equal(parsed.routines.length, 7);
});
console.log(`OK: ${tests.length} pruebas del planificador`);
