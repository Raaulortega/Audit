import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Fingerprint, Sparkles, XCircle } from 'lucide-react';
import { Button, Card, CardTitle, PageHeader } from '../components/PageHeader';
import { ReferenceBadges, SeverityBadge } from '../components/SeverityBadge';
import {
  auditJwt,
  decodeJwt,
  isWeakSigningSecret,
  signHs256,
  verifyJwtSignature,
  type DecodedJwt,
} from '../engine/jwt';
import { useI18n } from '../i18n/I18nContext';

function JsonBlock({ value, tone }: { value: Record<string, unknown>; tone: string }) {
  return (
    <pre className={`overflow-x-auto rounded-lg border border-white/10 bg-slate-950/80 p-3 font-mono text-xs ${tone}`}>
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

function TokenSegments({ token }: { token: string }) {
  const [header, payload, signature] = token.trim().replace(/^Bearer\s+/i, '').split('.');
  return (
    <p className="break-all font-mono text-xs leading-relaxed">
      <span className="text-rose-300">{header}</span>
      <span className="text-slate-500">.</span>
      <span className="text-violet-300">{payload}</span>
      <span className="text-slate-500">.</span>
      <span className="text-cyan-300">{signature}</span>
    </p>
  );
}

/**
 * Defensive check: confirms a token verifies with a given secret and warns when
 * that secret is a well-known default. Helps teams audit their own signing keys.
 */
function SignatureTools({ decoded }: { decoded: DecodedJwt }) {
  const { t } = useI18n();
  const [secret, setSecret] = useState('');
  const [verified, setVerified] = useState<boolean | null>(null);
  const alg = String(decoded.header.alg);
  const isHmac = /^HS(256|384|512)$/.test(alg);

  useEffect(() => {
    setVerified(null);
  }, [decoded]);

  if (!isHmac) {
    return (
      <p className="text-sm text-slate-400">
        {t.jwt.nonHmacBefore} <code className="text-slate-200">{alg}</code>
        {t.jwt.nonHmacAfter}
      </p>
    );
  }

  const verify = async () => {
    setVerified(await verifyJwtSignature(decoded, secret));
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-400">{t.jwt.signingIntro}</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={secret}
          onChange={(event) => setSecret(event.target.value)}
          placeholder={t.jwt.secretPlaceholder}
          aria-label={t.jwt.secretPlaceholder}
          className="flex-1 rounded-lg border border-white/10 bg-slate-950/60 px-3 py-1.5 font-mono text-sm text-slate-200 focus:border-emerald-400/60 focus:outline-hidden"
        />
        <Button variant="primary" onClick={verify} disabled={secret.length === 0}>
          {t.jwt.verify}
        </Button>
      </div>

      {verified !== null && (
        <div
          className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
            verified
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
              : 'border-slate-500/30 bg-slate-500/10 text-slate-300'
          }`}
        >
          {verified ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}
          <span>
            {verified ? t.jwt.valid : t.jwt.invalidSignature}
            {verified && isWeakSigningSecret(secret) && (
              <strong className="mt-1 block text-red-300">{t.jwt.weakSecret}</strong>
            )}
          </span>
        </div>
      )}
    </div>
  );
}

const SAMPLE_PAYLOAD = { sub: '1234567890', name: 'Ada Lovelace', role: 'admin', iat: 1_700_000_000 };

export function JwtPage() {
  const { t } = useI18n();
  const [input, setInput] = useState('');

  const decoded = useMemo(() => {
    if (input.trim().length === 0) return null;
    try {
      return { token: decodeJwt(input), error: null as string | null };
    } catch (error) {
      return { token: null, error: error instanceof Error ? error.message : t.jwt.invalid };
    }
  }, [input, t]);

  const issues = useMemo(() => (decoded?.token ? auditJwt(decoded.token) : []), [decoded]);

  const loadSample = async () => {
    // A deliberately weak secret so the audit demonstrates its warnings.
    setInput(await signHs256(SAMPLE_PAYLOAD, 'secret'));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Fingerprint}
        eyebrow={t.jwt.eyebrow}
        title={t.jwt.title}
        description={t.jwt.description}
        actions={
          <>
            <Button onClick={loadSample}>
              <Sparkles className="h-4 w-4" />
              {t.common.loadSample}
            </Button>
            {input && <Button onClick={() => setInput('')}>{t.common.clear}</Button>}
          </>
        }
      />

      <Card>
        <CardTitle hint={t.jwt.tokenHint}>{t.jwt.token}</CardTitle>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="eyJhbGciOi…"
          rows={4}
          spellCheck={false}
          aria-label={t.jwt.tokenAria}
          className="w-full resize-y rounded-lg border border-white/10 bg-slate-950/60 p-3 font-mono text-xs text-slate-200 focus:border-emerald-400/60 focus:outline-hidden"
        />
        {input.trim() && (
          <div className="mt-3 rounded-lg border border-white/10 bg-slate-950/40 p-3">
            <TokenSegments token={input} />
          </div>
        )}
      </Card>

      {decoded?.error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <XCircle className="h-5 w-5 shrink-0" />
          {decoded.error}
        </div>
      )}

      {decoded?.token && (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardTitle hint={t.jwt.headerHint}>{t.jwt.header}</CardTitle>
              <JsonBlock value={decoded.token.header} tone="text-rose-200" />
            </Card>
            <Card>
              <CardTitle hint={t.jwt.payloadHint}>{t.jwt.payload}</CardTitle>
              <JsonBlock value={decoded.token.payload} tone="text-violet-200" />
              <div className="mt-3 space-y-1">
                {Object.entries(t.jwt.timeClaims).map(([claim, label]) => {
                  const value = decoded.token?.payload[claim];
                  if (typeof value !== 'number') return null;
                  return (
                    <p key={claim} className="flex justify-between text-xs text-slate-400">
                      <span>{label}</span>
                      <span className="font-mono text-slate-300">{new Date(value * 1000).toISOString()}</span>
                    </p>
                  );
                })}
              </div>
            </Card>
          </div>

          <Card>
            <CardTitle hint={t.jwt.issues(issues.length)}>{t.jwt.audit}</CardTitle>
            {issues.length === 0 ? (
              <p className="flex items-center gap-2 text-sm text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                {t.jwt.noIssues}
              </p>
            ) : (
              <ul className="space-y-3">
                {issues.map((issue) => (
                  <li key={issue.id} className="rounded-lg border border-white/10 bg-slate-950/40 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <SeverityBadge severity={issue.severity} />
                      <span className="text-sm font-medium text-slate-100">{issue.title}</span>
                      <span className="ml-auto flex gap-1">
                        <ReferenceBadges references={issue.references} />
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">{issue.description}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardTitle>{t.jwt.signingCheck}</CardTitle>
            <SignatureTools decoded={decoded.token} />
          </Card>
        </>
      )}
    </div>
  );
}
