import { useMemo, useState, type ReactNode } from 'react';
import { RotateCcw, ShieldCheck } from 'lucide-react';
import { Button, Card, CardTitle, Chip, PageHeader, Segmented, Toggle } from '../components/PageHeader';
import { CodeSnippet } from '../components/CodeSnippet';
import {
  CSP_DIRECTIVES,
  DEFAULT_HEADER_CONFIG,
  HEADER_FORMATS,
  PERMISSIONS_FEATURES,
  REFERRER_POLICIES,
  buildHeaders,
  type HeaderConfig,
} from '../engine/headerBuilder';
import { useI18n } from '../i18n/I18nContext';

/** A labelled native select: system pickers are the most familiar control there is. */
function SelectRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex min-h-11 flex-wrap items-center justify-between gap-x-3 gap-y-1 text-subhead text-label">
      <span className="font-mono text-footnote">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="field h-9 w-auto max-w-full px-3 text-subhead">
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Settings that only apply when their parent switch is on, indented under it. */
function Nested({ children }: { children: ReactNode }) {
  return <div className="ml-1 space-y-1 border-l-2 border-separator pl-4">{children}</div>;
}

export function HeadersPage() {
  const { t } = useI18n();
  const [config, setConfig] = useState<HeaderConfig>(DEFAULT_HEADER_CONFIG);
  const [format, setFormat] = useState<(typeof HEADER_FORMATS)[number]['id']>('vercel');

  const headers = useMemo(() => buildHeaders(config), [config]);
  const output = useMemo(() => {
    const renderer = HEADER_FORMATS.find((entry) => entry.id === format) ?? HEADER_FORMATS[0];
    return renderer.render(headers);
  }, [headers, format]);

  const patch = <K extends keyof HeaderConfig>(key: K, value: HeaderConfig[K]) =>
    setConfig((previous) => ({ ...previous, [key]: value }));

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ShieldCheck}
        eyebrow={t.headers.eyebrow}
        title={t.headers.title}
        description={t.headers.description}
        actions={
          <Button onClick={() => setConfig(DEFAULT_HEADER_CONFIG)}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {t.headers.reset}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardTitle hint="HSTS">{t.headers.transport}</CardTitle>
            <div className="space-y-1">
              <Toggle
                label={<span className="font-mono text-footnote">Strict-Transport-Security</span>}
                checked={config.hsts.enabled}
                onChange={(v) => patch('hsts', { ...config.hsts, enabled: v })}
              />
              {config.hsts.enabled && (
                <Nested>
                  <label className="block py-1 text-footnote text-label-2">
                    {t.headers.maxAge}
                    <input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={config.hsts.maxAge}
                      onChange={(event) => patch('hsts', { ...config.hsts, maxAge: Number(event.target.value) })}
                      className="field mt-1 h-11 px-3 font-mono text-subhead text-label lg:h-9"
                    />
                  </label>
                  <Toggle
                    label={<span className="font-mono text-footnote">includeSubDomains</span>}
                    checked={config.hsts.includeSubDomains}
                    onChange={(v) => patch('hsts', { ...config.hsts, includeSubDomains: v })}
                  />
                  <Toggle
                    label={<span className="font-mono text-footnote">preload</span>}
                    checked={config.hsts.preload}
                    onChange={(v) => patch('hsts', { ...config.hsts, preload: v })}
                  />
                </Nested>
              )}
            </div>
          </Card>

          <Card>
            <CardTitle hint="CSP">Content-Security-Policy</CardTitle>
            <div className="space-y-1">
              <Toggle label={t.headers.enableCsp} checked={config.csp.enabled} onChange={(v) => patch('csp', { ...config.csp, enabled: v })} />
              {config.csp.enabled && (
                <Nested>
                  {CSP_DIRECTIVES.map((directive) => (
                    <label key={directive} className="block py-1 font-mono text-footnote text-label-2">
                      {directive}
                      <input
                        value={config.csp.directives[directive] ?? ''}
                        placeholder={t.headers.unset}
                        spellCheck={false}
                        onChange={(event) =>
                          patch('csp', {
                            ...config.csp,
                            directives: { ...config.csp.directives, [directive]: event.target.value },
                          })
                        }
                        className="field mt-1 h-10 px-3 font-mono text-footnote text-label lg:h-8"
                      />
                    </label>
                  ))}
                  <Toggle
                    label={<span className="font-mono text-footnote">upgrade-insecure-requests</span>}
                    checked={config.csp.upgradeInsecureRequests}
                    onChange={(v) => patch('csp', { ...config.csp, upgradeInsecureRequests: v })}
                  />
                </Nested>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardTitle>{t.headers.framing}</CardTitle>
            <div className="divide-y divide-separator">
              <SelectRow
                label="X-Frame-Options"
                value={config.frameOptions}
                options={['DENY', 'SAMEORIGIN', 'off']}
                onChange={(value) => patch('frameOptions', value as HeaderConfig['frameOptions'])}
              />
              <Toggle
                label={<span className="font-mono text-footnote">X-Content-Type-Options: nosniff</span>}
                checked={config.contentTypeOptions}
                onChange={(v) => patch('contentTypeOptions', v)}
              />
              <SelectRow
                label="Referrer-Policy"
                value={config.referrerPolicy}
                options={REFERRER_POLICIES}
                onChange={(value) => patch('referrerPolicy', value)}
              />
            </div>
          </Card>

          <Card>
            <CardTitle hint={t.headers.permissionsHint}>Permissions-Policy</CardTitle>
            <Toggle
              label={t.headers.enablePermissions}
              checked={config.permissionsPolicy.enabled}
              onChange={(v) => patch('permissionsPolicy', { ...config.permissionsPolicy, enabled: v })}
            />
            {config.permissionsPolicy.enabled && (
              <div className="mt-2 flex flex-wrap gap-2">
                {PERMISSIONS_FEATURES.map((feature) => {
                  const blocked = config.permissionsPolicy.blocked.includes(feature);
                  return (
                    <Chip
                      key={feature}
                      pressed={blocked}
                      onClick={() =>
                        patch('permissionsPolicy', {
                          ...config.permissionsPolicy,
                          blocked: blocked
                            ? config.permissionsPolicy.blocked.filter((item) => item !== feature)
                            : [...config.permissionsPolicy.blocked, feature],
                        })
                      }
                    >
                      <span className="font-mono">{feature}</span>
                    </Chip>
                  );
                })}
              </div>
            )}
            <p className="mt-3 text-footnote text-label-2">{t.headers.permissionsNote}</p>
          </Card>

          <Card>
            <CardTitle>{t.headers.crossOrigin}</CardTitle>
            <div className="divide-y divide-separator">
              <SelectRow
                label="Cross-Origin-Opener-Policy"
                value={config.coop}
                options={['same-origin', 'same-origin-allow-popups', 'off']}
                onChange={(value) => patch('coop', value as HeaderConfig['coop'])}
              />
              <SelectRow
                label="Cross-Origin-Resource-Policy"
                value={config.corp}
                options={['same-origin', 'same-site', 'cross-origin', 'off']}
                onChange={(value) => patch('corp', value as HeaderConfig['corp'])}
              />
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <CardTitle hint={t.headers.headerCount(headers.length)}>{t.headers.output}</CardTitle>
        <div className="mb-3">
          <Segmented
            label={t.headers.output}
            options={HEADER_FORMATS.map((entry) => ({ id: entry.id, label: entry.label }))}
            value={format}
            onChange={setFormat}
          />
        </div>
        {headers.length > 0 ? (
          <CodeSnippet code={output} copyLabel={t.headers.copyConfig} />
        ) : (
          <p className="rounded-[14px] bg-fill px-4 py-6 text-center text-subhead text-label-2">{t.headers.enableOne}</p>
        )}
      </Card>
    </div>
  );
}
