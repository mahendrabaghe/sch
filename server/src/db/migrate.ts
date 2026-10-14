import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
try {
  const schema = await readFile(resolve('src/db/schema.sql'), 'utf8')
  await pool.query(schema)
  console.log('Database schema applied.')
} finally {
  await pool.end()
}
