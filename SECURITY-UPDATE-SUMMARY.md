# 보안 업데이트 및 재배포 요약

## 완료된 작업

### 1. 프로젝트별 보안 강화

#### ejdc-wedding ✅
- Next.js: 15.3.3 → 15.5.9 (RCE 취약점 패치)
- Multer: 2.0.1 → 2.0.2 (DoS 취약점 패치)
- 파일 업로드 보안 강화:
  - 파일 확장자 검증
  - MIME 타입 검증
  - 경로 traversal 공격 방지
  - 파일명 sanitization
- 재배포 완료

#### kevieun-wedding ✅
- Next.js: 15.3.3 → 15.5.9
- Multer: 2.0.1 → 2.0.2
- 파일 업로드 보안 강화 (동일)
- 재배포 완료

#### monsil-wedding ✅
- Next.js: 15.3.3 → 15.5.9
- Multer: 2.0.1 → 2.0.2
- 파일 업로드 보안 강화 (동일)
- 재배포 완료

#### portfolio ✅
- Next.js: 15.3.1 → 15.5.9
- 재배포 완료

### 2. 서버 모니터링 스크립트

**파일 위치**: `/home/min/check-malware.sh`
**로그 파일**: `/home/min/malware-check.log`

**기능**:
- 악성 프로세스 감지 (vmlunix, VM-unix 등)
- 의심스러운 파일/디렉토리 검사
- Docker 컨테이너 내부 검사
- CPU 사용률 모니터링
- 자동 로그 기록

**설정 방법**:
```bash
# Crontab에 추가 (5분마다 실행)
crontab -e
# 다음 줄 추가:
*/5 * * * * /home/min/check-malware.sh
```

**수동 실행**:
```bash
bash /home/min/check-malware.sh
```

**로그 확인**:
```bash
tail -f /home/min/malware-check.log
```

## 적용된 보안 강화 사항

### 파일 업로드 API 보안
1. **파일 확장자 검증**: `.jpg`, `.jpeg`, `.png`, `.webp`만 허용
2. **MIME 타입 검증**: 이미지 타입만 허용
3. **경로 traversal 방지**: `..`, `/`, `\` 차단
4. **파일명 sanitization**: 특수문자 제거
5. **경로 검증**: 업로드 디렉토리 밖 접근 차단

### 패키지 업데이트
- Next.js 15.5.9: RCE 취약점 패치
- Multer 2.0.2: DoS 취약점 패치

## 다음 단계

1. **GitHub Actions 배포 확인**
   - 각 프로젝트의 GitHub Actions에서 배포 상태 확인
   - 새 이미지가 정상적으로 빌드되고 배포되는지 확인

2. **서버 모니터링 활성화**
   - Crontab에 모니터링 스크립트 추가
   - 정기적으로 로그 확인

3. **정기 점검**
   - 주 1회 모니터링 로그 확인
   - 주 1회 `npm audit` 실행
   - 월 1회 Docker 이미지 재빌드

## 참고

- 모든 프로젝트가 동일한 보안 강화 적용
- 모니터링 스크립트는 자동으로 악성 프로세스와 파일을 감지
- 로그는 `/home/min/malware-check.log`에 저장됨


