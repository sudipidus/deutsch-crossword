import { readFileSync, writeFileSync } from 'fs';

// German case declension rules based on article
function getCases(word, article) {
  const w = word;
  // Genitive endings: masculine/neuter nouns typically add -s or -es
  const needsEs = w.match(/(s|ß|x|z|sch|tsch)$/i);
  const shortWord = w.length <= 3;
  const genEnding = needsEs || shortWord ? 'es' : 's';

  if (article === 'der') {
    return {
      nominative: `der ${w}`,
      accusative: `den ${w}`,
      dative: `dem ${w}`,
      genitive: `des ${w}${genEnding}`,
    };
  } else if (article === 'die') {
    return {
      nominative: `die ${w}`,
      accusative: `die ${w}`,
      dative: `der ${w}`,
      genitive: `der ${w}`,
    };
  } else if (article === 'das') {
    return {
      nominative: `das ${w}`,
      accusative: `das ${w}`,
      dative: `dem ${w}`,
      genitive: `des ${w}${genEnding}`,
    };
  }
  return null;
}

function getGender(article) {
  if (article === 'der') return 'masculine';
  if (article === 'die') return 'feminine';
  if (article === 'das') return 'neuter';
  return null;
}

// Common plural patterns (best-effort heuristic)
function guessPlural(word, article) {
  const w = word;
  // -ung, -heit, -keit, -schaft, -tion, -ik -> +en
  if (w.match(/(ung|heit|keit|schaft|tion|ik)$/i)) return w + 'en';
  // -e -> +n
  if (w.match(/e$/i)) return w + 'n';
  // -er, -el, -en -> same or umlaut (keep same as approximation)
  if (w.match(/(er|el|en)$/i)) return w;
  // -nis -> -nisse
  if (w.match(/nis$/i)) return w + 'se';
  // feminine -in -> -innen
  if (w.match(/in$/i) && article === 'die') return w + 'nen';
  // masculine/neuter short words often add -e or umlaut+e
  if (article === 'der' || article === 'das') return w + 'e';
  // default
  return w + 'en';
}

function enrichFile(path) {
  const words = JSON.parse(readFileSync(path, 'utf-8'));

  const enriched = words.map(entry => {
    if (entry.details) return entry; // already enriched

    const cases = entry.article ? getCases(entry.word, entry.article) : null;
    const gender = entry.article ? getGender(entry.article) : null;
    const plural = guessPlural(entry.word, entry.article);

    return {
      ...entry,
      details: {
        plural,
        gender,
        cases,
        etymology: '',
        examples: [],
        usage: '',
      },
    };
  });

  writeFileSync(path, JSON.stringify(enriched, null, 2) + '\n');
  console.log(`Enriched ${enriched.length} words in ${path}`);
}

enrichFile('src/data/a1.json');
enrichFile('src/data/a2.json');
enrichFile('src/data/b1.json');
