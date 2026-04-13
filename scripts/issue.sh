#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# issue.sh — GitHub 이슈 생성 + git 브랜치 자동화
#
# 사용법:
#   ./scripts/issue.sh <type> <branch-suffix> "<제목>" "<내용1>" ["<내용2>" ...]
#
# 예시:
#   ./scripts/issue.sh feature shared-pins "shared-pins" \
#     "나와 같은 음식점을 pin-toggle한 친구 목록을 반환" \
#     "찔러보기 ( Notification )" \
#     "열람 목록 기능"
#
# type: feature | fix | refactor | bug | hotfix
# ──────────────────────────────────────────────────────────────
set -euo pipefail

# ── Issue Type ID (GraphQL node ID) ───────────────────────────
ISSUE_TYPE_FEATURE="IT_kwDOCu2Mjs4Bakyn"
ISSUE_TYPE_BUG="IT_kwDOCu2Mjs4Bakym"
ISSUE_TYPE_TASK="IT_kwDOCu2Mjs4Bakyl"

# ── 인자 파싱 ──────────────────────────────────────────────────
TYPE="${1:-}"
BRANCH_SUFFIX="${2:-}"
TITLE_SUFFIX="${3:-}"

if [[ -z "$TYPE" || -z "$BRANCH_SUFFIX" || -z "$TITLE_SUFFIX" ]]; then
  echo "사용법: $0 <type> <branch-suffix> \"<제목>\" \"<내용1>\" [\"<내용2>\" ...]"
  echo "type: feature | fix | refactor | bug | hotfix"
  exit 1
fi

# 나머지 인자 = 개발 내용 항목들
shift 3
ITEMS=("$@")

# ── 타입별 설정 ────────────────────────────────────────────────
case "$TYPE" in
  feature)
    LABELS="featrue,backend"
    PREFIX="feature"
    ISSUE_TYPE_ID="$ISSUE_TYPE_FEATURE"
    ;;
  fix)
    LABELS="fix,backend"
    PREFIX="fix"
    ISSUE_TYPE_ID="$ISSUE_TYPE_TASK"
    ;;
  refactor)
    LABELS="refactor,backend"
    PREFIX="refactor"
    ISSUE_TYPE_ID="$ISSUE_TYPE_TASK"
    ;;
  bug)
    LABELS="bug,backend"
    PREFIX="fix"
    ISSUE_TYPE_ID="$ISSUE_TYPE_BUG"
    ;;
  hotfix)
    LABELS="hotfix,backend"
    PREFIX="hotfix"
    ISSUE_TYPE_ID="$ISSUE_TYPE_TASK"
    ;;
  *)
    echo "알 수 없는 type: $TYPE"
    echo "type: feature | fix | refactor | bug | hotfix"
    exit 1
    ;;
esac

BRANCH_NAME="${PREFIX}/${BRANCH_SUFFIX}"
ISSUE_TITLE="[${BRANCH_NAME}] ${TITLE_SUFFIX}"

# ── 이슈 본문 생성 ─────────────────────────────────────────────
BODY="## [${BRANCH_NAME}] ${BRANCH_SUFFIX}
**개발 내용(설명)**"

for ITEM in "${ITEMS[@]}"; do
  BODY+="
- ${ITEM}"
done

BODY+="

</br>

- [ ] "

# ── 이슈 생성 ──────────────────────────────────────────────────
echo "이슈 생성 중..."
ISSUE_URL=$(gh issue create \
  --title "$ISSUE_TITLE" \
  --body "$BODY" \
  --label "$LABELS" \
  --assignee "@me")

ISSUE_NUMBER=$(echo "$ISSUE_URL" | grep -o '[0-9]*$')

# ── Issue Type 설정 (GraphQL) ──────────────────────────────────
ISSUE_NODE_ID=$(gh issue view "$ISSUE_NUMBER" --json id -q '.id')
gh api graphql -f query="
mutation {
  updateIssue(input: {id: \"${ISSUE_NODE_ID}\", issueTypeId: \"${ISSUE_TYPE_ID}\"}) {
    issue { id }
  }
}" > /dev/null

echo ""
echo "✅ 이슈 생성 완료"
echo "   번호: #${ISSUE_NUMBER}"
echo "   URL : ${ISSUE_URL}"
echo "   브랜치: ${BRANCH_NAME}"

# ── 브랜치 생성 여부 확인 ──────────────────────────────────────
echo ""
# AUTO_BRANCH=true 환경변수로 비인터랙티브 실행 지원 (Claude Code 등)
AUTO_BRANCH="${AUTO_BRANCH:-}"

if [[ "$AUTO_BRANCH" == "true" ]]; then
  git checkout -b "$BRANCH_NAME"
  echo "✅ 브랜치 생성 및 체크아웃 완료: ${BRANCH_NAME}"
elif [[ "$AUTO_BRANCH" == "false" ]]; then
  echo "브랜치 생성 건너뜀: ${BRANCH_NAME}"
else
  read -rp "브랜치 '${BRANCH_NAME}'을 생성하고 체크아웃할까요? [Y/n] " CONFIRM
  CONFIRM="${CONFIRM:-Y}"
  if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
    git checkout -b "$BRANCH_NAME"
    echo "✅ 브랜치 생성 및 체크아웃 완료: ${BRANCH_NAME}"
  fi
fi

echo ""
echo "PR 생성 시:"
echo "  ./scripts/pr.sh ${ISSUE_NUMBER} \"${TITLE_SUFFIX}\""
