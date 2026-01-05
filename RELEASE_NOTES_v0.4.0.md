RowaKit v0.4.0 — Polish + Correctness (Stage D)

Summary
-------

This release focuses on polishing Stage C features and hardening behavior across resizing, URL sync, and saved views. Key highlights:

- Pointer Events-based column resizing (mouse/touch/pen) with pointer capture
- Debounced and validated URL sync; preserves hash routing for demo gallery
- Saved views persistence and safe hydration (localStorage index)
- Double-click auto-fit for column widths
- Several bug fixes: accidental sort while resizing, stuck resize state, corrupted saved view handling
- 239 tests passing; ESM + CJS + DTS builds successful

See packages/table/CHANGELOG.md and CHANGELOG.md for full details and test results.

Assets
------

- Built artifacts for `@rowakit/table` are available in `packages/table/dist`

Notes
-----

- This tag was created from branch `release/v0.4.0` and includes demo/docs updates.
- After publishing, consider NPM publish for `@rowakit/table` (package is public).
