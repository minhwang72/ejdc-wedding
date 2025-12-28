#!/bin/bash

# 서버 배포 스크립트
# 504 타임아웃 문제 해결 배포

set -e

echo "🚀 Starting deployment..."

# 1. 최신 코드 가져오기
echo "📥 Pulling latest code..."
git pull origin main

# 2. 커밋 해시 가져오기
COMMIT_HASH=$(git rev-parse HEAD)
SHORT_HASH=$(git rev-parse --short HEAD)

echo "📦 Building Docker image with commit: $SHORT_HASH"

# 3. Docker 이미지 빌드
docker build \
  --build-arg NEXT_PUBLIC_NAVER_MAP_CLIENT_ID="${NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}" \
  --build-arg NAVER_MAP_CLIENT_SECRET="${NAVER_MAP_CLIENT_SECRET}" \
  --build-arg NEXT_PUBLIC_KAKAO_JS_KEY="${NEXT_PUBLIC_KAKAO_JS_KEY}" \
  -t zxcyui6181/ejdc-wedding:${COMMIT_HASH} \
  -t zxcyui6181/ejdc-wedding:latest \
  .

echo "✅ Docker image built successfully"

# 4. Docker Hub에 푸시
echo "📤 Pushing to Docker Hub..."
docker push zxcyui6181/ejdc-wedding:${COMMIT_HASH}
docker push zxcyui6181/ejdc-wedding:latest

echo "✅ Pushed to Docker Hub"

# 5. 기존 컨테이너 중지 및 제거
echo "🛑 Stopping existing container..."
docker stop ejdc-wedding 2>/dev/null || true
docker rm ejdc-wedding 2>/dev/null || true

# 6. 새 이미지로 컨테이너 실행
echo "▶️  Starting new container..."
docker run -d \
  --name ejdc-wedding \
  --restart always \
  -p 1140:1140 \
  -v $(pwd)/public/uploads:/app/public/uploads \
  zxcyui6181/ejdc-wedding:latest

echo "✅ Deployment completed!"
echo ""
echo "📊 Container status:"
docker ps | grep ejdc-wedding

echo ""
echo "🏥 Health check:"
sleep 5
curl -f http://localhost:1140/api/health && echo " - OK" || echo " - FAILED"

