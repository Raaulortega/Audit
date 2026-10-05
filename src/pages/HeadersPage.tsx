import { useMemo, useState } from 'react';
import { RotateCcw, ShieldCheck } from 'lucide-react';
import { Button, Card, CardTitle, PageHeader } from '../components/PageHeader';
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

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 text-sm text-slate-300">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-white/15'}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${checked ? 'left-4' : 'left-0.5'}`}
        />
      </button>
    </label>
  );
}

export function HeadersPage() {
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
        eyebrow="Toolkit"
        title="Security header builder"
        description="Toggle the headers you need and copy a ready-to-deploy snippet for your platform. Defaults follow OWASP’s Secure Headers project."
        actions={
          <Button onClick={() => setConfig(DEFAULT_HEADER_CONFIG)}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardTitle hint="HSTS">Transport</CardTitle>
            <div className="space-y-3">
              <Toggle label="Strict-Transport-Security" checked={config.hsts.enabled} onChange={(v) => patch('hsts', { ...config.hsts, enabled: v })} />
              {config.hsts.enabled && (
                <div className="space-y-3 border-l border-white/10 pl-3">
                  <label className="block text-xs text-slate-400">
                    max-age (seconds)
                    <input
                      type="number"
                      min={0}
                      value={config.hsts.maxAge}
                      onChange={(event) => patch('hsts', { ...config.hsts, maxAge: Number(event.target.value) })}
                      className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-1.5 text-sm text-slate-200 focus:border-emerald-400/60 focus:outline-hidden"
                    />
                  </label>
                  <Toggle label="includeSubDomains" checked={config.hsts.includeSubDomains} onChange={(v) => patch('hsts', { ...config.hsts, includeSubDomains: v })} />
                  <Toggle label="preload" checked={config.hsts.preload} onChange={(v) => patch('hsts', { ...config.hsts, preload: v })} />
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardTitle hint="CSP">Content-Security-Policy</CardTitle>
            <div className="space-y-3">
              <Toggle label="Enable CSP" checked={config.csp.enabled} onChange={(v) => patch('csp', { ...config.csp, enabled: v })} />
              {config.csp.enabled && (
                <div className="space-y-2 border-l border-white/10 pl-3">
                  {CSP_DIRECTIVES.map((directive) => (
                    <label key={directive} className="block text-xs text-slate-400">
                      {directive}
                      <input
                        value={config.csp.directives[directive] ?? ''}
                        placeholder="(unset)"
                        onChange={(event) =>
                          patch('csp', {
                            ...config.csp,
                            directives: { ...config.csp.directives, [directive]: event.target.value },
                          })
                        }
                        className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/60 px-2 py-1 font-mono text-xs text-slate-200 focus:border-emerald-400/60 focus:outline-hidden"
                      />
                    </label>
                  ))}
                  <Toggle label="upgrade-insecure-requests" checked={config.csp.upgradeInsecureRequests} onChange={(v) => patch('csp', { ...config.csp, upgradeInsecureRequests: v })} />
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardTitle>Framing & typing</CardTitle>
            <div className="space-y-3">
              <label className="flex items-center justify-between gap-3 text-sm text-slate-300">
                X-Frame-Options
                <select
                  value={config.frameOptions}
                  onChange={(event) => patch('frameOptions', event.target.value as HeaderConfig['frameOptions'])}
                  className="rounded-lg border border-white/10 bg-slate-950/60 px-2 py-1 text-sm text-slate-200 focus:border-emerald-400/60 focus:outline-hidden"
                >
                  <option value="DENY">DENY</option>
                  <option value="SAMEORIGIN">SAMEORIGIN</option>
                  <option value="off">off</option>
                </select>
              </label>
              <Toggle label="X-Content-Type-Options: nosniff" checked={config.contentTypeOptions} onChange={(v) => patch('contentTypeOptions', v)} />
              <label className="flex items-center justify-between gap-3 text-sm text-slate-300">
                Referrer-Policy
                <select
                  value={config.referrerPolicy}
                  onChange={(event) => patch('referrerPolicy', event.target.value)}
                  className="rounded-lg border border-white/10 bg-slate-950/60 px-2 py-1 text-sm text-slate-200 focus:border-emerald-400/60 focus:outline-hidden"
                >
                  {REFERRER_POLICIES.map((policy) => (
                    <option key={policy} value={policy}>
                      {policy}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </Card>

          <Card>
            <CardTitle hint="Block browser features">Permissions-Policy</CardTitle>
            <Toggle label="Enable Permissions-Policy" checked={config.permissionsPolicy.enabled} onChange={(v) => patch('permissionsPolicy', { ...config.permissionsPolicy, enabled: v })} />
            {config.permissionsPolicy.enabled && (
              <div className="mt-3 flex flex-wrap gap-1.5 border-l border-white/10 pl-3">
                {PERMISSIONS_FEATURES.map((feature) => {
                  const blocked = config.permissionsPolicy.blocked.includes(feature);
                  return (
                    <button
                      key={feature}
                      type="button"
                      aria-pressed={blocked}
                      onClick={() =>
                        patch('permissionsPolicy', {
                          ...config.permissionsPolicy,
                          blocked: blocked
                            ? config.permissionsPolicy.blocked.filter((item) => item !== feature)
                            : [...config.permissionsPolicy.blocked, feature],
                        })
                      }
                      className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                        blocked
                          ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-300'
                          : 'border-white/10 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {feature}
                    </button>
                  );
                })}
              </div>
            )}
            <p className="mt-2 text-xs text-slate-500">Highlighted features are disabled for the whole origin.</p>
          </Card>

          <Card>
            <CardTitle>Cross-origin isolation</CardTitle>
            <div className="space-y-3">
              <label className="flex items-center justify-between gap-3 text-sm text-slate-300">
                Cross-Origin-Opener-Policy
                <select
                  value={config.coop}
                  onChange={(event) => patch('coop', event.target.value as HeaderConfig['coop'])}
                  className="rounded-lg border border-white/10 bg-slate-950/60 px-2 py-1 text-sm text-slate-200 focus:border-emerald-400/60 focus:outline-hidden"
                >
                  <option value="same-origin">same-origin</option>
                  <option value="same-origin-allow-popups">same-origin-allow-popups</option>
                  <option value="off">off</option>
                </select>
              </label>
              <label className="flex items-center justify-between gap-3 text-sm text-slate-300">
                Cross-Origin-Resource-Policy
                <select
                  value={config.corp}
                  onChange={(event) => patch('corp', event.target.value as HeaderConfig['corp'])}
                  className="rounded-lg border border-white/10 bg-slate-950/60 px-2 py-1 text-sm text-slate-200 focus:border-emerald-400/60 focus:outline-hidden"
                >
                  <option value="same-origin">same-origin</option>
                  <option value="same-site">same-site</option>
                  <option value="cross-origin">cross-origin</option>
                  <option value="off">off</option>
                </select>
              </label>
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <CardTitle hint={`${headers.length} header${headers.length === 1 ? '' : 's'}`}>Output</CardTitle>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {HEADER_FORMATS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setFormat(entry.id)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                format === entry.id
                  ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-300'
                  : 'border-white/10 text-slate-400 hover:text-slate-200'
              }`}
            >
              {entry.label}
            </button>
          ))}
        </div>
        {headers.length > 0 ? (
          <CodeSnippet code={output} copyLabel="Copy config" />
        ) : (
          <p className="rounded-lg border border-white/10 bg-slate-950/40 px-4 py-6 text-center text-sm text-slate-500">
            Enable at least one header.
          </p>
        )}
      </Card>
    </div>
  );
}
