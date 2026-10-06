import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import { PageHeader, buttonClass } from '../components/PageHeader';
import { useI18n } from '../i18n/I18nContext';

export function NotFoundPage() {
  const { t, to } = useI18n();
  return (
    <div className="space-y-6">
      <PageHeader icon={Compass} eyebrow={t.notFound.eyebrow} title={t.notFound.title} description={t.notFound.body} />
      <Link to={to('/')} className={buttonClass('primary')}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t.notFound.home}
      </Link>
    </div>
  );
}
