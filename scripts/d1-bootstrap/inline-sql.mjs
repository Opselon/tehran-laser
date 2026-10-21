/**
 * Build step for the one-off D1 bootstrap runner (see workflow db-bootstrap.yml).
 *
 * Wrangler text-module rules do not reach files outside the Worker's directory,
 * so the migration is inlined into a normal JS module at deploy time instead of
 * being imported as SQL. Output is gitignored.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(here, '../../migrations/0012_operators.sql'), 'utf8');
const out = join(here, 'migration.mjs');

writeFileSync(out, `export default ${JSON.stringify(sql)};\n`);
console.log(`inlined ${sql.length} chars of SQL into ${out}`);
