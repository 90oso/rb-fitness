// Integration smoke test for pure data/calculation modules (requires `npm install`).
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
const { initialData } = require(path.join(root, 'lib/catalog.ts'));
const {
  weekMetrics,
  muscleSets,
  totalVolume,
  suggestions,
  bestEstimatedOneRepMax,
  progressionAdvice,
  weekWorkouts,
} = require(path.join(root, 'lib/metrics.ts'));
const { safeParse } = require(path.join(root, 'lib/storage.ts'));
let data = structuredClone(initialData);
const now = new Date();
const set = (id, weight, reps) => ({
  id: `s-${id}`,
  exerciseId: id,
  weight,
  reps,
  performedAt: now.toISOString(),
});
const workout = {
  id: 'w1',
  routineId: 'push',
  routineName: 'Pecho',
  startedAt: new Date(now.getTime() - 40 * 60000).toISOString(),
  endedAt: now.toISOString(),
  sets: [set('chest-press', 40, 10), set('chest-press', 40, 10), set('tricep-pushdown', 20, 12)],
};
data.workouts = [workout];
assert.equal(weekMetrics(data).sessions, 1);
assert.equal(weekMetrics(data).sets, 3);
assert.equal(weekMetrics(data).minutes, 40);
assert.equal(totalVolume(data.workouts), 1040);
assert.equal(muscleSets(data.workouts).Pecho, 2);
assert.equal(muscleSets(data.workouts).Tríceps, 1);
assert.ok(bestEstimatedOneRepMax(data.workouts, 'chest-press') > 50);
assert.equal(suggestions(data).length, 3);
const copy = safeParse(JSON.stringify(data));
assert.equal(copy.workouts.length, 1);
assert.equal(copy.active, null);
assert.throws(() => safeParse('{}'));
assert.throws(() =>
  safeParse(JSON.stringify({ ...data, workouts: [{ ...workout, sets: [{ ...workout.sets[0], reps: -3 }] }] }))
);
assert.throws(() => safeParse(JSON.stringify({ ...data, profile: { ...data.profile, daysPerWeek: 20 } })));
assert.throws(() =>
  safeParse(
    JSON.stringify({
      ...data,
      routines: [{ ...data.routines[0], exercises: [{ ...data.routines[0].exercises[0], targetSets: 0 }] }],
    })
  )
);
const more = structuredClone(workout);
more.sets = [set('chest-press', 40, 12), set('chest-press', 40, 12), set('chest-press', 40, 12)];
const advice = progressionAdvice([more], 'chest-press', 3, 12);
assert.equal(advice?.kind, 'increase');
assert.ok(advice.proposedWeightKg > 40 && advice.proposedWeightKg < 43);
assert.equal(progressionAdvice([workout], 'chest-press', 3, 12)?.kind, 'repeat');
assert.equal(progressionAdvice([], 'chest-press', 3, 12), null);
const future = { ...workout, endedAt: new Date(now.getTime() + 86400000 * 21).toISOString() };
assert.equal(weekWorkouts([future, workout]).length, 1);
const emptyName = structuredClone(data);
emptyName.profile.name = '';
assert.equal(safeParse(JSON.stringify(emptyName)).profile.name, '');
console.log('RB metrics & storage: 19 checks OK');
