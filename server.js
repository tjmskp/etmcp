
const express = require('express');
const fetch = require('node-fetch');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DB_URL });

// Bearer Auth
async function auth(req, res, next){
  const token = req.headers.authorization?.split(' ')[1];
  const result = await pool.query("SELECT * FROM mcp_users WHERE api_key=$1", [token]);
  if(!result.rows.length) return res.status(403).send("Unauthorized");
  next();
}

// MCP PROCESS
app.post('/api/mcp/process', auth, async (req, res)=>{
  const { message, user_id } = req.body;

  const intent = await detectIntent(message);
  const services = await mapService(intent.intent);
  const response = await generateResponse(message, services);
  const lead = qualifyLead(intent);

  await pool.query(
    "INSERT INTO mcp_logs (id, request, response, created_at) VALUES ($1,$2,$3,NOW())",
    [uuid(), req.body, {intent, services, response}]
  );

  res.json({ intent, services, response, lead });
});

// Intent
async function detectIntent(message){
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method:"POST",
    headers:{
      "Authorization":`Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      model:"gpt-4o-mini",
      messages:[{role:"user", content:`Classify intent: ${message}`}]
    })
  });
  const d = await r.json();
  return { intent:"general_query", confidence:0.7 };
}

// Mapping
async function mapService(intent){
  const r = await pool.query("SELECT services FROM mcp_service_mapping WHERE intent=$1",[intent]);
  return r.rows[0]?.services || [];
}

// Response
async function generateResponse(msg, services){
  return `Recommended: ${services.join(", ")}`;
}

// Lead
function qualifyLead(intent){
  return { score:70, status:"qualified" };
}

function uuid(){ return require('crypto').randomUUID(); }

app.listen(3000, ()=>console.log("MCP running"));
