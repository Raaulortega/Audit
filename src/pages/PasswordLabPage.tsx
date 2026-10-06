import { useEffect, useMemo, useState } from 'react';
import { Eye, EyeOff, LockKeyhole, RefreshCw } from 'lucide-react';
import { Button, Card, CardTitle, PageHeader, Segmented } from '../components/PageHeader';
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
import { useI18n } from '../i18n/I18nContext';

// Strength 0-4 mapped onto the semantic palette, so "weak" and "critical" look the same everywhere.
const STRENGTH_COLORS = ['var(--critical)', 'var(--critical)', 'var(--medium)', 'var(--tint)', 'var(--tint)'];
const SECRET_KINDS: SecretKind[] = ['base64url', 'hex', 'alphanumeric', 'symbols'];
const SEPARATORS = ['-', '.', '_', ' '] as const;

function StrengthMeter({ score }: { score: number }) {
  return (
    <div className="flex gap-1.5" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((segment) => (
        <div
          key={segment}
          className="h-1.5 flex-1 rounded-full transition-colors"
          style={{ backgroundColor: segment <= score ? STRENGTH_COLORS[score] : 'var(--fill-strong)' }}
        />
      ))}
    </div>
  );
}

function RangeField({
  label,
  min,
  max,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="mb-4 block text-footnote font-medium text-label-2">
      {label}
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 h-6 w-full cursor-pointer accent-tint"
      />
    </label>
  );
}

function StrengthChecker() {
  const { lang, t } = useI18n();
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const analysis = useMemo(() => analyzePassword(password), [password]);

  return (
    <Card>
      <CardTitle hint={t.passwords.checkerHint}>{t.passwords.checker}</CardTitle>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={t.passwords.placeholder}
          aria-label={t.passwords.aria}
          autoComplete="off"
          className="field h-11 pl-3 pr-12 font-mono text-callout"
        />
        <button
          type="button"
          onClick={() => setShow((value) => !value)}
          aria-label={show ? t.passwords.hide : t.passwords.show}
          aria-pressed={show}
          className="absolute right-0.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-label-2 hover:text-label"
        >
          {show ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>

      {password.length > 0 && (
        <div className="mt-4 space-y-4" aria-live="polite">
          <StrengthMeter score={analysis.score} />
          <div className="flex flex-wrap items-center justify-between gap-2 text-subhead">
            <span className="font-semibold" style={{ color: STRENGTH_COLORS[analysis.score] }}>
              {t.passwords.labels[analysis.score]}
            </span>
            <span className="text-footnote text-label-2">{t.passwords.bitsChars(analysis.entropyBits, analysis.length)}</span>
          </div>

          <div>
            <p className="mb-1.5 text-footnote font-semibold text-label-2">{t.passwords.timeToGuess}</p>
            <dl className="divide-y divide-separator overflow-hidden rounded-[14px] bg-fill">
              {analysis.crackTimes.map((estimate) => (
                <div key={estimate.scenario} className="flex justify-between gap-3 px-3.5 py-2.5 text-footnote">
                  <dt className="text-label-2">{t.passwords.scenarios[estimate.scenario]}</dt>
                  <dd className="font-mono font-medium text-label">{formatDuration(estimate.seconds, lang)}</dd>
                </div>
              ))}
            </dl>
          </div>

          {analysis.warnings.length > 0 && (
            <ul className="list-disc space-y-1 rounded-[14px] bg-medium-soft py-3 pl-8 pr-3.5 text-footnote text-label">
              {analysis.warnings.map((warning) => (
                <li key={warning}>{t.passwords.warnings[warning]}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Card>
  );
}

function SecretGenerator() {
  const { t } = useI18n();
  const [kind, setKind] = useState<SecretKind>('base64url');
  const [length, setLength] = useState(32);
  // Generated after mount: random output would differ from the prerendered HTML.
  const [value, setValue] = useState('');
  useEffect(() => setValue(generateSecret('base64url', 32)), []);

  const regenerate = (nextKind = kind, nextLength = length) => setValue(generateSecret(nextKind, nextLength));

  return (
    <Card>
      <CardTitle hint={t.passwords.entropy(secretEntropyBits(kind, length))}>{t.passwords.generator}</CardTitle>
      <p className="mb-4 text-footnote text-label-2">
        {t.passwords.generatorBefore}
        <code className="font-mono text-label">crypto.getRandomValues</code>
        {t.passwords.generatorAfter}
      </p>
      <div className="mb-4">
        <Segmented
          label={t.passwords.generator}
          options={SECRET_KINDS.map((option) => ({ id: option, label: t.passwords.kinds[option] }))}
          value={kind}
          onChange={(option) => {
            setKind(option);
            regenerate(option, length);
          }}
        />
      </div>
      <RangeField
        label={t.passwords.length(length)}
        min={8}
        max={128}
        value={length}
        onChange={(next) => {
          setLength(next);
          regenerate(kind, next);
        }}
      />
      <CodeSnippet code={value} copyLabel={t.passwords.copySecret} />
      <div className="mt-3">
        <Button onClick={() => regenerate()}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          {t.common.regenerate}
        </Button>
      </div>
    </Card>
  );
}

function PassphraseGenerator() {
  const { t } = useI18n();
  const [words, setWords] = useState(5);
  const [separator, setSeparator] = useState<(typeof SEPARATORS)[number]>('-');
  const [value, setValue] = useState('');
  useEffect(() => setValue(generatePassphrase(5, '-')), []);

  const regenerate = (nextWords = words, nextSeparator: string = separator) =>
    setValue(generatePassphrase(nextWords, nextSeparator));

  return (
    <Card>
      <CardTitle hint={t.passwords.passphraseBits(passphraseEntropyBits(words))}>{t.passwords.passphrase}</CardTitle>
      <p className="mb-4 text-footnote text-label-2">{t.passwords.passphraseIntro}</p>
      <RangeField
        label={t.passwords.words(words)}
        min={3}
        max={10}
        value={words}
        onChange={(next) => {
          setWords(next);
          regenerate(next, separator);
        }}
      />
      <div className="mb-4 w-48">
        <Segmented
          label={t.passwords.separator('')}
          options={SEPARATORS.map((option) => ({
            id: option,
            label: <span className="font-mono">{option === ' ' ? '␣' : option}</span>,
            ariaLabel: t.passwords.separator(option === ' ' ? t.passwords.space : option),
          }))}
          value={separator}
          onChange={(option) => {
            setSeparator(option);
            regenerate(words, option);
          }}
        />
      </div>
      <CodeSnippet code={value} copyLabel={t.passwords.copyPassphrase} />
      <div className="mt-3">
        <Button onClick={() => regenerate()}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          {t.common.regenerate}
        </Button>
      </div>
    </Card>
  );
}

export function PasswordLabPage() {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      <PageHeader icon={LockKeyhole} eyebrow={t.passwords.eyebrow} title={t.passwords.title} description={t.passwords.description} />
      <div className="grid gap-6 lg:grid-cols-2">
        <StrengthChecker />
        <SecretGenerator />
        <PassphraseGenerator />
        <Card>
          <CardTitle>{t.passwords.howTitle}</CardTitle>
          <div className="space-y-2 text-subhead leading-relaxed text-label-2">
            <p>{t.passwords.how1}</p>
            <p>{t.passwords.how2}</p>
            <p className="text-footnote">{t.passwords.how3}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
