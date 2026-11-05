import { readFileSync, readdirSync } from 'node:fs';
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import type { Database, Statement } from '../../workers/signups/src/types.ts';

// Only D1's async shape is adapted; real SQLite runs the migration and queries.
export class SQLite implements Database {
  sql = new DatabaseSync(':memory:');
  constructor() {
    for (const name of readdirSync('workers/signups/migrations').filter(name => name.endsWith('.sql')).sort()) {
      this.sql.exec(readFileSync(`workers/signups/migrations/${name}`, 'utf8'));
    }
  }
  prepare(query: string): Statement {
    let values: SQLInputValue[] = [];
    const statement: Statement = {
      bind(...input) { values = input as SQLInputValue[]; return statement; },
      first: async <T>() => this.sql.prepare(query).get(...values) as T ?? null,
      all: async <T>() => ({ results: this.sql.prepare(query).all(...values) as T[] }),
      run: async () => this.sql.prepare(query).run(...values),
    };
    return statement;
  }
  async batch(statements: Statement[]) {
    this.sql.exec('BEGIN');
    try { const result = []; for (const statement of statements) result.push(await statement.run()); this.sql.exec('COMMIT'); return result; }
    catch (error) { this.sql.exec('ROLLBACK'); throw error; }
  }
  count(table: string): number { return Number(this.sql.prepare(`SELECT count(*) AS n FROM ${table}`).get()!.n); }
}