import { FunctionComponent, useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import YourCvCard from './YourCvCard';
import AnalysisContextCard from './AnalysisContextCard';
import CvAnalysisReadyPanel from './CvAnalysisReadyPanel';
import { CV_ANALYSIS_TOOL_CV_FILE } from '../data/cvAnalysisToolMock';
import {
  CV_ANALYSIS_TOOL_ANALYZE_WRAPPER,
  CV_ANALYSIS_TOOL_GRID,
  CV_ANALYSIS_TOOL_LEFT_COLUMN,
} from '../constants/cvAnalysisToolLayout';
import { CV_TOOL_PRIMARY_BUTTON } from '../constants/cvAnalysisToolStyles';

interface CvAnalysisToolMainProps {
  onAnalyze?: () => void;
}

const CvAnalysisToolMain: FunctionComponent<CvAnalysisToolMainProps> = ({ onAnalyze }) => {
  const handleAnalyze = useCallback(() => {
    onAnalyze?.();
  }, [onAnalyze]);

  const handleUpload = useCallback(() => {
    // Préparé pour upload CV
  }, []);

  const handleSelectOffer = useCallback(() => {
    // Préparé pour sélection d'offre
  }, []);

  const handleAttachDocument = useCallback(() => {
    // Préparé pour pièce jointe
  }, []);

  return (
    <div className={CV_ANALYSIS_TOOL_GRID}>
      <div className={CV_ANALYSIS_TOOL_LEFT_COLUMN}>
        <YourCvCard cvFile={CV_ANALYSIS_TOOL_CV_FILE} onUploadClick={handleUpload} />
        <AnalysisContextCard
          onSelectOffer={handleSelectOffer}
          onAttachDocument={handleAttachDocument}
        />
        <div className={CV_ANALYSIS_TOOL_ANALYZE_WRAPPER}>
          <button type="button" className={CV_TOOL_PRIMARY_BUTTON} onClick={handleAnalyze}>
            <Sparkles className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            Analyze CV
          </button>
        </div>
      </div>

      <CvAnalysisReadyPanel />
    </div>
  );
};

export default CvAnalysisToolMain;
