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

// The three token parts keep their own colors (not severity colors). Each is at least 4.5:1 on its surface.
const SEGMENT = {
  header: 'text-[#b0175b] dark:text-[#ff85b8]',
  payload: 'text-[#7a3db8] dark:text-[#d0a6ff]',
  signature: 'text-[#00707a] dark:text-[#5fd4dc]',
};

function JsonBlock({ value, tone }: { value: Record<string, unknown>; tone: string }) {
  return (
    <pre className={`overflow-x-auto rounded-[14px] border border-separator bg-code p-3.5 font-mono text-footnote ${tone}`}>
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

function TokenSegments({ token }: { token: string }) {
  const [header, payload, signature] = token.trim().replace(/^Bearer\s+/i, '').split('.');
  return (
    <p className="break-all font-mono text-footnote leading-relaxed">
      <span className={SEGMENT.header}>{header}</span>
      <span className="text-label-2">.</span>
      <span className={SEGMENT.payload}>{payload}</span>
      <span className="text-label-2">.</span>
      <span className={SEGMENT.signature}>{signature}</span>
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
      <p className="text-subhead text-label-2">
        {t.jwt.nonHmacBefore} <code className="font-mono text-label">{alg}</code>
        {t.jwt.nonHmacAfter}
      </p>
    );
  }

  const verify = async () => {
    setVerified(await verifyJwtSignature(decoded, secret));
  };

  return (
    <div className="space-y-3">
      <p className="text-subhead text-label-2">{t.jwt.signingIntro}</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={secret}
          onChange={(event) => setSecret(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && secret.length > 0 && verify()}
          placeholder={t.jwt.secretPlaceholder}
          aria-label={t.jwt.secretPlaceholder}
          autoComplete="off"
          className="field h-11 flex-1 px-3 font-mono text-subhead lg:h-9"
        />
        <Button variant="primary" onClick={verify} disabled={secret.length === 0}>
          {t.jwt.verify}
        </Button>
      </div>

      {verified !== null && (
        <div
          role="status"
          className={`flex items-start gap-2 rounded-[14px] px-4 py-3 text-subhead ${
            verified ? 'bg-tint-soft text-label' : 'bg-fill text-label'
          }`}
        >
          {verified ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-tint" aria-hidden="true" />
          ) : (
            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-label-2" aria-hidden="true" />
          )}
          <span>
            {verified ? t.jwt.valid : t.jwt.invalidSignature}
            {verified && isWeakSigningSecret(secret) && (
              <strong className="mt-1 block font-semibold text-critical">{t.jwt.weakSecret}</strong>
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
              <Sparkles className="h-4 w-4" aria-hidden="true" />
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
          className="field resize-y p-3 font-mono text-footnote"
        />
        {input.trim() && (
          <div className="mt-3 rounded-[14px] bg-code p-3.5">
            <TokenSegments token={input} />
          </div>
        )}
      </Card>

      {decoded?.error && (
        <div role="alert" className="card flex items-center gap-3 bg-critical-soft px-5 py-4 text-subhead font-medium text-critical">
          <XCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          {decoded.error}
        </div>
      )}

      {decoded?.token && (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="min-w-0">
              <CardTitle hint={t.jwt.headerHint}>{t.jwt.header}</CardTitle>
              <JsonBlock value={decoded.token.header} tone={SEGMENT.header} />
            </Card>
            <Card className="min-w-0">
              <CardTitle hint={t.jwt.payloadHint}>{t.jwt.payload}</CardTitle>
              <JsonBlock value={decoded.token.payload} tone={SEGMENT.payload} />
              <dl className="mt-3 space-y-1.5">
                {Object.entries(t.jwt.timeClaims).map(([claim, label]) => {
                  const value = decoded.token?.payload[claim];
                  if (typeof value !== 'number') return null;
                  return (
                    <div key={claim} className="flex justify-between gap-3 text-footnote">
                      <dt className="text-label-2">{label}</dt>
                      <dd className="font-mono text-label">{new Date(value * 1000).toISOString()}</dd>
                    </div>
                  );
                })}
              </dl>
            </Card>
          </div>

          <Card>
            <CardTitle hint={t.jwt.issues(issues.length)}>{t.jwt.audit}</CardTitle>
            {issues.length === 0 ? (
              <p className="flex items-center gap-2 text-subhead font-medium text-tint">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                {t.jwt.noIssues}
              </p>
            ) : (
              <ul className="divide-y divide-separator overflow-hidden rounded-[14px] bg-fill">
                {issues.map((issue) => (
                  <li key={issue.id} className="p-3.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <SeverityBadge severity={issue.severity} />
                      <span className="text-subhead font-semibold text-label">{issue.title}</span>
                      <span className="ml-auto flex gap-1">
                        <ReferenceBadges references={issue.references} />
                      </span>
                    </div>
                    <p className="mt-1.5 text-footnote text-label-2">{issue.description}</p>
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
