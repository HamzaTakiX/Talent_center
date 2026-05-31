import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, TrendingUp, XCircle } from 'lucide-react';
import type { CvAnalysisResult } from '../../types/cvAnalysis';
import CvAnalysisColumnCard from './CvAnalysisColumnCard';

interface CvAnalysisColumnsGridProps {
  analysis: CvAnalysisResult;
}

const CvAnalysisColumnsGrid: FunctionComponent<CvAnalysisColumnsGridProps> = ({ analysis }) => {
  const { t } = useTranslation();

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
      <CvAnalysisColumnCard
        theme="strengths"
        title={t('student.internshipOffers.cvAnalysis.strengths')}
        icon={<CheckCircle2 className="h-5 w-5 text-[#22c55e]" strokeWidth={2} aria-hidden />}
        data={analysis.strengths}
      />
      <CvAnalysisColumnCard
        theme="weaknesses"
        title={t('student.internshipOffers.cvAnalysis.weaknesses')}
        icon={<XCircle className="h-5 w-5 text-[#ef4444]" strokeWidth={2} aria-hidden />}
        data={analysis.weaknesses}
      />
      <CvAnalysisColumnCard
        theme="improvements"
        title={t('student.internshipOffers.cvAnalysis.improvements')}
        icon={<TrendingUp className="h-5 w-5 text-[#155dfc]" strokeWidth={2} aria-hidden />}
        data={analysis.improvements}
      />
    </div>
  );
};

export default CvAnalysisColumnsGrid;
