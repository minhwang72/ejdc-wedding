# 보안 및 운영 가이드라인

## ⚠️ 운영 서버에서 절대 금지된 작업

### 1. 프로세스 종료 명령 금지
다음 명령어들은 **절대 사용하지 마세요**:
- `pkill`
- `killall`
- `kill -9`
- `systemctl stop/restart` (서비스 관리 명령)

### 2. 시스템 명령 실행 금지
서버 사이드 코드에서 다음을 사용하지 마세요:
- `child_process.exec()`
- `child_process.spawn()`
- `child_process.execSync()`
- `execa` 패키지

### 3. 이미지 처리 시 주의사항
- `sharp`는 안전하게 사용 가능
- `canvas`, `puppeteer`, `ffmpeg` 사용 시 cleanup 로직에서 프로세스 종료 명령 사용 금지

## 🔍 문제 진단

만약 다음 에러가 발생한다면:
```
⨯ [Error: Command failed: pkill -f /tmp/.X11-unix;pkill javap]
signal: 'SIGTERM'
```

1. 의존성 패키지 확인: `yarn why <package-name>`
2. node_modules 내 postinstall 스크립트 확인
3. 서버 환경의 cron job 또는 systemd 서비스 확인

## ✅ 안전한 대안

### 파일 삭제
```typescript
// ✅ 안전한 방법
import { unlink } from 'fs/promises'
await unlink(filePath)

// ❌ 위험한 방법
import { exec } from 'child_process'
exec(`rm -f ${filePath}`) // 절대 사용 금지
```

### 프로세스 관리
운영 서버에서는 프로세스를 직접 종료하지 마세요.
Docker 컨테이너 관리는 `docker stop/restart` 명령으로만 수행하세요.

