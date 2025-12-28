import mysql from 'mysql2/promise'

// 환경 설정
const isLocal = process.env.NODE_ENV === 'development' || process.env.LOCAL_DB === 'true'

// 환경변수 우선 사용 (없을 경우 기존 기본값)
const host = process.env.DB_HOST || (isLocal ? 'localhost' : '192.168.0.19')
const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306
const user = process.env.DB_USER || (isLocal ? 'root' : 'min')
const password = process.env.DB_PASSWORD || (isLocal ? '' : 'f8tgw3lshms!')
const database = process.env.DB_NAME || 'ejdc_wedding'

const pool = mysql.createPool({
  host,
  port,
  user,
  password,
  database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000, // 10초 연결 타임아웃
  acquireTimeout: 10000, // 10초 획득 타임아웃
  timeout: 10000, // 10초 쿼리 타임아웃
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
})

export default pool