#!/usr/bin/env python3
"""
scrub.py — Remove AI watermarks and normalize punctuation in markdown files.
Usage: python3 scripts/scrub.py <file_path>
"""

import sys
import re
import unicodedata

INVISIBLE_CHARS = [
    '​',  # zero-width space
    '﻿',  # BOM
    '‌',  # zero-width non-joiner
    '⁠',  # word joiner
    '­',  # soft hyphen
    ' ',  # narrow no-break space
]

def remove_watermarks(text):
    count = 0
    for ch in INVISIBLE_CHARS:
        occurrences = text.count(ch)
        if occurrences:
            text = text.replace(ch, '')
            count += occurrences
    # Remove remaining Unicode Cf (format) characters
    cleaned = []
    fmt_count = 0
    for ch in text:
        if unicodedata.category(ch) == 'Cf':
            fmt_count += 1
        else:
            cleaned.append(ch)
    return ''.join(cleaned), count, fmt_count

def replace_emdashes(text):
    count = 0

    # Markdown table cells: | — | → | (qualquer formato) | — skip, preserve as-is
    # Only replace em-dashes outside of table pipe context
    lines = text.split('\n')
    result = []
    for line in lines:
        # Skip table separator lines and table cells with standalone —
        if re.match(r'^\s*\|', line):
            result.append(line)
            continue

        original = line

        # Conjunctive adverbs: "text — however/therefore/moreover/besides/furthermore"
        line, n = re.subn(
            r'\s*—\s*(however|therefore|moreover|besides|furthermore|thus|hence|indeed|consequently)',
            lambda m: '; ' + m.group(1),
            line, flags=re.IGNORECASE
        )
        count += n

        # Attribution: "quoted text — Author Name" (capital after dash = attribution)
        line, n = re.subn(r'\s*—\s*([A-ZÁÉÍÓÚÀÂÃÊÔÇ])', r', \1', line)
        count += n

        # Independent clauses (sentence on both sides, lowercase after dash)
        # "Clause one — clause two" → "Clause one; clause two"
        line, n = re.subn(r'([a-záéíóúàâãêôç\)"])\s*—\s*([a-záéíóúàâãêôç])', r'\1; \2', line)
        count += n

        # Remaining em-dashes → comma
        line, n = re.subn(r'\s*—\s*', ', ', line)
        count += n

        result.append(line)

    return '\n'.join(result), count

def normalize_whitespace(text):
    # Multiple spaces → single space (not at line start for indentation)
    text = re.sub(r'([^\n]) {2,}', r'\1 ', text)
    # Space before punctuation
    text = re.sub(r' ([,\.;:\!\?])', r'\1', text)
    # 3+ blank lines → 2
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
