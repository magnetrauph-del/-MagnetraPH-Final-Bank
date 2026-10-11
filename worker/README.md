# worker/ (Cloudflare Worker "magnetra-live-api", not part of the website)

- `worker.js`: reviewed and tested v3 (sha256 5f1077b980c885d9339bfc6a9a3eceef6e8be38e1d89bd70e4588c4bc7e1b25e).
- `DEPLOY.txt`: `inspect` (read-only) or `deploy sha256=<v3> drop=<names|none>` (only after the owner approves).
- Deployed only by `.github/workflows/worker-v3.yml` on branch `worker/v3`. Never place this folder inside `public/`.
