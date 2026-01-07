#!/usr/bin/env python3
import os, re, sys

ROOT = os.getcwd()
GTM_ID = 'GTM-PHHN8FJS'

HEAD_SNIPPET = """<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PHHN8FJS');</script>
<!-- End Google Tag Manager -->"""

NOSCRIPT_SNIPPET = """<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-PHHN8FJS"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->"""

SKIP_DIR_FRAGMENT = os.path.join('', 'partials', '')  # looks for /partials/ in path

modified = []
skipped = []
errors = []

for dirpath, dirnames, filenames in os.walk(ROOT):
    for fname in filenames:
        if not fname.endswith('.html'):
            continue
        fpath = os.path.join(dirpath, fname)
        # skip files inside any 'partials' directory
        if SKIP_DIR_FRAGMENT.strip(os.sep) in fpath:
            skipped.append((fpath, 'partials'))
            continue
        # also skip obvious partial filenames
        base = os.path.basename(fpath).lower()
        if base in ('header.html', 'footer.html'):
            skipped.append((fpath, 'partial-name'))
            continue
        try:
            with open(fpath, 'r', encoding='utf-8') as f:
                text = f.read()
        except Exception as e:
            errors.append((fpath, str(e)))
            continue
        if GTM_ID in text:
            skipped.append((fpath, 'already-present'))
            continue
        new_text = text
        # insert noscript immediately after opening <body ...>
        new_text, n_body = re.subn(r'(<body[^>]*>)', r"\1\n" + NOSCRIPT_SNIPPET, new_text, count=1, flags=re.IGNORECASE)
        # insert head snippet before </head>
        new_text, n_head = re.subn(r'(</head>)', HEAD_SNIPPET + '\n\1', new_text, count=1, flags=re.IGNORECASE)
        if n_body and n_head:
            try:
                with open(fpath, 'w', encoding='utf-8') as f:
                    f.write(new_text)
                modified.append(fpath)
            except Exception as e:
                errors.append((fpath, str(e)))
        else:
            # don't partially modify files; record and skip
            skipped.append((fpath, 'no-body-or-head'))

print('Modified files:')
for p in modified:
    print(p)
print('\nSkipped files:')
for p,reason in skipped:
    print(f'{p}  --> {reason}')
if errors:
    print('\nErrors:')
    for p,err in errors:
        print(f'{p}  ERROR: {err}')

# exit non-zero if errors
sys.exit(1 if errors else 0)
