CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS mcp_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'system')),
  api_key TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mcp_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES mcp_users(id) ON DELETE SET NULL,
  platform TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mcp_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES mcp_conversations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL,
  content TEXT NOT NULL,
  intent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mcp_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  email TEXT,
  phone TEXT,
  intent TEXT,
  score INTEGER,
  status TEXT CHECK(status IN ('new','qualified','high_value')),
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mcp_service_mapping (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  intent TEXT NOT NULL UNIQUE,
  services JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS mcp_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request JSONB,
  response JSONB,
  error TEXT,
  platform TEXT,
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mcp_settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS mcp_training_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT CHECK(type IN ('json', 'text')) NOT NULL,
  payload JSONB NOT NULL,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mcp_users_api_key ON mcp_users(api_key);
CREATE INDEX IF NOT EXISTS idx_mcp_conversations_user_id ON mcp_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_mcp_messages_conversation_id ON mcp_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_mcp_leads_status ON mcp_leads(status);
CREATE INDEX IF NOT EXISTS idx_mcp_service_mapping_intent ON mcp_service_mapping(intent);
CREATE INDEX IF NOT EXISTS idx_mcp_logs_created_at ON mcp_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_mcp_training_data_name ON mcp_training_data(name);
