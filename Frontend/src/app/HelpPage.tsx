import React from 'react';
import { Card } from '../components/UI';
import { HelpCircle, FileText, Activity, ShieldCheck, UserCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const HelpPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">{t('help.title')}</h1>
        <p className="text-zinc-500 mt-1">{t('help.subtitle')}</p>
      </header>

      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#000000]" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900">{t('help.reportTitle')}</h2>
          </div>
          <p className="text-zinc-600 text-sm leading-relaxed">
            {t('help.reportDesc')}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-[#000000]" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900">{t('help.lifecycleTitle')}</h2>
          </div>
          <div className="space-y-4">
            <p className="text-zinc-600 text-sm leading-relaxed">
              {t('help.lifecycleSubtitle')}
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <li className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <span className="font-bold text-zinc-900 text-xs block mb-1">{t('help.statuses.submitted.label')}</span>
                <span className="text-[11px] text-zinc-500">{t('help.statuses.submitted.desc')}</span>
              </li>
              <li className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <span className="font-bold text-zinc-900 text-xs block mb-1">{t('help.statuses.underReview.label')}</span>
                <span className="text-[11px] text-zinc-500">{t('help.statuses.underReview.desc')}</span>
              </li>
              <li className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <span className="font-bold text-zinc-900 text-xs block mb-1">{t('help.statuses.assigned.label')}</span>
                <span className="text-[11px] text-zinc-500">{t('help.statuses.assigned.desc')}</span>
              </li>
              <li className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <span className="font-bold text-zinc-900 text-xs block mb-1">{t('help.statuses.inProgress.label')}</span>
                <span className="text-[11px] text-zinc-500">{t('help.statuses.inProgress.desc')}</span>
              </li>
              <li className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <span className="font-bold text-zinc-900 text-xs block mb-1">{t('help.statuses.resolved.label')}</span>
                <span className="text-[11px] text-zinc-500">{t('help.statuses.resolved.desc')}</span>
              </li>
              <li className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <span className="font-bold text-zinc-900 text-xs block mb-1">{t('help.statuses.rejected.label')}</span>
                <span className="text-[11px] text-zinc-500">{t('help.statuses.rejected.desc')}</span>
              </li>
            </ul>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900">{t('help.trackTitle')}</h2>
          </div>
          <p className="text-zinc-600 text-sm leading-relaxed">
            {t('help.trackDesc')}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900">{t('help.adminTitle')}</h2>
          </div>
          <p className="text-zinc-600 text-sm leading-relaxed">
            {t('help.adminDesc')}
          </p>
        </Card>
      </div>
    </div>
  );
};
