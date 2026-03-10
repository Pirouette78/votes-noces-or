import { neon } from '@neondatabase/serverless';

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL n\'est pas configurée dans les variables d\'environnement');
  }
  const sql = neon(process.env.DATABASE_URL);
  return sql;
}

export async function initDb() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS questions (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      author_name TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS votes (
      question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
      user_name TEXT,
      rating INTEGER CHECK(rating >= 1 AND rating <= 5),
      PRIMARY KEY (question_id, user_name)
    );
  `;
}
