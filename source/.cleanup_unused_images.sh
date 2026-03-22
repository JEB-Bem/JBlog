#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

ROOT_DIR="."
IMAGES_DIR="./images"

log() {
    printf '[INFO] %s\n' "$*"
}

warn() {
    printf '[WARN] %s\n' "$*" >&2
}

err() {
    printf '[ERROR] %s\n' "$*" >&2
}

cleanup() {
    if [[ -n "${TMP_DIR:-}" && -d "${TMP_DIR:-}" ]]; then
        rm -rf "$TMP_DIR"
    fi
}
trap cleanup EXIT

require_cmd() {
    local cmd="$1"
    if ! command -v "$cmd" >/dev/null 2>&1; then
        err "缺少依赖命令：$cmd"
        exit 1
    fi
}

require_cmd find
require_cmd grep
require_cmd sed
require_cmd sort
require_cmd uniq
require_cmd tr
require_cmd realpath

if [[ ! -d "$IMAGES_DIR" ]]; then
    err "当前目录下不存在 images 目录：$IMAGES_DIR"
    exit 1
fi

TMP_DIR="$(mktemp -d)"
USED_RAW="$TMP_DIR/used_raw.txt"
USED_NORM="$TMP_DIR/used_norm.txt"
EXISTING_NORM="$TMP_DIR/existing_norm.txt"
UNUSED_NORM="$TMP_DIR/unused_norm.txt"

touch "$USED_RAW" "$USED_NORM" "$EXISTING_NORM" "$UNUSED_NORM"

log "扫描 html / md 文件引用..."

while IFS= read -r -d '' file; do
    grep -Eo '(\.?/)?images/[^"'\'' )>#?]+' "$file" >> "$USED_RAW" || true
done < <(find "$ROOT_DIR" -type f \( -iname '*.html' -o -iname '*.md' \) -print0)

if [[ -s "$USED_RAW" ]]; then
    sed -E \
        -e 's#^[./]+##' \
        -e 's#[?#].*$##' \
        "$USED_RAW" \
        | grep -E '^images/.+' \
        | sort -u > "$USED_NORM" || true
fi

while IFS= read -r -d '' img; do
    rel="$(realpath --relative-to="$ROOT_DIR" "$img")" || {
        warn "无法处理路径：$img"
        continue
    }
    printf '%s\n' "$rel" >> "$EXISTING_NORM"
done < <(find "$IMAGES_DIR" -type f -print0)

sort -u "$EXISTING_NORM" -o "$EXISTING_NORM"

if [[ -s "$USED_NORM" ]]; then
    grep -Fxv -f "$USED_NORM" "$EXISTING_NORM" > "$UNUSED_NORM" || true
else
    warn "未发现引用记录，将视为全部未使用"
    cp "$EXISTING_NORM" "$UNUSED_NORM"
fi

count="$(wc -l < "$UNUSED_NORM" | tr -d '[:space:]')"

if [[ "$count" == "0" ]]; then
    log "没有未使用图片"
    exit 0
fi

printf '\n以下图片未被引用：\n'
printf '%s\n' '--------------------------------'
cat "$UNUSED_NORM"
printf '%s\n' '--------------------------------'
printf '共 %s 张\n\n' "$count"

confirm_delete() {

    while true; do
        read -r -p "是否删除以上文件？[Y/n] (默认: 删除): " answer

        # 默认回车 = 删除
        if [[ -z "$answer" ]]; then
            return 0
        fi

        case "$answer" in
            y|Y|yes|Yes|YES)
                return 0
                ;;
            n|N|no|No|NO)
                return 1
                ;;
            *)
                printf "请输入 yes/y 或 no/n（回车默认删除）\n"
                ;;
        esac
    done
}

if ! confirm_delete; then
    log "取消删除"
    exit 0
fi

deleted=0
failed=0

while IFS= read -r img; do

    [[ -z "$img" ]] && continue

    if [[ ! -f "$img" ]]; then
        warn "文件不存在：$img"
        continue
    fi

    if rm -f -- "$img"; then
        printf '[DELETED] %s\n' "$img"
        deleted=$((deleted + 1))
    else
        err "删除失败：$img"
        failed=$((failed + 1))
    fi

done < "$UNUSED_NORM"

printf '\n完成：删除 %d 张，失败 %d 张\n' "$deleted" "$failed"

if [[ "$failed" -gt 0 ]]; then
    exit 1
fi
