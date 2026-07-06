import type { QuestGuide, QuestProgress, ProgressUpdater } from '../types/quest';
import type { PlayerQuestData } from '../utils/quest-match';
import { QuestHelperPanelWithDetect } from './QuestHelperPanel';

interface QuestGuideViewProps {
  guide: QuestGuide | null;
  progress: QuestProgress | null;
  loading: boolean;
  questStatus?: string | null;
  playerData?: PlayerQuestData | null;
  uiMode?: 'newbie' | 'veteran' | 'standard';
  isAttached?: boolean;
  highlightSettings?: import('../types/quest').AppSettings;
  onHighlightSettingsChange?: (updates: Partial<import('../types/quest').AppSettings>) => void;
  onBack: () => void;
  onRefresh: () => void;
  onProgressChange: (updates: ProgressUpdater) => void;
  onDetach?: () => void;
}

export default function QuestGuideView({
  guide,
  progress,
  loading,
  playerData = null,
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
      playerData={playerData}
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
