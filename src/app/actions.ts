'use server'

import { getDb, initDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export interface Question {
  id: number;
  text: string;
  author_name: string;
  created_at: string;
  average_rating: number;
  voters: string | null;
}

export async function initializeDatabase() {
  try {
    await initDb();
    return true;
  } catch (error) {
    console.error("Database initialization failed:", error);
    return false;
  }
}

export async function getQuestions(): Promise<Question[]> {
  const sql = getDb();
  
  // Create tables if they don't exist yet
  await initializeDatabase();
  
  const questions = await sql`
    SELECT 
      q.id,
      q.text,
      q.author_name,
      q.created_at,
      COALESCE(AVG(v.rating), 0)::float as average_rating,
      STRING_AGG(v.user_name || ':' || v.rating, ',') as voters
    FROM questions q
    LEFT JOIN votes v ON q.id = v.question_id
    GROUP BY q.id
    ORDER BY q.id ASC
  `;
  
  return questions as unknown as Question[];
}

export async function addQuestion(text: string, authorName: string) {
  if (!text || !authorName) throw new Error("Texte ou auteur manquant");
  const sql = getDb();
  await sql`
    INSERT INTO questions (text, author_name) 
    VALUES (${text}, ${authorName})
  `;
  revalidatePath('/');
}

export async function voteQuestion(questionId: number, userName: string, rating: number) {
  if (!userName || rating < 1 || rating > 5) throw new Error("Paramètres invalides");
  const sql = getDb();
  
  await sql`
    INSERT INTO votes (question_id, user_name, rating)
    VALUES (${questionId}, ${userName}, ${rating})
    ON CONFLICT (question_id, user_name) DO UPDATE SET rating = EXCLUDED.rating
  `;
  revalidatePath('/');
}
