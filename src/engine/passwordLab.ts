export type SecretKind = 'hex' | 'base64url' | 'alphanumeric' | 'symbols';

export interface CrackEstimate {
  scenario: string;
  guessesPerSecond: number;
  seconds: number;
}

export interface PasswordAnalysis {
  length: number;
  charsetSize: number;
  entropyBits: number;
  /** 0 (very weak) – 4 (very strong). */
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  warnings: string[];
  crackTimes: CrackEstimate[];
}

const CHARSETS: Record<SecretKind, string> = {
  hex: '0123456789abcdef',
  base64url: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',
  alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  symbols: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{};:,.?',
};

/** Top entries of public breach corpora (RockYou, HIBP). Matching any of them is instant. */
const COMMON_PASSWORDS = new Set([
  '123456', '123456789', '12345678', '12345', '1234567', '1234567890', '111111', '000000', '123123', '654321',
  'password', 'password1', 'password123', 'passw0rd', 'p@ssw0rd', 'qwerty', 'qwerty123', 'qwertyuiop', 'abc123',
  'letmein', 'welcome', 'welcome1', 'admin', 'admin123', 'root', 'toor', 'iloveyou', 'monkey', 'dragon',
  'football', 'baseball', 'superman', 'batman', 'sunshine', 'princess', 'starwars', 'master', 'shadow', 'michael',
  'trustno1', 'login', 'changeme', 'secret', 'hello123', 'zaq12wsx', '1q2w3e4r', 'asdfghjkl', 'test', 'test123',
]);

const SEQUENCES = ['abcdefghijklmnopqrstuvwxyz', '0123456789', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

/** Attack speeds for a single modern GPU rig; orders of magnitude matter, not exact figures. */
const SCENARIOS: Array<Omit<CrackEstimate, 'seconds'>> = [
  { scenario: 'Online login, rate-limited', guessesPerSecond: 10 },
  { scenario: 'Offline, bcrypt (cost 12)', guessesPerSecond: 1e4 },
  { scenario: 'Offline, SHA-256', guessesPerSecond: 1e10 },
  { scenario: 'Offline, MD5 / NTLM', guessesPerSecond: 1e11 },
];

function charsetSizeOf(password: string): number {
  let size = 0;
  if (/[a-z]/.test(password)) size += 26;
  if (/[A-Z]/.test(password)) size += 26;
  if (/\d/.test(password)) size += 10;
  if (/[^a-zA-Z0-9]/.test(password)) size += 33;
  return size;
}

function hasSequence(password: string): boolean {
  const lower = password.toLowerCase();
  for (const sequence of SEQUENCES) {
    for (let i = 0; i + 4 <= sequence.length; i += 1) {
      const chunk = sequence.slice(i, i + 4);
      if (lower.includes(chunk) || lower.includes([...chunk].reverse().join(''))) return true;
    }
  }
  return false;
}

/**
 * Charset-based entropy with penalties for the patterns crackers try first.
 * It is an estimate, deliberately pessimistic for human-chosen passwords.
 */
export function analyzePassword(password: string): PasswordAnalysis {
  const warnings: string[] = [];
  const charsetSize = charsetSizeOf(password);
  let entropyBits = password.length * Math.log2(Math.max(charsetSize, 1));

  // Undo common "leet" substitutions; crackers apply the same rules.
  const deLeeted = password
    .toLowerCase()
    .replace(/[@4]/g, 'a')
    .replace(/3/g, 'e')
    .replace(/[1!]/g, 'i')
    .replace(/0/g, 'o')
    .replace(/\$/g, 's');
  if (COMMON_PASSWORDS.has(password.toLowerCase()) || COMMON_PASSWORDS.has(deLeeted)) {
    warnings.push('Appears in public breach wordlists — cracked instantly.');
    entropyBits = Math.min(entropyBits, 6);
  }
  if (/(.)\1{2,}/.test(password)) {
    warnings.push('Contains repeated characters (e.g. "aaa").');
    entropyBits *= 0.8;
  }
  if (hasSequence(password)) {
    warnings.push('Contains a keyboard or alphabet sequence (e.g. "1234", "qwer").');
    entropyBits *= 0.75;
  }
  if (/(19|20)\d{2}/.test(password)) {
    warnings.push('Contains a year — a favourite of rule-based attacks.');
    entropyBits -= 6;
  }
  if (password.length > 0 && password.length < 12) warnings.push('Shorter than 12 characters.');
  if (password.length > 0 && charsetSize <= 26) warnings.push('Uses a single character class.');

  entropyBits = Math.max(0, Math.round(entropyBits * 10) / 10);
  const score: PasswordAnalysis['score'] =
    entropyBits < 28 ? 0 : entropyBits < 40 ? 1 : entropyBits < 60 ? 2 : entropyBits < 80 ? 3 : 4;
  const labels = ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'];

  return {
    length: password.length,
    charsetSize,
    entropyBits,
    score,
    label: labels[score],
    warnings,
    // On average an attacker finds the password after searching half the space.
    crackTimes: SCENARIOS.map((scenario) => ({
      ...scenario,
      seconds: 2 ** entropyBits / 2 / scenario.guessesPerSecond,
    })),
  };
}

export function formatDuration(seconds: number): string {
  if (seconds < 1) return 'instantly';
  if (seconds > 3_153_600_000 * 1e6) return 'beyond the age of the universe';
  const units: Array<[string, string, number]> = [
    ['century', 'centuries', 3_153_600_000],
    ['year', 'years', 31_536_000],
    ['day', 'days', 86_400],
    ['hour', 'hours', 3_600],
    ['minute', 'minutes', 60],
    ['second', 'seconds', 1],
  ];
  for (const [singular, plural, size] of units) {
    if (seconds >= size) {
      const value = Math.floor(seconds / size);
      return `${value.toLocaleString('en-US')} ${value === 1 ? singular : plural}`;
    }
  }
  return 'instantly';
}

/** Uniform random index below `max` using rejection sampling (no modulo bias). */
function randomIndex(max: number): number {
  const limit = Math.floor(0x1_0000_0000 / max) * max;
  const buffer = new Uint32Array(1);
  for (;;) {
    crypto.getRandomValues(buffer);
    if (buffer[0] < limit) return buffer[0] % max;
  }
}

export function generateSecret(kind: SecretKind, length: number): string {
  const charset = CHARSETS[kind];
  return Array.from({ length }, () => charset[randomIndex(charset.length)]).join('');
}

export function secretEntropyBits(kind: SecretKind, length: number): number {
  return Math.round(length * Math.log2(CHARSETS[kind].length));
}

export const PASSPHRASE_WORDS = [
  'acid', 'acorn', 'actor', 'agent', 'alarm', 'album', 'alley', 'amber', 'anchor', 'angle', 'ankle', 'apple',
  'apron', 'arena', 'arrow', 'atlas', 'attic', 'audio', 'award', 'bacon', 'badge', 'bagel', 'baker', 'balloon',
  'bamboo', 'banjo', 'barn', 'basil', 'beach', 'beacon', 'beard', 'berry', 'bison', 'blade', 'blanket', 'blaze',
  'bloom', 'board', 'bolt', 'bonus', 'boots', 'bottle', 'brain', 'brass', 'bread', 'brick', 'bridge', 'brush',
  'bucket', 'buffalo', 'bundle', 'butter', 'cabin', 'cable', 'cactus', 'camel', 'camera', 'canal', 'candle', 'canoe',
  'canvas', 'canyon', 'carbon', 'cargo', 'carpet', 'carrot', 'castle', 'cedar', 'cello', 'chalk', 'charm', 'cherry',
  'chess', 'chimney', 'cider', 'cinema', 'circle', 'citrus', 'clock', 'cloud', 'clover', 'cobalt', 'cocoa', 'comet',
  'compass', 'copper', 'coral', 'cotton', 'cougar', 'crane', 'crayon', 'cricket', 'crown', 'crystal', 'cube', 'cycle',
  'dagger', 'daisy', 'dancer', 'delta', 'denim', 'desert', 'diamond', 'diesel', 'dinner', 'dolphin', 'domino', 'donkey',
  'dragon', 'drum', 'eagle', 'earth', 'echo', 'eclipse', 'elbow', 'ember', 'engine', 'falcon', 'fabric', 'feather',
  'fence', 'ferry', 'fiber', 'fiddle', 'flame', 'flask', 'flute', 'forest', 'fossil', 'fountain', 'fox', 'frost',
  'galaxy', 'garden', 'garlic', 'gecko', 'geyser', 'ginger', 'glacier', 'globe', 'goblet', 'granite', 'grape', 'gravel',
  'guitar', 'hammer', 'harbor', 'harp', 'hazel', 'helmet', 'hermit', 'honey', 'horizon', 'hornet', 'hotel', 'iceberg',
  'igloo', 'island', 'ivory', 'jacket', 'jaguar', 'jasmine', 'jelly', 'jungle', 'kayak', 'kernel', 'kettle', 'kiwi',
  'ladder', 'lagoon', 'lantern', 'laser', 'lemon', 'lens', 'lizard', 'llama', 'lobster', 'locket', 'lotus', 'magnet',
  'mango', 'maple', 'marble', 'meadow', 'melon', 'meteor', 'mirror', 'mosaic', 'mountain', 'mural', 'nectar', 'needle',
  'nickel', 'noodle', 'oasis', 'ocean', 'olive', 'onion', 'orbit', 'orchid', 'otter', 'oyster', 'paddle', 'palace',
  'panda', 'paper', 'parrot', 'pebble', 'pepper', 'piano', 'pickle', 'pilot', 'pixel', 'planet', 'plaza', 'pocket',
  'pollen', 'prism', 'puzzle', 'quartz', 'quiver', 'rabbit', 'radar', 'raven', 'reef', 'ribbon', 'river', 'rocket',
  'saddle', 'salmon', 'satin', 'scarf', 'shadow', 'signal', 'silver', 'sketch', 'socket', 'spiral', 'sponge', 'spruce',
  'statue', 'summit', 'tablet', 'teapot', 'temple', 'thunder', 'tiger', 'timber', 'tomato', 'tundra', 'tunnel', 'turtle',
  'velvet', 'violin', 'walnut', 'willow',
];

export function generatePassphrase(words: number, separator: string): string {
  return Array.from({ length: words }, () => PASSPHRASE_WORDS[randomIndex(PASSPHRASE_WORDS.length)]).join(separator);
}

export function passphraseEntropyBits(words: number): number {
  return Math.round(words * Math.log2(PASSPHRASE_WORDS.length));
}
