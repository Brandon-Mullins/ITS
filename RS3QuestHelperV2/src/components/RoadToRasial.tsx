import { useMemo, useState } from 'react';
import type { QuestIndexEntry } from '../types/quest';
import type { PlayerQuestData } from '../utils/quest-match';
import {
  buildRasialGoalPlan,
  setManualQuestStatus,
  clearManualGoalStatus,
  type GoalQuestManualStatus,
} from '../services/goalPlanner';
import { RASIAL_PHASES, RASIAL_SHOPPING_PLACEHOLDER, RASIAL_UNLOCK_GOAL } from '../data/goals/rasialUnlock';
import type { PlannedQuestRow } from '../services/goalPlanner';
import { openWikiUrl } from '../services/storage';

interface RoadToRasialProps {
  playerData: PlayerQuestData | null;
  questIndex: QuestIndexEntry[];
  manualStatus?: Record<string, Record<string, GoalQuestManualStatus>>;
  onManualStatusChange: (status: Record<string, Record<string, GoalQuestManualStatus>>) => void;
  onStartQuest: (pageName: string) => void;
  onBack: () => void;
}

function statusLabel(status: GoalQuestManualStatus): string {
  switch (status) {
    case 'completed': return 'COMPLETED';
    case 'started': return 'STARTED';
    case 'ready': return 'READY';
    default: return 'LOCKED';
  }
}

function statusClass(status: GoalQuestManualStatus): string {
  return `rasial-status rasial-status-${status}`;
}

function QuestRow({
  quest,
  onStartQuest,
  onSetStatus,
  travelOpen,
  onToggleTravel,
}: {
  quest: PlannedQuestRow;
  onStartQuest: (pageName: string) => void;
  onSetStatus: (status: GoalQuestManualStatus) => void;
  travelOpen: boolean;
  onToggleTravel: () => void;
}) {
  return (
    <article className={`rasial-quest-row ${statusClass(quest.status)}`}>
      <div className="rasial-quest-head">
        <span className={`status-pill pill-${quest.status === 'ready' ? 'available' : quest.status === 'started' ? 'in_progress' : quest.status}`}>
          {statusLabel(quest.status)}
        </span>
        <h4 className="rasial-quest-name">{quest.name}</h4>
        <span className="rasial-quest-type">{quest.type}</span>
      </div>
      <div className="rasial-quest-meta">
        <span className="rasial-quest-phase">{quest.phase}</span>
        <span className="rasial-quest-time">⏱ {quest.estimatedTime}</span>
      </div>
      <p className="rasial-quest-why"><strong>Why:</strong> {quest.whyRequired}</p>
      <div className="rasial-quest-loc">
        {quest.startNpc && <span>Start NPC: {quest.startNpc}</span>}
        <span>📍 {quest.startLocation}</span>
      </div>
      <p className="rasial-quest-route"><strong>Fastest:</strong> {quest.fastestRoute}</p>
      {quest.combatNotes && <p className="rasial-quest-combat">⚔ {quest.combatNotes}</p>}
      {quest.missingPrerequisiteNames.length > 0 && (
        <p className="rasial-quest-missing">Missing: {quest.missingPrerequisiteNames.join(', ')}</p>
      )}
      {quest.needsGuidePolish && <span className="rasial-polish-badge">Needs full guide polish</span>}
      <div className="rasial-quest-actions">
        <button type="button" className="btn-primary btn-sm" onClick={() => onStartQuest(quest.pageName)}>
          Open Guide
        </button>
        <button type="button" className="btn-secondary btn-sm" onClick={onToggleTravel}>
          {travelOpen ? 'Hide route' : 'Show route'}
        </button>
        <button type="button" className="btn-ghost btn-sm" onClick={() => openWikiUrl(`https://runescape.wiki/w/${encodeURIComponent(quest.pageName.replace(/ /g, '_'))}`)}>
          Wiki
        </button>
      </div>
      {travelOpen && (
        <div className="rasial-travel-panel">
          <div className="rasial-travel-step"><span>1</span> Teleport: {quest.fastestRoute.split('→')[0].trim()}</div>
          <div className="rasial-travel-step"><span>2</span> Run: {quest.fastestRoute.includes('→') ? quest.fastestRoute.split('→').slice(1).join('→').trim() : 'Follow fastest route above'}</div>
          <div className="rasial-travel-step"><span>3</span> Destination: {quest.startNpc ?? quest.startLocation}</div>
          {quest.alternatives && quest.alternatives.length > 0 && (
            <div className="rasial-travel-notes">Notes: {quest.alternatives.join(' · ')}</div>
          )}
        </div>
      )}
      <div className="rasial-manual-toggles">
        <span className="rasial-manual-label">Mark status:</span>
        {(['completed', 'started', 'ready', 'locked'] as GoalQuestManualStatus[]).map((st) => (
          <button
            key={st}
            type="button"
            className={`rasial-manual-btn ${quest.status === st ? 'active' : ''}`}
            onClick={() => onSetStatus(st)}
          >
            {st}
          </button>
        ))}
      </div>
    </article>
  );
}

export default function RoadToRasial({
  playerData,
  questIndex,
  manualStatus,
  onManualStatusChange,
  onStartQuest,
  onBack,
}: RoadToRasialProps) {
  const [openPhase, setOpenPhase] = useState<number | null>(1);
  const [travelQuestId, setTravelQuestId] = useState<string | null>(null);

  const profile = useMemo(
    () => ({ playerData, manualStatus }),
    [playerData, manualStatus],
  );

  const plan = useMemo(
    () => buildRasialGoalPlan(profile, questIndex),
    [profile, questIndex],
  );

  const phases = useMemo(() => {
    const map = new Map<number, PlannedQuestRow[]>();
    for (const q of plan.quests) {
      const list = map.get(q.phaseNumber) ?? [];
      list.push(q);
      map.set(q.phaseNumber, list);
    }
    return [...map.entries()].sort(([a], [b]) => a - b);
  }, [plan.quests]);

  const missingAll = plan.quests.filter((q) => q.status !== 'completed');
  const nextQuest = plan.next.quest ?? plan.next.blockedQuest;

  const setQuestStatus = (questId: string, status: GoalQuestManualStatus) => {
    onManualStatusChange(setManualQuestStatus(manualStatus, RASIAL_UNLOCK_GOAL.id, questId, status));
  };

  const resetRoadmap = () => {
    onManualStatusChange(clearManualGoalStatus(manualStatus, RASIAL_UNLOCK_GOAL.id));
  };

  const rsn = playerData?.rsn ?? 'No RSN loaded';

  return (
    <div className="rasial-roadmap">
      <header className="rasial-header">
        <button type="button" className="rasial-back-btn" onClick={onBack}>← Goals</button>
        <div className="rasial-header-text">
          <h2 className="rasial-title">🦴 Road to Rasial</h2>
          <p className="rasial-subtitle">Roadmap to Alpha vs Omega and the Rasial boss fight</p>
          <p className="rasial-profile">Profile: {rsn}</p>
        </div>
      </header>

      <div className="rasial-progress-bar-wrap">
        <div className="rasial-progress-label">
          Progress: {plan.completedCount} / {plan.totalCount} requirements completed
        </div>
        <div className="rasial-progress-bar" role="progressbar" aria-valuenow={plan.completedCount} aria-valuemax={plan.totalCount}>
          <div
            className="rasial-progress-fill"
            style={{ width: `${plan.totalCount ? (plan.completedCount / plan.totalCount) * 100 : 0}%` }}
          />
        </div>
        <div className="rasial-estimate">Estimated remaining: {plan.estimatedRemaining}</div>
      </div>

      <section className="rasial-dashboard">
        <div className="rasial-dash-card rasial-dash-next">
          <h3>Next Quest</h3>
          {plan.next.quest ? (
            <>
              <div className="rasial-dash-quest-name">{plan.next.quest.name}</div>
              <p>{plan.next.quest.whyRequired}</p>
              <button type="button" className="btn-primary" onClick={() => onStartQuest(plan.next.quest!.pageName)}>
                Open Guide — {plan.next.quest.name}
              </button>
            </>
          ) : plan.next.blockedQuest ? (
            <>
              <div className="rasial-dash-quest-name">{plan.next.blockedQuest.name}</div>
              <p className="rasial-blocked">{plan.next.blockReason}</p>
            </>
          ) : (
            <p className="rasial-complete-msg">All requirements complete — Rasial unlocked!</p>
          )}
        </div>
        <div className="rasial-dash-card">
          <h3>After This</h3>
          {plan.upcoming.length > 0 ? (
            <ol className="rasial-upcoming-list">
              {plan.upcoming.map((q) => <li key={q.id}>{q.name}</li>)}
            </ol>
          ) : (
            <p>—</p>
          )}
        </div>
        <div className="rasial-dash-card">
          <h3>Final Unlock</h3>
          <p>{RASIAL_UNLOCK_GOAL.finalUnlock}</p>
          <p className="rasial-combat-warn">⚔ Final chain includes high-level Necromancy combat.</p>
        </div>
      </section>

      <div className="rasial-toolbar">
        <button type="button" className="btn-ghost btn-sm" onClick={resetRoadmap}>Reset roadmap</button>
      </div>

      <div className="rasial-panels-grid">
        <section className="rasial-panel rasial-missing-panel">
          <h3>Missing Requirements</h3>
          {missingAll.length === 0 ? (
            <p>None — you are ready for Rasial!</p>
          ) : (
            <ul className="rasial-missing-list">
              {missingAll.slice(0, 8).map((q) => (
                <li key={q.id}>{q.name}{q.missingPrerequisiteNames.length > 0 && ` (needs ${q.missingPrerequisiteNames.join(', ')})`}</li>
              ))}
              {missingAll.length > 8 && <li>…and {missingAll.length - 8} more</li>}
            </ul>
          )}
        </section>

        <section className="rasial-panel rasial-shop-panel">
          <h3>Shopping List</h3>
          <p className="rasial-shop-note">Shopping list is being built from quest data. Open each guide for known items.</p>
          <ul className="rasial-shop-list">
            {RASIAL_SHOPPING_PLACEHOLDER.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>

        <section className="rasial-panel rasial-travel-summary">
          <h3>Travel Plan</h3>
          {nextQuest ? (
            <>
              <p><strong>{nextQuest.name}</strong></p>
              <p>{nextQuest.fastestRoute}</p>
              <p>📍 {nextQuest.startLocation}</p>
            </>
          ) : (
            <p>All travel complete.</p>
          )}
        </section>
      </div>

      <section className="rasial-phases">
        <h3>Full Roadmap</h3>
        {phases.map(([phaseNum, quests]) => (
          <details
            key={phaseNum}
            className="rasial-phase"
            open={openPhase === phaseNum}
            onToggle={(e) => setOpenPhase((e.currentTarget as HTMLDetailsElement).open ? phaseNum : null)}
          >
            <summary className="rasial-phase-summary">
              {RASIAL_PHASES[phaseNum as keyof typeof RASIAL_PHASES] ?? `Phase ${phaseNum}`}
              <span className="rasial-phase-count">
                {quests.filter((q) => q.status === 'completed').length}/{quests.length}
              </span>
            </summary>
            <div className="rasial-phase-quests">
              {quests.map((quest) => (
                <QuestRow
                  key={quest.id}
                  quest={quest}
                  onStartQuest={onStartQuest}
                  onSetStatus={(st) => setQuestStatus(quest.id, st)}
                  travelOpen={travelQuestId === quest.id}
                  onToggleTravel={() => setTravelQuestId((id) => (id === quest.id ? null : quest.id))}
                />
              ))}
            </div>
          </details>
        ))}

        <details className="rasial-phase rasial-phase-boss">
          <summary className="rasial-phase-summary">{RASIAL_PHASES[6]}</summary>
          <div className="rasial-boss-unlock">
            <p>🦴 <strong>Rasial, the First Necromancer</strong> boss fight unlocked after Alpha vs Omega.</p>
            <p>{RASIAL_UNLOCK_GOAL.finalUnlock}</p>
          </div>
        </details>
      </section>
    </div>
  );
}
