# 서버 배포 가이드

## 504 타임아웃 문제 해결 배포

### 서버에서 실행할 명령어

```bash
# 1. 프로젝트 디렉토리로 이동
cd /path/to/ejdc-wedding

# 2. 최신 코드 가져오기
git pull origin main

# 3. Docker 이미지 빌드 (환경 변수는 서버의 .env 파일이나 환경에서 가져옴)
docker build \
  --build-arg NEXT_PUBLIC_NAVER_MAP_CLIENT_ID="${NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}" \
  --build-arg NAVER_MAP_CLIENT_SECRET="${NAVER_MAP_CLIENT_SECRET}" \
  --build-arg NEXT_PUBLIC_KAKAO_JS_KEY="${NEXT_PUBLIC_KAKAO_JS_KEY}" \
  -t zxcyui6181/ejdc-wedding:$(git rev-parse HEAD) \
  -t zxcyui6181/ejdc-wedding:latest \
  .

# 4. Docker Hub에 푸시
docker push zxcyui6181/ejdc-wedding:$(git rev-parse HEAD)
docker push zxcyui6181/ejdc-wedding:latest

# 5. 기존 컨테이너 중지 및 제거
docker stop ejdc-wedding
docker rm ejdc-wedding

# 6. 새 이미지로 컨테이너 실행
docker run -d \
  --name ejdc-wedding \
  --restart always \
  -p 1140:1140 \
  -v $(pwd)/public/uploads:/app/public/uploads \
  zxcyui6181/ejdc-wedding:latest

# 또는 docker-compose를 사용하는 경우
docker-compose up -d --build
```

### 변경 사항 요약

1. **데이터베이스 연결 타임아웃 추가** (10초)
2. **헬스체크 타임아웃 증가** (3초 → 10초)
3. **헬스체크 엔드포인트 추가** (`/api/health`)
4. **메타데이터 생성 타임아웃 추가** (5초)

### 헬스체크 확인

```bash
# 컨테이너 상태 확인
docker ps

# 헬스체크 로그 확인
docker inspect ejdc-wedding | grep -A 10 Health

# 직접 헬스체크 테스트
curl http://localhost:1140/api/health
```

