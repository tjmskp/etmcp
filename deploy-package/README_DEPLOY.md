# MCP Deployment Package

1. Unzip and place in your Namecheap subdomain folder.
2. Run `npm install`.
3. Use `.env` for config values; for MySQL setup:
   - DB_URL=mysql://mcp_user:mcp_password@localhost:3306/mcp_db
   - OPENROUTER_API_KEY etc.
4. Initialize database:
   - `mysql -u root -p < mysql-database.sql`
5. Start app:
   - `npm run start` or via cPanel Node app (entry `src/index.js`).
6. Setup initial admin:
   - Open `http://<subdomain>/setup` and create admin.
7. Set OpenRouter provider:
   - `PUT /admin/settings {"key":"ai_provider","value":"openrouter"}`
8. Set webhook callback in OpenRouter to:
   - `https://<subdomain>/webhooks/webhook`

**Note:** `mcp-users` uses API keys; no engineerstechbd login required.
