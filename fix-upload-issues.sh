#!/bin/bash
# 서버에서 실행: bash fix-upload-issues.sh

echo "=== 업로드 문제 수정 스크립트 ==="
echo ""

echo "1. images 디렉토리 생성 및 권한 수정..."
sudo mkdir -p /home/ubuntu/ejdc-wedding/uploads/images
sudo chown -R 1001:1001 /home/ubuntu/ejdc-wedding/uploads
sudo chmod -R 755 /home/ubuntu/ejdc-wedding/uploads

echo "2. 디렉토리 확인..."
ls -la /home/ubuntu/ejdc-wedding/uploads/
ls -la /home/ubuntu/ejdc-wedding/uploads/images/

echo "3. 컨테이너에서 쓰기 테스트..."
docker exec ejdc-wedding sh -c 'touch /app/public/uploads/test.txt && ls -la /app/public/uploads/test.txt && rm /app/public/uploads/test.txt' && echo "✅ 쓰기 성공" || echo "❌ 쓰기 실패"

echo "4. Nginx 설정 확인..."
grep -A 2 'location /uploads/' /etc/nginx/sites-available/ejdc.eungming.com

echo ""
echo "=== 완료 ==="

