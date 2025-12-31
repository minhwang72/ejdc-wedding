#!/bin/bash
# 서버에서 실행할 보안 스크립트

echo "=== 악성 프로세스 감지 및 종료 ==="

# 악성 프로세스 패턴
MALICIOUS_PATTERNS="vmlunix|VM-unix|X11-unix|javap|vmiluniz"

# 악성 프로세스 찾기
MALICIOUS_PIDS=$(ps aux | grep -E "$MALICIOUS_PATTERNS" | grep -v grep | awk '{print $2}')

if [ ! -z "$MALICIOUS_PIDS" ]; then
    echo "⚠️ 악성 프로세스 발견: $MALICIOUS_PIDS"
    echo "$MALICIOUS_PIDS" | xargs sudo kill -9
    echo "✅ 악성 프로세스 종료 완료"
else
    echo "✅ 악성 프로세스 없음"
fi

# 임시 디렉토리 정리
echo ""
echo "=== 임시 디렉토리 정리 ==="
sudo rm -rf /tmp/.VM-unix
sudo rm -rf /tmp/.X11-unix
sudo find /tmp -name "*vmlunix*" -o -name "*VM-unix*" 2>/dev/null | sudo xargs rm -rf
echo "✅ 임시 디렉토리 정리 완료"

# Docker 컨테이너 내부 확인
echo ""
echo "=== Docker 컨테이너 내부 확인 ==="
for container in ejdc-wedding kevieun-wedding wedding-website portfolio; do
    if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
        echo "Checking $container..."
        docker exec $container ps aux | grep -E "$MALICIOUS_PATTERNS" | grep -v grep && echo "⚠️ $container에 악성 프로세스 발견!" || echo "✅ $container 정상"
    fi
done

echo ""
echo "=== 완료 ==="

