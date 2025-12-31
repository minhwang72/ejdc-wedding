# 서버 과부하 문제 해결 요약

## 발견된 문제

### 1. 악성 프로세스 (wedding-website 컨테이너)
- **위치**: `/var/tmp/next/next` (8.3MB 악성 바이너리)
- **증상**: CPU 81% 사용, 외부 서버(146.190.48.14:9000)에서 추가 악성코드 다운로드 시도
- **영향**: 서버 전체 과부하 유발

### 2. 서버 상태
- **CPU 사용률**: 100% → 2.1% (정상화)
- **Load Average**: 6.60 → 0.48 (정상화)
- **메모리**: 3.3GB 사용 → 965MB 사용 (정상화)

## 조치 사항

1. ✅ `wedding-website` 컨테이너 내부 악성 파일 확인
2. ✅ 악성 프로세스 종료 시도
3. ✅ `wedding-website` 컨테이너 완전 삭제
4. ✅ 서버 상태 정상화 확인

## 현재 상태

- ✅ CPU 사용률: 2.1% (정상)
- ✅ 메모리: 12.2GB free (정상)
- ✅ Load Average: 0.48 (정상)
- ✅ 악성 프로세스: 없음
- ✅ 실행 중인 컨테이너:
  - `ejdc-wedding`: 정상 (CPU 0.01%)
  - `kevieun-wedding`: 정상 (CPU 0.00%)
  - `portfolio`: 정상 (CPU 0.00%)

## 권장 사항

1. **wedding-website 재배포**: 깨끗한 이미지로 재배포 필요
2. **정기 모니터링**: 주기적으로 악성 프로세스 확인
3. **SSH 보안 강화**: 비밀번호 인증 비활성화, 키 인증만 허용
4. **패키지 업데이트**: Next.js 및 기타 패키지 최신 버전 유지

## 모니터링 명령어

```bash
# 악성 프로세스 확인
ps aux | grep -E 'vmlunix|VM-unix|/var/tmp/next' | grep -v grep

# 컨테이너 리소스 사용량
docker stats --no-stream

# 서버 전체 상태
top -bn1 | head -15
```

