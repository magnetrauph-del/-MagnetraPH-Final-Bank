# Phase 1C.2 legal and operational release checklist

These are unresolved facts, not implemented policies or permission to change services.

- Legal operator name, business address/country and privacy contact.
- Applicable jurisdiction, eligibility/age, dispute handling and any legally required rights notices.
- Confirm support@magnetra.app exists, can receive mail and is monitored; confirm any response commitment. Only source configuration and mailto behavior were verified. No email was sent.
- Actual deployed Worker/Supabase profile fields, access controls, processing locations and processors/subprocessors.
- Provider/security request logging, log retention, backups and expiry, support-email retention and any required legal hold.
- Account deletion success/partial-failure handling, recovery, backend cascading cleanup and how deletion is verified. Do not imply deletion removes all logs/backups/downloads.
- Data access/correction/deletion request process and data transfers.
- Final terms for permitted use, moderation, content rights, liability/disclaimers, policy changes and language precedence.
- No payment, subscription, credits or refund policy is introduced; any future billable feature is separately gated.

The revised Privacy and Terms drafts are outside public/ and excluded from Hosting. Existing public/privacy.html and public/terms.html are unchanged; they still contain earlier wording and are NOT claimed to be the revised trilingual policies. Review and explicit owner/legal approval are required before replacing them. Help explains that the revisions are pending. Do not treat preview deployment approval as legal-content approval.

Custom profile-photo uploads remain deferred: a bucket name in Firebase config is not evidence of enabled storage, private ownership rules, no-billing eligibility or cleanup. No Storage SDK, bucket, rule, migration or public photo URL was introduced.
