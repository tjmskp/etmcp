# MCP Backend Deployment Checklist for engineersTech (mcp.engineerstechbd.com)

This checklist is tailored for cPanel shared hosting with phpMyAdmin, file manager, and OpenRouter API integration.

## Prerequisites
- [ ] cPanel access with Node.js support (check hosting provider).
- [ ] Subdomain `mcp.engineerstechbd.com` created in cPanel (Addon Domains).
- [ ] SSL certificate for HTTPS (free via cPanel).
- [ ] OpenRouter account and API key (https://openrouter.ai/keys).

## 1. Database Setup (via phpMyAdmin)
- [ ] Log in to cPanel > phpMyAdmin.
- [ ] Create new database: `mcp_db`.
- [ ] Create user: `mcp_user` with password (note credentials).
- [ ] Assign user to database with full privileges.
- [ ] Open SQL tab and run the contents of `database.sql` (paste and execute).
- [ ] Insert admin user:
  ```
  INSERT INTO mcp_users (id, email, role, api_key, created_at) VALUES (gen_random_uuid(), 'admin@engineerstechbd.com', 'admin', 'your-generated-api-key-here', NOW());
  ```
  (Generate API key: Use online UUID generator or `uuidgen`).

## 2. File Upload (via File Manager)
- [ ] Log in to cPanel > File Manager.
- [ ] Navigate to `public_html` or subdomain root (`mcp.engineerstechbd.com`).
- [ ] Upload all files from `mcp-deployment` folder:
  - `src/` (entire folder)
  - `database.sql`
  - `package.json`
  - `.env.example` (rename to `.env` after editing)
- [ ] Ensure permissions: 755 for folders, 644 for files.

## 3. Environment Configuration
- [ ] In File Manager, edit `.env` (copied from `.env.example`):
  ```
  DB_URL=postgresql://mcp_user:your_password@localhost:5432/mcp_db  # Adjust host/port if not local
  OPENAI_API_KEY=your_openai_key  # Optional, for fallback
  OPENROUTER_API_KEY=your_openrouter_key_here
  PORT=3000  # Or hosting-assigned port
  ADMIN_API_KEY=your-admin-api-key-from-db
  ```
- [ ] Set `ai_provider=openrouter` in settings later via API.

## 4. Node.js App Setup in cPanel
- [ ] In cPanel > Setup Node.js App.
- [ ] Create new app: Set root to `/home/youruser/public_html/mcp.engineerstechbd.com/src/index.js`.
- [ ] Set Node.js version (16+).
- [ ] Run `npm install` in the app manager.
- [ ] Start the app.

## 5. OpenRouter API Integration
- [ ] Ensure `OPENROUTER_API_KEY` is set in `.env`.
- [ ] Via API, set provider: `PUT /admin/settings` with `{"key": "ai_provider", "value": "openrouter"}`.
- [ ] Test: `POST /api/mcp/process` should use OpenRouter for intent/response.

## 6. Webhook Setup
- [ ] Add webhook route if needed (e.g., for ChatGPT).
- [ ] In external service, set URL: `https://mcp.engineerstechbd.com/webhooks/webhook`.
- [ ] Add verification logic in code.

## 7. Testing
- [ ] Health check: `curl https://mcp.engineerstechbd.com/admin/status`.
- [ ] MCP test: `curl -X POST https://mcp.engineerstechbd.com/api/mcp/process -H "Authorization: Bearer <api_key>" -H "Content-Type: application/json" -d '{"user_id":"test","message":"Hello","platform":"web"}'`.
- [ ] Admin settings: Test changing provider via API.

## 8. Security & Monitoring
- [ ] Enable HTTPS.
- [ ] Rotate API keys regularly.
- [ ] Monitor logs via cPanel or SSH.
- [ ] Backup DB/files weekly.

## Notes
- If DB is not PostgreSQL in phpMyAdmin, use external provider (e.g., Neon.tech) and update `DB_URL`.
- For issues, check cPanel error logs or contact hosting support.
- Full project files are in this folder for upload.
