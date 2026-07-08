import type { QuestStep } from '../types/quest';
import type { ClickTargetCard } from '../utils/click-targets';

interface GpsCurrentObjectiveProps {
  step: QuestStep;
  clickCards: ClickTargetCard[];
  travelRoute?: string;
}

export default function GpsCurrentObjective({ step, clickCards, travelRoute }: GpsCurrentObjectiveProps) {
  const primary = clickCards.find((c) => c.aura === 'blue') ?? clickCards[0];
  const objective = step.objective ?? step.text;

  return (
    <div className="gps-card gps-current-objective">
      <div className="gps-card-label">Current Objective</div>
      <div className="gps-objective-text">{objective}</div>

      {primary && (
        <div className="gps-objective-row">
          <span className="gps-objective-key">Click Target</span>
          <span className="gps-objective-val">
            {primary.kind === 'npc' ? 'NPC' : primary.kind === 'object' ? 'Object' : 'Target'}: {primary.name}
          </span>
        </div>
      )}

      {(step.location || step.locationDetail) && (
        <div className="gps-objective-row">
          <span className="gps-objective-key">Location</span>
          <span className="gps-objective-val">{step.locationDetail ?? step.location}</span>
        </div>
      )}

      {travelRoute && (
        <div className="gps-objective-row">
          <span className="gps-objective-key">Route</span>
          <span className="gps-objective-val">{travelRoute}</span>
        </div>
      )}

      {step.waitNote && (
        <div className="gps-wait-note">⏳ {step.waitNote}</div>
      )}
    </div>
  );
}
