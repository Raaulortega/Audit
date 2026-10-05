import { useMemo, useState } from 'react';
import { Eye, EyeOff, LockKeyhole, RefreshCw } from 'lucide-react';
import { Button, Card, CardTitle, PageHeader } from '../components/PageHeader';
import { CodeSnippet } from '../components/CodeSnippet';
import {
  analyzePassword,
  formatDuration,
  generatePassphrase,
  generateSecret,
  passphraseEntropyBits,
  secretEntropyBits,
  type SecretKind,
} from '../engine/passwordLab';

const STRENGTH_COLORS = ['#f87171', '#fb923c', '#fbbf24', '#34d399', '#10b981'];
const SECRET_KINDS: Array<{ id: SecretKind; label: string }> = [
  { id: 'base64url', label: 'Base64url' },
  { id: 'hex', label: 'Hex' },
  { id: 'alphanumeric', label: 'Alphanumeric' },
  { id: 'symbols', label: 'With symbols' },
];

function StrengthMeter({ score }: { score: number }) {
  return (
    <div className="flex gap-1.5">
      {[0, 1, 2, 3, 4].map((segment) => (
        <div
          key={segment}
          className="h-1.5 flex-1 rounded-full transition-colors"
          style={{ backgroundColor: segment <= score ? STRENGTH_COLORS[score] : 'rgba(255,255,255,0.1)' }}
        />
      ))}
    </div>
  );
}

function StrengthChecker() {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const analysis = useMemo(() => analyzePassword(password), [password]);

  return (
    <Card>
      <CardTitle hint="Runs locally — nothing is sent anywhere">Strength checker</CardTitle>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Type or paste a password to test"
          aria-label="Password to test"
          autoComplete="off"
          className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 pr-10 font-mono text-sm text-slate-200 focus:border-emerald-400/60 focus:outline-hidden"
        />
        <button
          type="button"
          onClick={() => setShow((value) => !value)}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-300"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {password.length > 0 && (
        <div className="mt-4 space-y-4">
          <StrengthMeter score={analysis.score} />
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="font-semibold" style={{ color: STRENGTH_COLORS[analysis.score] }}>
              {analysis.label}
            </span>
            <span className="text-slate-400">
              {analysis.entropyBits} bits · {analysis.length} chars
            </span>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Estimated time to guess (offline attack)
            </p>
            <ul className="space-y-1">
              {analysis.crackTimes.map((estimate) => (
                <li key={estimate.scenario} className="flex justify-between gap-3 text-xs">
                  <span className="text-slate-400">{estimate.scenario}</span>
                  <span className="font-mono text-slate-200">{formatDuration(estimate.seconds)}</span>
                </li>
              ))}
            </ul>
          </div>

          {analysis.warnings.length > 0 && (
            <ul className="space-y-1 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-200/90">
              {analysis.warnings.map((warning) => (
                <li key={warning}>• {warning}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Card>
  );
}

function SecretGenerator() {
  const [kind, setKind] = useState<SecretKind>('base64url');
  const [length, setLength] = useState(32);
  const [value, setValue] = useState(() => generateSecret('base64url', 32));

  const regenerate = (nextKind = kind, nextLength = length) => setValue(generateSecret(nextKind, nextLength));

  return (
    <Card>
      <CardTitle hint={`${secretEntropyBits(kind, length)} bits of entropy`}>Secret generator</CardTitle>
      <p className="mb-3 text-xs text-slate-500">
        Uses the browser’s cryptographic RNG (<code className="text-slate-300">crypto.getRandomValues</code>). Ideal for
        JWT secrets, API keys and session keys.
      </p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {SECRET_KINDS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => {
              setKind(option.id);
              regenerate(option.id, length);
            }}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              kind === option.id
                ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-300'
                : 'border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <label className="mb-3 block text-xs text-slate-400">
        Length: {length}
        <input
          type="range"
          min={8}
          max={128}
          value={length}
          onChange={(event) => {
            const next = Number(event.target.value);
            setLength(next);
            regenerate(kind, next);
          }}
          className="mt-1 w-full accent-emerald-500"
        />
      </label>
      <CodeSnippet code={value} copyLabel="Copy secret" />
      <div className="mt-3">
        <Button variant="primary" onClick={() => regenerate()}>
          <RefreshCw className="h-4 w-4" />
          Regenerate
        </Button>
      </div>
    </Card>
  );
}

function PassphraseGenerator() {
  const [words, setWords] = useState(5);
  const [separator, setSeparator] = useState('-');
  const [value, setValue] = useState(() => generatePassphrase(5, '-'));

  const regenerate = (nextWords = words, nextSeparator = separator) =>
    setValue(generatePassphrase(nextWords, nextSeparator));

  return (
    <Card>
      <CardTitle hint={`~${passphraseEntropyBits(words)} bits`}>Passphrase generator</CardTitle>
      <p className="mb-3 text-xs text-slate-500">
        Memorable and strong — good for disk encryption or a password manager’s master password.
      </p>
      <label className="mb-3 block text-xs text-slate-400">
        Words: {words}
        <input
          type="range"
          min={3}
          max={10}
          value={words}
          onChange={(event) => {
            const next = Number(event.target.value);
            setWords(next);
            regenerate(next, separator);
          }}
          className="mt-1 w-full accent-emerald-500"
        />
      </label>
      <div className="mb-3 flex gap-1.5">
        {['-', '.', '_', ' '].map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              setSeparator(option);
              regenerate(words, option);
            }}
            aria-label={`Separator ${option === ' ' ? 'space' : option}`}
            className={`h-8 w-8 rounded-lg border text-xs transition-colors ${
              separator === option
                ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-300'
                : 'border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            {option === ' ' ? '␣' : option}
          </button>
        ))}
      </div>
      <CodeSnippet code={value} copyLabel="Copy passphrase" />
      <div className="mt-3">
        <Button variant="primary" onClick={() => regenerate()}>
          <RefreshCw className="h-4 w-4" />
          Regenerate
        </Button>
      </div>
    </Card>
  );
}

export function PasswordLabPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={LockKeyhole}
        eyebrow="Toolkit"
        title="Password & secret lab"
        description="Estimate how long a password resists an offline attack, and generate cryptographically secure secrets and passphrases. All computation happens in your browser."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <StrengthChecker />
        <SecretGenerator />
        <PassphraseGenerator />
        <Card>
          <CardTitle>How the estimate works</CardTitle>
          <div className="space-y-2 text-sm leading-relaxed text-slate-400">
            <p>
              Entropy is estimated from the character set and length, then reduced for patterns an attacker tries first:
              dictionary words, keyboard runs, repeats and years.
            </p>
            <p>
              Crack times assume an attacker already has the password hash and runs a single modern GPU rig. A slow hash
              like <span className="text-slate-200">bcrypt</span> buys enormous time; a fast one like{' '}
              <span className="text-slate-200">MD5</span> buys almost none.
            </p>
            <p className="text-xs text-slate-500">
              Figures are order-of-magnitude guidance, not a guarantee. When in doubt, add length.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
