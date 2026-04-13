import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const dbHost = process.env.DB_HOST || '127.0.0.1';
  const dbPort = process.env.DB_PORT || '5432';
  const dbName = process.env.DB_NAME || '(not set)';
  const dbUser = process.env.DB_USER || '(not set)';

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() AS now, current_database() AS db, inet_server_addr() AS server_ip, inet_server_port() AS server_port');
    client.release();

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      details: {
        host: dbHost,
        port: dbPort,
        database: dbName,
        user: dbUser,
        serverTime: result.rows[0].now,
        serverDb: result.rows[0].db,
        serverIp: result.rows[0].server_ip,
        serverPort: result.rows[0].server_port,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      details: {
        host: dbHost,
        port: dbPort,
        database: dbName,
        user: dbUser,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
