import os
import re

files = [
    "c:/Users/Omar Maged/Desktop/All thing Optimizers/website3.0/src/imports/Section1.tsx", # I will also process Section 1 to ensure it's clean
    "c:/Users/Omar Maged/Desktop/All thing Optimizers/website3.0/src/imports/Section2.tsx",
    "c:/Users/Omar Maged/Desktop/All thing Optimizers/website3.0/src/imports/Section3.tsx",
    "c:/Users/Omar Maged/Desktop/All thing Optimizers/website3.0/src/imports/Section4.tsx",
    "c:/Users/Omar Maged/Desktop/All thing Optimizers/website3.0/src/imports/Section5.tsx",
    "c:/Users/Omar Maged/Desktop/All thing Optimizers/website3.0/src/imports/Section6.tsx"
]

def clean_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # The manual alignment hacks I added:
    # 1: "right-[5.5vw] items-end text-right"
    #    "left-[5.5vw] items-start"
    content = content.replace("right-[5.5vw] items-end text-right", "right-[5.5vw]")
    content = content.replace("left-[5.5vw] items-start", "left-[5.5vw]")

    # 2: ${isAr ? 'items-end' : 'items-start'}
    content = content.replace("${isAr ? 'items-end' : 'items-start'}", "items-start")
    
    # 3: ${isAr ? 'flex-row-reverse' : ''}
    content = content.replace("${isAr ? 'flex-row-reverse' : ''}", "")

    # 4: ${isAr ? 'items-end' : ''}
    content = content.replace("${isAr ? 'items-end' : ''}", "")

    # 5: ${isAr ? 'text-right' : ''}
    content = content.replace("${isAr ? 'text-right' : ''}", "")

    # Cleanup extra spaces inside template literals before the closing backtick
    content = re.sub(r' \+`', '`', content)
    content = re.sub(r' `', '`', content)

    # Some template literals might now effectively just be static strings like className={`static classes`}
    # We can leave them as is, or remove the `{` and `}` but React handles them fine.
    # Actually wait. If I do replace "${isAr ? 'flex-row-reverse' : ''}" with "", I end up with className={`flex items-center gap-3 w-full max-w-[320px] `}
    # This is fine.

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for f in files:
    try:
        clean_file(f)
        print(f"Cleaned {f}")
    except Exception as e:
        print(f"Error on {f}: {e}")
