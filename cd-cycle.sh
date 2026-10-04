#!/bin/bash
# continuous delivery: N gated cycles, one log line per cycle
cd /c/Users/Capsizer/Desktop/TehranLasser || exit 1
LOG=DEPLOY_LOG.txt
for i in $(seq 1 "${1:-3}"); do
  # fetch remote in case another agent pushes
  git fetch -q origin main 2>/dev/null
  CHANGED=$(git status --porcelain | grep -v '^?? DEPLOY_LOG.txt$' | grep -v '^ M DEPLOY_LOG.txt$')
  if [ -n "$CHANGED" ]; then
    N=$(echo "$CHANGED" | wc -l)
    if ! npm run typecheck >/tmp/tc.log 2>&1; then
      echo "$(date -u +%FT%TZ) files=$N typecheck=FAIL skip" >> $LOG
      sleep 30; continue
    fi
    if ! npm run build >/tmp/bd.log 2>&1; then
      echo "$(date -u +%FT%TZ) files=$N build=FAIL skip" >> $LOG
      sleep 30; continue
    fi
    git add -A && git commit -q -m "chore(deploy): continuous delivery snapshot" || true
    HASH=$(git rev-parse --short HEAD)
    PUSH=$(git push origin main 2>&1 | tail -1)
    echo "$PUSH" | grep -q 'timed out\|error' && { git push origin main >/dev/null 2>&1; }
    DEP=$(npx wrangler deploy 2>&1)
    VER=$(echo "$DEP" | grep -o '[0-9a-f]\{8\}-[0-9a-f-]\{27,\}' | tail -1)
    echo "$DEP" | grep -qi 'error\|failed' && VER="DEPLOYFAIL"
    sleep 3
    HTTP=$(curl -s -o /dev/null -w '%{http_code}' https://tehran-laser.samerkhaldounmarefi.workers.dev/)
    echo "$(date -u +%FT%TZ) files=$N commit=$HASH version=${VER:-unknown} http=$HTTP" >> $LOG
  else
    git pull --ff-only -q origin main 2>/dev/null
    echo "$(date -u +%FT%TZ) files=0 idle http=$(curl -s -o /dev/null -w '%{http_code}' https://tehran-laser.samerkhaldounmarefi.workers.dev/)" >> $LOG
  fi
  sleep 30
done
tail -1 $LOG
