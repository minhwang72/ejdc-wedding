#!/bin/bash
# 파일 업로드 문제 진단 스크립트
# 서버에서 실행: bash check-upload-issues.sh

echo "=== 1. Docker 컨테이너 상태 확인 ==="
docker ps | grep ejdc-wedding
echo ""

echo "=== 2. Docker 볼륨 마운트 확인 ==="
docker inspect ejdc-wedding | grep -A 10 "Mounts"
echo ""

echo "=== 3. 업로드 디렉토리 구조 확인 ==="
echo "호스트 디렉토리:"
ls -la /home/ubuntu/ejdc-wedding/uploads/
echo ""
echo "이미지 디렉토리:"
ls -la /home/ubuntu/ejdc-wedding/uploads/images/ 2>/dev/null || echo "images 디렉토리가 없습니다"
echo ""

echo "=== 4. 디렉토리 권한 확인 ==="
stat /home/ubuntu/ejdc-wedding/uploads/
stat /home/ubuntu/ejdc-wedding/uploads/images/ 2>/dev/null || echo "images 디렉토리가 없습니다"
echo ""

echo "=== 5. Docker 컨테이너 내부 디렉토리 확인 ==="
docker exec ejdc-wedding ls -la /app/public/uploads/ 2>/dev/null || echo "컨테이너 내부 접근 실패"
docker exec ejdc-wedding ls -la /app/public/uploads/images/ 2>/dev/null || echo "컨테이너 내부 images 디렉토리가 없습니다"
echo ""

echo "=== 6. Docker 컨테이너 환경변수 확인 ==="
docker exec ejdc-wedding env | grep -E "UPLOAD_DIR|NODE_ENV"
echo ""

echo "=== 7. 최근 Docker 로그 (업로드 관련) ==="
docker logs --tail 50 ejdc-wedding | grep -i "upload\|error\|debug" | tail -20
echo ""

echo "=== 8. Nginx 설정 확인 ==="
if [ -f /etc/nginx/sites-available/ejdc-wedding ]; then
    echo "Nginx 설정 파일 내용:"
    cat /etc/nginx/sites-available/ejdc-wedding
else
    echo "⚠️ Nginx 설정 파일이 없습니다: /etc/nginx/sites-available/ejdc-wedding"
fi
echo ""

echo "=== 9. Nginx 에러 로그 (최근) ==="
sudo tail -20 /var/log/nginx/error.log 2>/dev/null || echo "Nginx 에러 로그를 읽을 수 없습니다"
echo ""

echo "=== 10. 디렉토리 생성 테스트 ==="
echo "호스트에서 디렉토리 생성 테스트:"
mkdir -p /home/ubuntu/ejdc-wedding/uploads/images
touch /home/ubuntu/ejdc-wedding/uploads/images/test.txt
if [ -f /home/ubuntu/ejdc-wedding/uploads/images/test.txt ]; then
    echo "✅ 호스트에서 파일 생성 성공"
    rm /home/ubuntu/ejdc-wedding/uploads/images/test.txt
else
    echo "❌ 호스트에서 파일 생성 실패"
fi
echo ""

echo "=== 11. 컨테이너에서 디렉토리 생성 테스트 ==="
docker exec ejdc-wedding sh -c "mkdir -p /app/public/uploads/images && touch /app/public/uploads/images/test.txt && ls -la /app/public/uploads/images/test.txt" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ 컨테이너에서 파일 생성 성공"
    docker exec ejdc-wedding rm /app/public/uploads/images/test.txt
else
    echo "❌ 컨테이너에서 파일 생성 실패"
fi

