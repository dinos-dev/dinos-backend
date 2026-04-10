#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# pr.sh — GitHub PR 생성 자동화
#
# 사용법:
#   ./scripts/pr.sh <issue-number> "<PR 제목>" ["<작업내용1>" "<작업내용2>" ...]
#
# 예시:
#   ./scripts/pr.sh 71 "shared-pins 나와 같은 음식점을 pin한 친구 목록 조회" \
#     "나와 같은 음식점을 pin-toggle한 친구 목록 반환 엔드포인트 추가" \
#     "unit test"
# ──────────────────────────────────────────────────────────────
set -euo pipefail

ISSUE_NUMBER="${1:-}"
PR_TITLE_SUFFIX="${2:-}"

if [[ -z "$ISSUE_NUMBER" || -z "$PR_TITLE_SUFFIX" ]]; then
  echo "사용법: $0 <issue-number> \"<PR 제목>\" [\"<작업내용1>\" ...]"
  exit 1
fi

shift 2
ITEMS=("$@")

# ── 이슈 정보 조회 ─────────────────────────────────────────────
echo "이슈 #${ISSUE_NUMBER} 조회 중..."
ISSUE_JSON=$(gh issue view "$ISSUE_NUMBER" --json title,labels)
ISSUE_LABELS=$(echo "$ISSUE_JSON" | grep -o '"name":"[^"]*"' | sed 's/"name":"//g' | sed 's/"//g' | tr '\n' ',')
ISSUE_LABELS="${ISSUE_LABELS%,}"

# ── PR 본문 생성 ───────────────────────────────────────────────
PR_TITLE="[#${ISSUE_NUMBER}] ${PR_TITLE_SUFFIX}"

BODY="## #️⃣연관된 이슈

> #${ISSUE_NUMBER}

## 📝작업 내용"

if [[ ${#ITEMS[@]} -gt 0 ]]; then
  for ITEM in "${ITEMS[@]}"; do
    BODY+="
- ${ITEM}"
  done
else
  # 이슈 본문에서 체크리스트 항목 자동 추출
  CHECKLIST=$(gh issue view "$ISSUE_NUMBER" --json body -q '.body' | grep '^\- \[' | sed 's/\- \[x\]/- /g' | sed 's/\- \[ \]/- /g')
  if [[ -n "$CHECKLIST" ]]; then
    BODY+="
${CHECKLIST}"
  else
    BODY+="
- "
  fi
fi

# ── 레포 및 브랜치 정보 ────────────────────────────────────────
REPO=$(gh repo view --json nameWithOwner -q '.nameWithOwner')
REPO_OWNER=$(echo "$REPO" | cut -d'/' -f1)
CURRENT_BRANCH=$(git branch --show-current)

# ── PR 생성 ────────────────────────────────────────────────────
echo "PR 생성 중..."
PR_URL=$(gh pr create \
  --repo "$REPO" \
  --head "${REPO_OWNER}:${CURRENT_BRANCH}" \
  --base main \
  --title "$PR_TITLE" \
  --body "$BODY" \
  --label "$ISSUE_LABELS")

echo ""
echo "✅ PR 생성 완료"
echo "   URL: ${PR_URL}"
