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
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // 연결이 끊어졌을 때 자동으로 재연결 시도
  // mysql2는 기본적으로 자동 재연결을 지원하지 않으므로 모니터링으로 처리
})

// 기존 pool export
export default pool

// 연결 풀 상태 모니터링 (5분마다 체크하여 연결이 살아있는지 확인)
// 연결이 끊어졌을 경우 로그만 남기고, mysql2가 자동으로 재연결을 시도함
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
  setInterval(async () => {
    try {
      const connection = await pool.getConnection()
      await connection.ping() // 연결이 살아있는지 확인
      connection.release()
      console.log('[DB] Connection pool is healthy')
    } catch (error) {
      console.error('[DB] Connection pool error:', error)
      // mysql2는 연결이 끊어지면 자동으로 재연결을 시도함
      // 여기서는 로그만 남기고 모니터링
    }
  }, 5 * 60 * 1000) // 5분마다 체크
}
