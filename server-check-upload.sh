#!/bin/bash
# 서버에서 실행: bash server-check-upload.sh

echo "=========================================="
echo "업로드 API 문제 진단 스크립트"
echo "=========================================="
echo ""

echo "1. Docker 컨테이너 상태 확인"
echo "----------------------------------------"
docker ps | grep ejdc-wedding
echo ""

echo "2. 볼륨 마운트 확인"
echo "----------------------------------------"
docker inspect ejdc-wedding 2>/dev/null | grep -A 5 '"Mounts"' || echo "컨테이너를 찾을 수 없습니다"
echo ""

echo "3. 호스트 업로드 디렉토리 확인"
echo "----------------------------------------"
echo "디렉토리 존재 여부:"
ls -ld /home/ubuntu/ejdc-wedding/uploads/ 2>/dev/null || echo "❌ /home/ubuntu/ejdc-wedding/uploads/ 디렉토리가 없습니다"
echo ""
echo "디렉토리 내용:"
ls -la /home/ubuntu/ejdc-wedding/uploads/ 2>/dev/null || echo "디렉토리가 없습니다"
echo ""
echo "images 디렉토리:"
ls -la /home/ubuntu/ejdc-wedding/uploads/images/ 2>/dev/null || echo "❌ images 디렉토리가 없습니다"
echo ""

echo "4. 디렉토리 권한 확인"
echo "----------------------------------------"
stat -c "%U:%G %a %n" /home/ubuntu/ejdc-wedding/uploads/ 2>/dev/null || echo "디렉토리 없음"
stat -c "%U:%G %a %n" /home/ubuntu/ejdc-wedding/uploads/images/ 2>/dev/null || echo "images 디렉토리 없음"
echo ""

echo "5. 컨테이너 내부 디렉토리 확인"
echo "----------------------------------------"
echo "컨테이너 내부 /app/public/uploads:"
docker exec ejdc-wedding ls -la /app/public/uploads/ 2>/dev/null || echo "❌ 컨테이너 내부 접근 실패"
echo ""
echo "컨테이너 내부 /app/public/uploads/images:"
docker exec ejdc-wedding ls -la /app/public/uploads/images/ 2>/dev/null || echo "❌ images 디렉토리가 없습니다"
echo ""

echo "6. 환경변수 확인"
echo "----------------------------------------"
docker exec ejdc-wedding env | grep -E "UPLOAD_DIR|NODE_ENV" || echo "환경변수를 확인할 수 없습니다"
echo ""

echo "7. 파일 쓰기 테스트"
echo "----------------------------------------"
echo "호스트에서 테스트:"
touch /home/ubuntu/ejdc-wedding/uploads/test-write.txt 2>/dev/null && echo "✅ 호스트 쓰기 성공" && rm /home/ubuntu/ejdc-wedding/uploads/test-write.txt || echo "❌ 호스트 쓰기 실패"
echo ""
echo "컨테이너에서 테스트:"
docker exec ejdc-wedding sh -c "touch /app/public/uploads/test-container.txt && ls -la /app/public/uploads/test-container.txt && rm /app/public/uploads/test-container.txt" 2>/dev/null && echo "✅ 컨테이너 쓰기 성공" || echo "❌ 컨테이너 쓰기 실패"
echo ""

echo "8. 최근 업로드 관련 로그"
echo "----------------------------------------"
docker logs --tail 100 ejdc-wedding 2>/dev/null | grep -iE "upload|error|debug|images directory|file.*saved|EACCES|ENOENT" | tail -30 || echo "로그를 확인할 수 없습니다"
echo ""

echo "9. Nginx 설정 확인"
echo "----------------------------------------"
if [ -f /etc/nginx/sites-available/ejdc-wedding ]; then
    echo "Nginx 설정 파일:"
    cat /etc/nginx/sites-available/ejdc-wedding
    echo ""
    echo "client_max_body_size 확인:"
    grep -i "client_max_body_size" /etc/nginx/sites-available/ejdc-wedding || echo "⚠️ client_max_body_size 설정이 없습니다"
else
    echo "❌ Nginx 설정 파일이 없습니다: /etc/nginx/sites-available/ejdc-wedding"
fi
echo ""

echo "10. Nginx 에러 로그 (최근)"
echo "----------------------------------------"
sudo tail -30 /var/log/nginx/error.log 2>/dev/null | grep -iE "upload|413|502|504|client.*body" || echo "관련 에러 없음"
echo ""

echo "=========================================="
echo "진단 완료"
echo "=========================================="

