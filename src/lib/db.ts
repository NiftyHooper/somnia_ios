import * as SQLite from 'expo-sqlite'
import { format } from 'date-fns'

const db = SQLite.openDatabaseSync('somnia.db')

export const initDB = async () => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS dreams (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS seeds (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL,
      match_percentage INTEGER,
      revealed INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `)
}

export const getTodayKey = () => format(new Date(), 'yyyy-MM-dd')

export const saveDream = async (date: string, content: string) => {
  await db.runAsync(
    `INSERT OR REPLACE INTO dreams
     (id, date, content, created_at)
     VALUES (?, ?, ?, ?)`,
    [date, date, content, new Date().toISOString()]
  )
}

export const getDreamByDate = async (date: string) => {
  return await db.getFirstAsync<{
    id: string
    date: string
    content: string
    created_at: string
  }>('SELECT * FROM dreams WHERE date = ?', [date])
}

export const getAllDreams = async () => {
  return await db.getAllAsync<{
    id: string
    date: string
    content: string
    created_at: string
  }>('SELECT * FROM dreams ORDER BY date DESC')
}

export const saveSeed = async (date: string, content: string) => {
  await db.runAsync(
    `INSERT OR REPLACE INTO seeds
     (id, date, content, revealed, created_at)
     VALUES (?, ?, ?, 0, ?)`,
    [date, date, content, new Date().toISOString()]
  )
}

export const getSeedByDate = async (date: string) => {
  return await db.getFirstAsync<{
    id: string
    date: string
    content: string
    match_percentage: number | null
    revealed: number
    created_at: string
  }>('SELECT * FROM seeds WHERE date = ?', [date])
}

export const getAllSeeds = async () => {
  return await db.getAllAsync<{
    id: string
    date: string
    content: string
    match_percentage: number | null
    revealed: number
    created_at: string
  }>('SELECT * FROM seeds ORDER BY date DESC')
}

export const revealSeed = async (date: string) => {
  await db.runAsync('UPDATE seeds SET revealed = 1 WHERE date = ?', [date])
}

export const updateSeedMatch = async (date: string, percentage: number) => {
  await db.runAsync('UPDATE seeds SET match_percentage = ? WHERE date = ?', [
    percentage,
    date,
  ])
}
