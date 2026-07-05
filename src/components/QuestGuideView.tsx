import type { QuestGuide, QuestProgress } from '../types/quest';
import { QuestHelperPanelWithDetect } from './QuestHelperPanel';

interface QuestGuideViewProps {
  guide: QuestGuide | null;
  progress: QuestProgress | null;
  loading: boolean;
  questStatus?: string | null;
  uiMode?: 'newbie' | 'veteran' | 'standard';
  isAttached?: boolean;
  highlightSettings?: import('../types/quest').AppSettings;
  onHighlightSettingsChange?: (updates: Partial<import('../types/quest').AppSettings>) => void;
  onBack: () => void;
  onRefresh: () => void;
  onProgressChange: (updates: Partial<QuestProgress>) => void;
  onDetach?: () => void;
}

export default function QuestGuideView({
  guide,
  progress,
  loading,
  uiMode = 'standard',
  isAttached,
  highlightSettings,
  onHighlightSettingsChange,
  onBack,
  onRefresh,
  onProgressChange,
  onDetach,
}: QuestGuideViewProps) {
  if (loading || !guide || !progress) {
    return (
      <div className="guide-loading">
        <div className="spinner" />
        <p>Loading guide…</p>
      </div>
    );
  }

  return (
    <QuestHelperPanelWithDetect
      guide={guide}
      progress={progress}
      uiMode={uiMode}
      isAttached={isAttached}
      onBack={onBack}
      onRefresh={onRefresh}
      onProgressChange={onProgressChange}
      onDetach={onDetach}
      highlightSettings={highlightSettings}
      onHighlightSettingsChange={onHighlightSettingsChange}
    />
  );
}
