/** Storage keys written by builds from before the rename. Only this file may mention them. */
const OLD_PREFIX = 'vilvad2c.';
const NEW_PREFIX = 'devduo.';

/**
 * One-time move of saved data (cart, orders, edits, theme, tour flag) from the old key prefix to the
 * new one, so nobody loses their demo state after the rename. A value already stored under the new
 * key wins. Old keys are always removed, so they stop using up the browser's storage quota.
 * Never throws: blocked or full storage just means there is nothing to move.
 */
export function migrateOldKeys(storage: Pick<Storage, 'length' | 'key' | 'getItem' | 'setItem' | 'removeItem'> = window.localStorage): number {
  let moved = 0;
  try {
    const old: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (k?.startsWith(OLD_PREFIX)) old.push(k);
    }
    for (const key of old) {
      const next = NEW_PREFIX + key.slice(OLD_PREFIX.length);
      const value = storage.getItem(key);
      if (value !== null && storage.getItem(next) === null) {
        try {
          storage.setItem(next, value);
          moved++;
        } catch {
          /* no room for the copy: drop the old value so it stops taking space */
        }
      }
      storage.removeItem(key);
    }
  } catch {
    /* storage blocked */
  }
  return moved;
}
