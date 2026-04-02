const keywordIntentMap = [
  { intent: 'sales_inquiry', keywords: ['price', 'cost', 'quote', 'purchase', 'buy'] },
  { intent: 'technical_support', keywords: ['error', 'bug', 'issue', 'problem', 'help'] },
  { intent: 'product_info', keywords: ['feature', 'capability', 'what', 'how', 'details'] },
  { intent: 'lead_generation', keywords: ['interested', 'signup', 'contact', 'demo', 'trial'] },
];

function fallbackIntentDetection(message) {
  const lower = message.toLowerCase();
  for (const mapping of keywordIntentMap) {
    if (mapping.keywords.some((w) => lower.includes(w))) {
      return { intent: mapping.intent, confidence: 0.55, entities: {} };
    }
  }
  return { intent: 'general_query', confidence: 0.4, entities: {} };
}

module.exports = { fallbackIntentDetection };
