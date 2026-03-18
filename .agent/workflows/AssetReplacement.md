---
description: how to replace assets with compressed versions and ensure utilization
---

# Asset Replacement Workflow

Follow these steps to replace existing assets with compressed versions while maintaining project stability.

## 1. Preparation
Check if the compressed images have the exact same file extensions as the originals.
- **Same Extensions**: Replacement is automatic.
- **Different Extensions**: Code imports will need a bulk update.

## 2. Replacement
1. Navigate to the `src/` directory.
2. Rename the current `assets` folder to `assets_backup` (optional but recommended).
3. Place your new compressed `assets` folder into `src/`.

## 3. Verification
Run the development server to check for missing asset errors:
```powershell
npm run dev
```
If you see "Module not found" errors for assets, it means the extensions changed.

## 4. Bulk Extension Update (If Needed)
If you converted images (e.g., `.png` to `.webp`), run a global find-and-replace in your IDE or use a regex search across the `@/src/imports` directory:

**Search Pattern:** `import (.*) from "../assets/(.*)\.png";`
**Replace Pattern:** `import $1 from "../assets/$2.webp";`

## 5. Cleanup
Once verified, you can delete the `assets_backup` folder.
