#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CHANGELOG_FILE="$PROJECT_ROOT/specification/CHANGELOG.md"

NEW_VERSION=""
FROM_TAG=""
DRY_RUN=false

usage() {
    cat <<EOF
Usage: $(basename "$0") <new_version> [options]

Generate CHANGELOG.md section for a new release tag.

Arguments:
  new_version           Version tag to generate (e.g. 1.0.0-alpha.3, 1.1.0)

Options:
  --from <tag>          Base tag to diff from (default: latest v* tag)
  --dry-run             Print to stdout only, do not modify CHANGELOG.md
  -h, --help            Show this help

Examples:
  $(basename "$0") 1.0.0-alpha.3 --dry-run
  $(basename "$0") 1.1.0
  $(basename "$0") 1.0.0 --from 1.0.0-alpha.2
EOF
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        --from)
            FROM_TAG="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        -*)
            echo "Error: unknown option $1" >&2
            usage >&2
            exit 1
            ;;
        *)
            if [[ -z "$NEW_VERSION" ]]; then
                NEW_VERSION="$1"
            else
                echo "Error: unexpected argument $1" >&2
                usage >&2
                exit 1
            fi
            shift
            ;;
    esac
done

if [[ -z "$NEW_VERSION" ]]; then
    echo "Error: <new_version> is required" >&2
    usage >&2
    exit 1
fi

if ! echo "$NEW_VERSION" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?$'; then
    echo "Error: version must match MAJOR.MINOR.PATCH[-prerelease] (e.g. 1.0.0-alpha.3)" >&2
    exit 1
fi

if [[ -z "$FROM_TAG" ]]; then
    FROM_TAG=$(git tag -l "*.*.*" --sort=-v:refname 2>/dev/null | head -1 || true)
fi

if [[ -n "$FROM_TAG" ]]; then
    if ! git rev-parse "$FROM_TAG" >/dev/null 2>&1; then
        echo "Error: tag $FROM_TAG not found" >&2
        exit 1
    fi
    LOG_RANGE="${FROM_TAG}..HEAD"
else
    LOG_RANGE="HEAD"
    echo "info: no previous tag found, generating from all commits" >&2
fi

TODAY=$(date +%Y-%m-%d)

TMPDIR_WORK=$(mktemp -d)
trap 'rm -rf "$TMPDIR_WORK"' EXIT

MERGED_FILE="$TMPDIR_WORK/merged"
ADDED_FILE="$TMPDIR_WORK/added"
FIXED_FILE="$TMPDIR_WORK/fixed"
CHANGED_FILE="$TMPDIR_WORK/changed"
BREAKING_FILE="$TMPDIR_WORK/breaking"
touch "$MERGED_FILE" "$ADDED_FILE" "$FIXED_FILE" "$CHANGED_FILE" "$BREAKING_FILE"

COMMITS=$(git log "$LOG_RANGE" --format="%H" --no-merges 2>/dev/null || true)

if [[ -z "$COMMITS" ]]; then
    echo "info: no commits found in range $LOG_RANGE" >&2
fi

classify_line() {
    local subject="$1"
    if echo "$subject" | grep -qE '^(feat|spec)(\([^)]*\))?:'; then
        echo "added"
    elif echo "$subject" | grep -qE '^fix(\([^)]*\))?:'; then
        echo "fixed"
    elif echo "$subject" | grep -qE '^refactor(\([^)]*\))?:'; then
        echo "changed"
    elif echo "$subject" | grep -qE '^breaking(\([^)]*\))?:'; then
        echo "breaking"
    else
        echo "other"
    fi
}

strip_prefix() {
    local subject="$1"
    echo "$subject" | sed -E 's/^(feat|fix|spec|refactor|breaking)(\([^)]*\))?[:：]\s*//'
}

extract_gaps() {
    local hash="$1"
    git log -1 --format="%b %s" "$hash" 2>/dev/null | grep -oE 'GAP-[0-9]+' | sort -u | tr '\n' ',' | sed 's/,$//' || true
}

for hash in $COMMITS; do
    subject=$(git log -1 --format="%s" "$hash")

    if echo "$subject" | grep -qE '^![0-9]+ merge '; then
        continue
    fi

    category=$(classify_line "$subject")

    if [[ "$category" == "other" ]]; then
        continue
    fi

    clean_text=$(strip_prefix "$subject")
    gaps=$(extract_gaps "$hash")

    printf '%s\t%s\t%s\n' "$category" "$clean_text" "$gaps" >> "$MERGED_FILE"
done

current_category=""
prev_verb=""
prev_line=""
prev_gaps=""
count=0

flush_entry() {
    if [[ -z "$prev_line" ]]; then
        return
    fi

    local target=""
    case "$current_category" in
        added)    target="$ADDED_FILE" ;;
        fixed)    target="$FIXED_FILE" ;;
        changed)  target="$CHANGED_FILE" ;;
        breaking) target="$BREAKING_FILE" ;;
    esac

    if [[ -n "$target" ]]; then
        echo "$prev_line" >> "$target"
    fi
}

while IFS=$'\t' read -r category text gaps; do
    verb=$(echo "$text" | awk '{print $1, $2}')
    key="${category}|${verb}"

    if [[ "$key" != "${current_category}|${prev_verb}" ]]; then
        flush_entry
        current_category="$category"
        prev_verb="$verb"
        prev_line="$text"
        prev_gaps="$gaps"
        count=1
    else
        count=$((count + 1))
        if [[ -n "$gaps" && "$gaps" != "$prev_gaps" ]]; then
            if [[ -n "$prev_gaps" ]]; then
                prev_gaps="${prev_gaps},${gaps}"
            else
                prev_gaps="$gaps"
            fi
        fi
        if [[ $count -eq 2 ]]; then
            prev_line="${prev_line} 等 ${count} 项同类变更"
        else
            prev_line=$(echo "$prev_line" | sed -E "s/等 [0-9]+ 项同类变更/等 ${count} 项同类变更/")
        fi
    fi
done < <(sort "$MERGED_FILE")
flush_entry

SECTION_FILE="$TMPDIR_WORK/section"
{
    echo "## [${NEW_VERSION}] - ${TODAY}"

    if [[ -s "$BREAKING_FILE" ]]; then
    echo ""
            echo "### 不兼容变更"
            while IFS= read -r line; do
                echo "- $line"
            done < "$BREAKING_FILE"
        fi

        if [[ -s "$ADDED_FILE" ]]; then
            echo ""
            echo "### 新增"
            while IFS= read -r line; do
                echo "- $line"
            done < "$ADDED_FILE"
        fi

        if [[ -s "$CHANGED_FILE" ]]; then
            echo ""
            echo "### 变更"
            while IFS= read -r line; do
                echo "- $line"
            done < "$CHANGED_FILE"
        fi

        if [[ -s "$FIXED_FILE" ]]; then
            echo ""
            echo "### 修复"
            while IFS= read -r line; do
                echo "- $line"
            done < "$FIXED_FILE"
        fi

    echo ""
    echo "---"
    echo ""
} > "$SECTION_FILE"

if $DRY_RUN; then
    cat "$SECTION_FILE"
else
    if [[ ! -f "$CHANGELOG_FILE" ]]; then
        cat > "$CHANGELOG_FILE" <<'HEADER'
# 变更日志

本文件记录鸿蒙 A2UI 扩展协议的所有版本变更。
格式遵循 [Keep a Changelog](https://keepachangelog.com/)，版本号遵循 [SemVer](https://semver.org/)。

---

HEADER
    fi

    tmpfile="$TMPDIR_WORK/changelog_new"

    if grep -q '^---$' "$CHANGELOG_FILE"; then
        awk '
        /^---$/ && !done {
            while ((getline line < "'"$SECTION_FILE"'") > 0) print line
            print "---"
            done = 1
            next
        }
        { print }
        ' "$CHANGELOG_FILE" > "$tmpfile"
    else
        {
            head -1 "$CHANGELOG_FILE"
            echo ""
            cat "$SECTION_FILE"
            tail -n +2 "$CHANGELOG_FILE"
        } > "$tmpfile"
    fi

    mv "$tmpfile" "$CHANGELOG_FILE"
    echo "info: updated $CHANGELOG_FILE" >&2
fi
