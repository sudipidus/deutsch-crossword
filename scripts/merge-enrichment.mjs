// Merges enrichment files back into main word data files
// Usage: node scripts/merge-enrichment.mjs src/data/a1.json tmp/a1-enriched-*.json

import { readFileSync, writeFileSync } from 'fs';
import { globSync } from 'fs';

const [,, targetFile, ...enrichFiles] = process.argv;

const words = JSON.parse(readFileSync(targetFile, 'utf-8'));
const wordMap = new Map(words.map((w, i) => [w.word, i]));

let merged = 0;
for (const ef of enrichFiles) {
  const enrichments = JSON.parse(readFileSync(ef, 'utf-8'));
  for (const e of enrichments) {
    const idx = wordMap.get(e.word);
    if (idx !== undefined) {
      words[idx].details.etymology = e.etymology || words[idx].details.etymology;
      words[idx].details.examples = e.examples?.length ? e.examples : words[idx].details.examples;
      words[idx].details.usage = e.usage || words[idx].details.usage;
      if (e.plural) words[idx].details.plural = e.plural;
      merged++;
    }
  }
}

writeFileSync(targetFile, JSON.stringify(words, null, 2) + '\n');
console.log(`Merged ${merged} enrichments into ${targetFile}`);
