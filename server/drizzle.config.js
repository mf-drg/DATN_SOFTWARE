import 'dotenv/config';
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './entities/index.js',
  out: './migration',
  dialect: 'mysql',
  driver: 'mysql2',
  breakpoints: true,
  dbCredentials: {
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    password: process.env.DB_PASSWORD,
    user: process.env.DB_USER,
  },
})
