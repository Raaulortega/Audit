import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { useI18n } from '../i18n/I18nContext';

export function NotFoundPage() {
  const { t, to } = useI18n();
  return (
    <div className="space-y-6">
      <PageHeader icon={Compass} eyebrow={t.notFound.eyebrow} title={t.notFound.title} description={t.notFound.body} />
      <Link
        to={to('/')}
        className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.notFound.home}
      </Link>
    </div>
  );
}
