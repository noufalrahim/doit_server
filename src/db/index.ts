import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

// Create a PostgreSQL pool instance with your connection string
const pool = new Pool({
    connectionString: 'postgresql://postgres:noufalrahim@db:5432/doitdb',
});

// Initialize Drizzle ORM with the pool
export const db = drizzle(pool);

// Function to check the PostgreSQL connection
// export async function checkConnection() {
//     try {
//         const res = await pool.query('SELECT NOW()');
//         console.log('Connected to PostgreSQL successfully!');
        
//     } catch (err) {
//         if (err instanceof Error) {
//             console.error('Error connecting to PostgreSQL:', err.message);  // Log the actual error message
//         } else {
//             console.error('Error connecting to PostgreSQL:', err);  // Log the error if it's not an instance of Error
//         }
//     } finally {
//         await pool.end();
//     }
// }

