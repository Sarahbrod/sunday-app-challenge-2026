# Media Intelligence Platform — Backend

## Environment setup

### 1. Copy the example file

```bash
cp .env.example .env
```

Then populate every value. The application will **hard-crash at startup** with a clear error message listing every missing or malformed variable.

### 2. Generate secrets

Run each command separately and paste the output into `.env`:

```bash
# JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# JWT_REFRESH_SECRET (must differ from JWT_SECRET)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# ENCRYPTION_KEY — exactly 64 hex characters (32 bytes / AES-256)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Secrets must never be committed

`.env` is listed in `.gitignore`. Never use `git add -f` or `--force` to add it. If a secret is accidentally committed:

1. Rotate the credential immediately in the provider's dashboard.
2. Rewrite history with `git filter-repo` to remove the commit.
3. Force-push and notify all collaborators to re-clone.

A committed secret should be treated as **compromised from the moment of commit**, regardless of whether the repo is private.

---

### ENCRYPTION_KEY rotation (re-encryption strategy)

The `ENCRYPTION_KEY` is used to AES-256-GCM encrypt all OAuth access and refresh tokens stored in the `sso_providers` and `platform_connections` tables. Changing the key without a re-encryption migration will cause all existing tokens to become unreadable.

**Procedure:**

1. Add `OLD_ENCRYPTION_KEY=<current value>` to your `.env`.
2. Set `ENCRYPTION_KEY=<new value>` in `.env`.
3. Run the migration script in a transaction:
   ```bash
   npx ts-node scripts/rotate-encryption-key.ts
   ```
4. The script decrypts every encrypted column with `OLD_ENCRYPTION_KEY` and re-encrypts with `ENCRYPTION_KEY` atomically. It will fail and roll back if any row cannot be decrypted.
5. After the migration succeeds, remove `OLD_ENCRYPTION_KEY` from `.env`.
6. Deploy the new `ENCRYPTION_KEY` to all environments.

**Never** delete the old key before the migration completes. Run a full backup before starting.

---

### OAuth credentials — minimal required scopes

Create OAuth apps with the minimum scopes needed. Granting broad scopes increases the blast radius if a token is compromised.

| Platform | Required scopes |
|---|---|
| Google (SSO) | `openid`, `email`, `profile` |
| YouTube Analytics | `https://www.googleapis.com/auth/youtube.readonly`, `https://www.googleapis.com/auth/yt-analytics.readonly` |
| Spotify | `user-read-private`, `user-read-email`, `user-read-playback-state` |
| Apple (SSO) | `name`, `email` |

Never request write scopes unless the feature explicitly requires them.
