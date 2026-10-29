import { migrateOldKeys } from './lib/migrate';

// Imported first in main.tsx. Zustand stores read their saved data the moment their modules load,
// so the old keys have to be moved before any store module is evaluated.
migrateOldKeys();
