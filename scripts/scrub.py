#!/usr/bin/env python3
"""
scrub.py — Remove AI watermarks and normalize punctuation in markdown files.
Usage: python3 scripts/scrub.py <file_path>
"""

import sys
import re
import unicodedata

# Zero-width / invisible chars that carry no content: delete them.
DELETE_CHARS = [
    '​',  # zero-width space
    '﻿',  # BOM
    '‌',  # zero-width non-joiner
    '⁠',  # word joiner
    '­',  # soft hyphen
]

# Space-like chars that should become a regular space, not be deleted,
# to avoid collapsing indentation or word boundaries.
NORMALIZE_TO_SPACE = [
    ' ',  # narrow no-break space
    ' ',  # non-breaking space
]

def remove_watermarks(text):
    count = 0
    for ch in DELETE_CHARS:
        occurrences = text.count(ch)
        if occurrences:
            text = text.replace(ch, '')
            count += occurrences
    for ch in NORMALIZE_TO_SPACE:
        occurrences = text.count(ch)
        if occurrences:
            text = text.replace(ch, ' ')
            count += occurrences
    # Replace remaining Unicode Cf (format) characters with a space
    # to preserve word/indent boundaries.
    cleaned = []
    fmt_count = 0
    for ch in text:
        if unicodedata.category(ch) == 'Cf':
            fmt_count += 1
            cleaned.append(' ')
        else:
            cleaned.append(ch)
    return ''.join(cleaned), count, fmt_count

def replace_emdashes(text):
    count = 0

    # Markdown table cells: skip, preserve as-is
    lines = text.split('\n')
    result = []
    for line in lines:
        if re.match(r'^\s*\|', line):
            result.append(line)
            continue

        # Conjunctive adverbs: "text — however/therefore/..."
        line, n = re.subn(
            r'\s*—\s*(however|therefore|moreover|besides|furthermore|thus|hence|indeed|consequently)',
            lambda m: '; ' + m.group(1),
            line, flags=re.IGNORECASE
        )
        count += n

        # Independent clauses (lowercase on both sides)
        line, n = re.subn(r'([a-zà-ÿ\)"]) *— *([a-zà-ÿ])', r'\1; \2', line)
        count += n

        # Attribution or uppercase after dash
        line, n = re.subn(r' *— *([A-ZÀ-Ü])', r', \1', line)
        count += n

        # Remaining em-dashes
        line, n = re.subn(r' *— *', ', ', line)
        count += n

        result.append(line)

    return '\n'.join(result), count

def normalize_whitespace(text):
    """Normalize whitespace within content only — never touches leading indentation."""
    lines = text.split('\n')
    result = []
    for line in lines:
        # Preserve leading whitespace (indentation) exactly as-is.
        stripped = line.lstrip(' ')
        indent = line[:len(line) - len(stripped)]

        # Multiple spaces → single space (only inside content)
        stripped = re.sub(r' {2,}', ' ', stripped)
        # Space before punctuation (only inside content)
        stripped = re.sub(r' ([,\.;:\!\?])', r'\1', stripped)

        result.append(indent + stripped)

    # 3+ blank lines → 2
    text = '\n'.join(result)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text

def scrub_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()

    text, watermarks, fmt_chars = remove_watermarks(text)
    text, emdashes = replace_emdashes(text)
    text = normalize_whitespace(text)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)

    print(f"Content Scrubbing Complete:")
    print(f"  - Unicode watermarks removed: {watermarks}")
    print(f"  - Format-control chars removed: {fmt_chars}")
    print(f"  - Em-dashes replaced: {emdashes}")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/scrub.py <file_path>")
        sys.exit(1)
    scrub_file(sys.argv[1])
