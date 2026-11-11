// Pruebas de las reglas puras de la sesión activa (lib/session.ts). Node, sin React.
// Igual que check-metrics.cjs: los .ts se transpilan al vuelo porque lib/session importa lib/metrics
// sin extensión, cosa que `--experimental-strip-types` no resuelve.
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
  REST_KEY,
  adjustRest,
  exerciseProgress,
  nextPendingExercise,
  parseRestRecord,
  raiseCount,
  sessionDiffersFromRoutine,
  sessionExercises,
} = require(path.join(root, 'lib/session.ts'));

const rx = (id, rest = 90, target = 3) => ({
  exerciseId: id,
  targetSets: target,
  minReps: 8,
  maxReps: 12,
  restSeconds: rest,
});
let n = 0;
const set = (id, reps = 12, weight = 20) => ({
  id: `${id}-${++n}`,
  exerciseId: id,
  reps,
  weight,
  performedAt: '2026-11-11T10:00:00.000Z',
});
const sets = (...specs) => specs.flatMap(([id, count]) => Array.from({ length: count }, () => set(id)));
const routine = { id: 'push', name: 'Push', subtitle: '', tag: 'PUSH', exercises: [rx('a'), rx('b')] };

const tests = [];
function test(label, fn) {
  fn();
  tests.push(label);
}

// sessionExercises
test('La sesión usa su copia de ejercicios cuando existe', () =>
  assert.deepEqual(sessionExercises({ exercises: [rx('z')] }, routine), [rx('z')]));
test('Sin copia (sesión de 0.8.x) usa la rutina', () =>
  assert.deepEqual(sessionExercises({}, routine), routine.exercises));
test('Sin copia ni rutina devuelve lista vacía', () => assert.deepEqual(sessionExercises({}, undefined), []));

// exerciseProgress
test('Progreso 2 de 3 no está completo', () =>
  assert.deepEqual(exerciseProgress(sets(['a', 2]), rx('a')), { done: 2, target: 3, complete: false }));
test('Series extra siguen contando como completo', () =>
  assert.deepEqual(exerciseProgress(sets(['a', 4], ['b', 1]), rx('a')), {
    done: 4,
    target: 3,
    complete: true,
  }));

// nextPendingExercise
const three = [rx('a'), rx('b'), rx('c')];
test('Siguiente pendiente en orden', () =>
  assert.equal(nextPendingExercise(three, sets(['a', 3]), 'a'), 'b'));
test('Salta los completados', () =>
  assert.equal(nextPendingExercise(three, sets(['a', 3], ['b', 3]), 'a'), 'c'));
test('Sin pendientes devuelve null', () =>
  assert.equal(nextPendingExercise(three, sets(['a', 3], ['b', 3], ['c', 3]), 'b'), null));
test('Vuelve al principio cuando los de después están completos', () =>
  assert.equal(nextPendingExercise(three, sets(['b', 3], ['c', 3]), 'b'), 'a'));
test('Actual ausente: primer pendiente desde el inicio', () =>
  assert.equal(nextPendingExercise(three, sets(['a', 3]), 'zzz'), 'b'));

// adjustRest
test('+15 s solo cambia ese ejercicio', () =>
  assert.deepEqual(adjustRest([rx('a'), rx('b')], 'a', 15), [rx('a', 105), rx('b')]));
test('No baja de 0 s', () => assert.equal(adjustRest([rx('a')], 'a', -120)[0].restSeconds, 0));
test('No pasa de 1800 s', () => assert.equal(adjustRest([rx('a')], 'a', 2000)[0].restSeconds, 1800));
test('adjustRest no muta la entrada', () => {
  const input = [rx('a')];
  adjustRest(input, 'a', 15);
  assert.equal(input[0].restSeconds, 90);
});

// sessionDiffersFromRoutine
const base = [rx('a'), rx('b')];
test('Igual que la rutina: sin cambios', () => assert.equal(sessionDiffersFromRoutine(base, base), false));
test('Otro orden cuenta como cambio', () =>
  assert.equal(sessionDiffersFromRoutine([rx('b'), rx('a')], base), true));
test('Sustituido cuenta como cambio', () =>
  assert.equal(sessionDiffersFromRoutine([rx('a'), rx('z')], base), true));
test('Descanso distinto cuenta como cambio', () =>
  assert.equal(sessionDiffersFromRoutine([rx('a', 105), rx('b')], base), true));
test('Uno añadido cuenta como cambio', () =>
  assert.equal(sessionDiffersFromRoutine([...base, rx('c')], base), true));
test('Uno quitado cuenta como cambio', () => assert.equal(sessionDiffersFromRoutine([rx('a')], base), true));
test('Rutina ausente: nunca hay cambios que guardar', () =>
  assert.equal(sessionDiffersFromRoutine(base, undefined), false));

// raiseCount
const workouts = [
  {
    id: 'w1',
    routineId: 'push',
    routineName: 'Push',
    startedAt: '2026-11-10T10:00:00.000Z',
    endedAt: '2026-11-10T11:00:00.000Z',
    sets: [...sets(['a', 3]), set('b', 12), set('b', 10)],
  },
];
test('Cuenta los ejercicios donde toca subir de peso', () =>
  assert.equal(raiseCount(workouts, [rx('a'), rx('b')]), 1));
test('Sin historial no toca subir en ninguno', () => assert.equal(raiseCount([], [rx('a')]), 0));

// parseRestRecord
const record = JSON.stringify({ activeId: 's1', exerciseId: 'a', endsAt: 2000 });
test('Registro de descanso válido se restaura', () =>
  assert.deepEqual(parseRestRecord(record, 's1', 1000), { activeId: 's1', exerciseId: 'a', endsAt: 2000 }));
test('Sin registro → null', () => assert.equal(parseRestRecord(null, 's1', 1000), null));
test('JSON inválido → null', () => assert.equal(parseRestRecord('{nope', 's1', 1000), null));
test('Registro de otra sesión → null', () => assert.equal(parseRestRecord(record, 's2', 1000), null));
test('Descanso ya vencido → null', () => assert.equal(parseRestRecord(record, 's1', 2000), null));
test('La clave de almacenamiento es rb-rest', () => assert.equal(REST_KEY, 'rb-rest'));

console.log(`OK: ${tests.length} pruebas de sesión`);
