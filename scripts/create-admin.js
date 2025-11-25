const mysql = require('mysql2/promise');
const crypto = require('crypto');

// 비밀번호 해시 함수 (encryption.ts와 동일)
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return salt + ':' + hash;
}

async function createAdmin() {
  let connection;
  
  try {
    // 먼저 데이터베이스 없이 연결해서 데이터베이스 목록 확인
    console.log('서버에 연결 중...');
    const tempConnection = await mysql.createConnection({
      host: 'monsilserver.iptime.org',
      port: 3306,
      user: 'min',
      password: 'f8tgw3lshms!',
      connectTimeout: 10000
    });
    
    // 데이터베이스 목록 확인
    const [databases] = await tempConnection.execute('SHOW DATABASES');
    console.log('사용 가능한 데이터베이스:', databases.map(db => Object.values(db)[0]));
    
    await tempConnection.end();
    
    // 이제 데이터베이스에 연결
    console.log('데이터베이스에 연결 중...');
    connection = await mysql.createConnection({
      host: 'monsilserver.iptime.org',
      port: 3306,
      user: 'min',
      password: 'f8tgw3lshms!',
      database: 'ejdc_wedding',
      connectTimeout: 10000
    });

    const username = 'admin';
    const password = 'ehcksdmswls123';
    
    // 기존 사용자 확인
    const [existingRows] = await connection.execute(
      'SELECT id FROM admin WHERE username = ?',
      [username]
    );
    
    if (existingRows.length > 0) {
      console.log('이미 존재하는 사용자명입니다. 기존 계정을 업데이트합니다.');
      const hashedPassword = hashPassword(password);
      await connection.execute(
        'UPDATE admin SET password = ? WHERE username = ?',
        [hashedPassword, username]
      );
      console.log('✅ 관리자 계정 비밀번호가 업데이트되었습니다.');
    } else {
      // 비밀번호 해시화
      const hashedPassword = hashPassword(password);
      
      // 관리자 계정 생성
      const [result] = await connection.execute(
        'INSERT INTO admin (username, password) VALUES (?, ?)',
        [username, hashedPassword]
      );
      
      console.log('✅ 관리자 계정이 생성되었습니다.');
      console.log('   사용자명:', username);
      console.log('   ID:', result.insertId);
    }
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createAdmin();

