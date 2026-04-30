# Feedback Consent — Legacy Compatibility Note

This file is retained only for historical compatibility with older update reports, older initialized projects, and historical feedback artifacts.

New runtime-managed flows do **not** scaffold or read per-type feedback consent files. Upstream feedback consent is now collected at runtime, per flow, after backward-pass meta-analysis and before the final feedback step runs.

See `$INSTRUCTION_CONSENT` for the active model.
