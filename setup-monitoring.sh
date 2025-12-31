#!/bin/bash
# 서버에 모니터링 스크립트 설정 가이드

echo "=== 악성 프로그램 모니터링 설정 ==="
echo ""
echo "1. 스크립트 위치: /home/min/check-malware.sh"
echo "2. 로그 파일: /var/log/malware-check.log"
echo ""
echo "=== Crontab 설정 (5분마다 실행) ==="
echo ""
echo "다음 명령어로 crontab에 추가하세요:"
echo ""
echo "crontab -e"
echo ""
echo "그리고 다음 줄을 추가:"
echo "*/5 * * * * /home/min/check-malware.sh"
echo ""
echo "=== 수동 실행 ==="
echo "bash /home/min/check-malware.sh"
echo ""
echo "=== 로그 확인 ==="
echo "tail -f /var/log/malware-check.log"
echo ""


