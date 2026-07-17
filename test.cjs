const draft = require('./src/data/draft.json');
const mockResults = require('./src/data/mockResults.json');

const normalize = (s) => (s || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

const sentences = draft.text.split(/(?<=[.!?])\s*/);

console.log("Sentences length:", sentences.length);
sentences.forEach((sentence, idx) => {
  const text = sentence.trim();
  if (!text) return;
  const normalizedText = normalize(text);
  
  const matchedClaim = mockResults.claims.find(c => {
    const normClaim = normalize(c.claim_text);
    return normClaim.length > 5 && normalizedText.includes(normClaim);
  });
  
  console.log(`Sentence ${idx}: [${text}] => Matched: ${matchedClaim ? matchedClaim.id : 'NONE'}`);
});
