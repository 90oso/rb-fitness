import assert from 'node:assert/strict';
import {
  addCycleDay,
  appendCycleDays,
  defaultCycleDay,
  duplicateCycleDay,
  moveCycleDay,
  removeCycleDay,
} from '../lib/cycles.ts';
const workout = (id) => ({
  id,
  name: id,
  subtitle: 'Personalizada',
  tag: 'TRAIN',
  exercises: [{ exerciseId: 'chest-press', targetSets: 3, minReps: 8, maxReps: 12, restSeconds: 90 }],
});
const data = {
  version: 1,
  profile: { daysPerWeek: 3 },
  routines: [workout('push'), workout('legs'), workout('pull')],
  cycleIndex: 1,
  active: null,
  workouts: [],
};
const tests = [];
function test(label, fn) {
  fn();
  tests.push(label);
}
test('Create custom training day', () => {
  const o = addCycleDay(data, workout('self'));
  assert.equal(o.routines.length, 4);
  assert.equal(o.routines[3].id, 'self');
});
test('Create rest day', () => {
  const r = defaultCycleDay('my-rest', true);
  assert.equal(r.isRest, true);
  assert.equal(r.exercises.length, 0);
});
test('Preserve next cycle after add', () =>
  assert.equal(
    addCycleDay(data, workout('new')).routines[addCycleDay(data, workout('new')).cycleIndex].id,
    'legs'
  ));
test('Move cycle day up', () => {
  const o = moveCycleDay(data, 'pull', -1);
  assert.deepEqual(
    o.routines.map((r) => r.id),
    ['push', 'pull', 'legs']
  );
  assert.equal(o.routines[o.cycleIndex].id, 'legs');
});
test('Move cycle day down', () => {
  const o = moveCycleDay(data, 'push', 1);
  assert.equal(o.routines[o.cycleIndex].id, 'legs');
});
test('Ignore out-of-bounds move', () => assert.deepEqual(moveCycleDay(data, 'push', -1), data));
test('Duplicate day without sharing exercises', () => {
  const o = duplicateCycleDay(data, 'push', 'push2');
  assert.equal(o.routines[3].exercises[0].exerciseId, 'chest-press');
  assert.notEqual(o.routines[3].exercises[0], o.routines[0].exercises[0]);
});
test('Remove day preserves next', () => {
  const o = removeCycleDay(data, 'push');
  assert.equal(o.routines[o.cycleIndex].id, 'legs');
});
test('Removing current day moves to valid index', () => {
  const o = removeCycleDay(data, 'legs');
  assert.ok(o.cycleIndex < o.routines.length);
});
test('Removing the final day leaves an empty cycle', () => {
  const o = removeCycleDay({ ...data, routines: [workout('x')], cycleIndex: 0 }, 'x');
  assert.deepEqual(o.routines, []);
  assert.equal(o.cycleIndex, 0);
});
test('Cannot remove active session day', () =>
  assert.throws(() => removeCycleDay({ ...data, active: { routineId: 'push' } }, 'push')));
test('Refuse duplicate ID', () => assert.throws(() => addCycleDay(data, workout('push'))));
test('Enforce 40-day maximum', () =>
  assert.throws(() =>
    addCycleDay(
      { ...data, routines: Array.from({ length: 40 }, (_, i) => workout('id' + i)) },
      workout('extra')
    )
  ));
test('appendCycleDays keeps the next day and adds all when they fit', () => {
  const o = appendCycleDays(data, [workout('a'), workout('b')]);
  assert.equal(o.added, 2);
  assert.equal(o.dropped, 0);
  assert.equal(o.data.routines.length, 5);
  assert.equal(o.data.routines[o.data.cycleIndex].id, 'legs');
});
test('appendCycleDays stops at 40 and reports the dropped days', () => {
  const full = { ...data, routines: Array.from({ length: 35 }, (_, i) => workout('id' + i)), cycleIndex: 3 };
  const o = appendCycleDays(
    full,
    Array.from({ length: 7 }, (_, i) => workout('n' + i))
  );
  assert.equal(o.added, 5);
  assert.equal(o.dropped, 2);
  assert.equal(o.data.routines.length, 40);
  assert.equal(o.data.cycleIndex, 3);
});
test('appendCycleDays refuses duplicate ids', () =>
  assert.throws(() => appendCycleDays(data, [workout('push')])));
console.log(`OK: ${tests.length} pruebas de ciclos`);
