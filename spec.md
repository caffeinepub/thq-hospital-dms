# THQ Hospital DMS

## Current State
Full DMS with rich text editor, QR code, standalone tables, approval workflows, and role-based access. Document number is manually entered. HospitalSettings has no MS signature field. SettingsPage has logo upload only.

## Requested Changes (Diff)

### Add
- Auto document number generator using format: `No.___[SEQ]___THQ-SlW.` (sequential, resets yearly, stored in localStorage)
- MS Signature feature in Settings:
  - Upload signature image (PNG/JPG, stored as base64 in HospitalSettings)
  - Draw signature on canvas pad with clear/redo buttons
  - Save/clear signature from settings
- MS Signature display:
  - Signature image + "Medical Superintendent" + "THQ Hospital Sillanwali" block at bottom of print/PDF view
  - Signature line shown in document detail print section
- `msSignature` and `msName` and `msDesignation` fields added to HospitalSettings type
- `DOC_COUNTER` key in localStorage to track per-year sequence

### Modify
- `HospitalSettings` type: add `msSignature?: string`, `msName?: string`, `msDesignation?: string`
- `dmsStorage.ts`: add `getDocCounter`/`saveDocCounter` helpers; update `generateDocNumber()` function to produce formatted number
- `NewDocumentPage.tsx`: auto-fill docNumber field on mount using `generateDocNumber()`; increment counter on save
- `SettingsPage.tsx`: add MS Signature section with upload + canvas draw pad, save to settings
- `DocumentDetailPage.tsx`: show MS signature block in print/PDF view

### Remove
- Nothing removed

## Implementation Plan
1. Update `HospitalSettings` type with MS signature fields and add doc counter to storage
2. Add `generateDocNumber()` to dmsStorage that produces `No.___001___THQ-SlW.` format
3. Update `NewDocumentPage` to auto-populate docNumber
4. Add SignaturePad component (canvas draw + image upload)
5. Update `SettingsPage` with MS Signature section
6. Update `DocumentDetailPage` print view to show MS signature block
