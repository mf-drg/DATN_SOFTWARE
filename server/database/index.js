import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import * as schema from '../entities/index.js'

const connection = mysql.createPool({
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  password: process.env.DB_PASSWORD,
  user: process.env.DB_USER,
})
const db = drizzle(connection, {
  schema,
  mode: 'default',
  logger: true,
})
export { db }
