const repository = require('../database/mcpRepository');

const intentScore = {
  high_value: ['purchase', 'schedule_demo', 'enterprise_interest'],
  qualified: ['sales_inquiry', 'technical_support', 'lead_generation'],
  new: ['general_query', 'product_info'],
};

function calculateLeadScore(intent, message) {
  let base = 20;
  if (intentScore.high_value.includes(intent)) base = 90;
  else if (intentScore.qualified.includes(intent)) base = 60;
  else base = 35;

  const urgent = ['urgent', 'asap', 'immediately', 'need', 'today'];
  const business = ['project', 'company', 'team', 'budget', 'decide', 'implementation'];

  const lower = message.toLowerCase();
  if (urgent.some((w) => lower.includes(w))) base += 20;
  if (business.some((w) => lower.includes(w))) base += 10;

  return Math.min(100, base);
}

function calculateLeadStatus(score) {
  if (score >= 80) return 'high_value';
  if (score >= 50) return 'qualified';
  return 'new';
}

async function qualifyLead({ intent, message, contact = {} }) {
  const score = calculateLeadScore(intent, message);
  const status = calculateLeadStatus(score);

  const entityLead = {
    name: contact.name || null,
    email: contact.email || null,
    phone: contact.phone || null,
    intent,
    score,
    status,
    source: contact.source || 'unknown',
  };

  if (entityLead.email || entityLead.phone) {
    await repository.insertLead(entityLead);
    return entityLead;
  }

  return { ...entityLead, saved: false };
}

module.exports = { qualifyLead, calculateLeadScore, calculateLeadStatus };
