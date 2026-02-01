// lib/db.ts
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Setting ssl to undefined or false allows the connection string 
    // parameter (?sslmode=disable) to take control.
    ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false
});

export const query = (text: string, params?: any[]) => pool.query(text, params);