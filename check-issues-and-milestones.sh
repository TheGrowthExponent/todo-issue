todo-issue/check-issues-and-milestones.sh
#!/bin/bash

# Script to check if GitHub Issues are enabled and if at least one milestone exists.
# Logs error and outputs instructions if requirements are not met.

set -e

REPO="${GITHUB_REPOSITORY}"
OWNER=$(echo "$REPO" | cut -d'/' -f1)
REPO_NAME=$(echo "$REPO" | cut -d'/' -f2)

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
  echo "::error::GitHub CLI (gh) is not installed. Please install it in your workflow runner."
  exit 1
fi

# Check if issues are enabled
HAS_ISSUES=$(gh api /repos/$OWNER/$REPO_NAME --jq '.has_issues')

# Check if milestones exist
MILESTONE_COUNT=$(gh api /repos/$OWNER/$REPO_NAME/milestones --jq 'length')

ERROR_MSG=""

if [ "$HAS_ISSUES" != "true" ]; then
  ERROR_MSG+="❌ Issues are not enabled for this repository.\n"
  ERROR_MSG+="To enable issues: Go to GitHub → Settings → Features → Check 'Issues'.\n"
fi

if [ "$MILESTONE_COUNT" -eq 0 ]; then
  ERROR_MSG+="❌ No milestones found in this repository.\n"
  ERROR_MSG+="To create a milestone: Go to GitHub → Issues → Milestones → New milestone.\n"
fi

if [ -n "$ERROR_MSG" ]; then
  echo -e "$ERROR_MSG"
  echo "::error::$ERROR_MSG"
  exit 1
else
  echo "✅ Issues are enabled and at least one milestone exists."
fi
