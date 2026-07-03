import { useEffect, useMemo, useState } from 'react';
import type { QuestIndexEntry } from '../types/quest';
import type { PlayerQuestData } from '../utils/quest-match';
import { buildPlayerQuestMap, mapPlayerStatus, type QuestPlannerStatus } from '../utils/quest-match';
import { fetchPlayerQuests } from '../services/player';
import { buildPlannerSummary } from '../services/quest-planner';
import { getCuratedQuest } from '../data/quests';
import { DEMO_RSN } from '../plugin-api';

interface QuestSearchProps {
  quests: QuestIndexEntry[];
  playerRsn?: string;
  onPlayerRsnChange: (rsn: string) => void;
  onPlayerData?: (data: PlayerQuestData) => void;
  onSelect: (pageName: string) => void;
  onRefreshIndex: () => void;
}

type FilterType = 'all' | 'quest' | 'miniquest' | 'f2p';
type StatusFilter = 'all' | 'todo' | 'available' | 'in_progress' | 'completed' | 'locked';

const STATUS_LABELS: Record<QuestPlannerStatus, string> = {
  completed: 'Done',
  available: 'Ready',
  in_progress: 'Started',
  locked: 'Locked',
  unknown: '?',
};

export default function QuestSearch({
  quests,
  playerRsn: savedRsn,
  onPlayerRsnChange,
  onPlayerData,
  onSelect,
  onRefreshIndex,
}: QuestSearchProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todo');
  const [rsnInput, setRsnInput] = useState(savedRsn ?? '');
  const [playerData, setPlayerData] = useState<PlayerQuestData | null>(null);
  const [playerLoading, setPlayerLoading] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);

  const playerMap = useMemo(() => {
    if (!playerData) return null;
    return buildPlayerQuestMap(playerData, quests);
  }, [playerData, quests]);

  const planner = useMemo(() => {
    if (!playerData) return null;
    return buildPlannerSummary(playerData, quests);
  }, [playerData, quests]);

  const stats = useMemo(() => {
    if (!playerMap) return null;
    const counts = { completed: 0, available: 0, in_progress: 0, locked: 0, unknown: 0 };
    for (const quest of quests) {
      const pq = playerMap.get(quest.pageName);
      if (!pq) {
        counts.unknown++;
        continue;
      }
      counts[mapPlayerStatus(pq)]++;
    }
    return counts;
  }, [playerMap, quests]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    const list = quests.filter((quest) => {
      if (filter === 'miniquest' && !quest.isMiniquest) return false;
      if (filter === 'quest' && quest.isMiniquest) return false;
      if (filter === 'f2p' && quest.members) return false;
      if (!q) {
        // pass
      } else if (
        !quest.name.toLowerCase().includes(q) &&
        !quest.pageName.toLowerCase().includes(q)
      ) {
        return false;
      }

      if (!playerMap || statusFilter === 'all') return true;

      const pq = playerMap.get(quest.pageName);
      const status = pq ? mapPlayerStatus(pq) : 'unknown';

      if (statusFilter === 'todo') return status === 'available' || status === 'in_progress';
      if (statusFilter === 'available') return status === 'available';
      if (statusFilter === 'in_progress') return status === 'in_progress';
      if (statusFilter === 'completed') return status === 'completed';
      if (statusFilter === 'locked') return status === 'locked';
      return true;
    });

    // Curated official guides first
    return list.sort((a, b) => {
      const aCur = getCuratedQuest(a.pageName) ? 0 : 1;
      const bCur = getCuratedQuest(b.pageName) ? 0 : 1;
      if (aCur !== bCur) return aCur - bCur;
      return a.name.localeCompare(b.name);
    });
  }, [quests, query, filter, playerMap, statusFilter]);

  const loadPlayer = async () => {
    const rsn = rsnInput.trim();
    if (!rsn) return;
    setPlayerLoading(true);
    setPlayerError(null);
    try {
      const data = await fetchPlayerQuests(rsn);
      setPlayerData(data);
      onPlayerData?.(data);
      onPlayerRsnChange(rsn);
    } catch (e) {
      setPlayerError(e instanceof Error ? e.message : 'Failed to load player data');
      setPlayerData(null);
    } finally {
      setPlayerLoading(false);
    }
  };

  useEffect(() => {
    if (savedRsn && savedRsn.trim() && !playerData && !playerLoading) {
      setRsnInput(savedRsn);
      fetchPlayerQuests(savedRsn.trim())
        .then((data) => setPlayerData(data))
        .catch(() => {});
    }
  }, [savedRsn]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="quest-search">
      <div className="search-header">
        <h2>Quest Guide</h2>
        <button type="button" className="btn-ghost btn-sm" onClick={onRefreshIndex} title="Refresh from Wiki">
          ↻ Wiki
        </button>
      </div>

      <div className="player-lookup">
        <input
          type="text"
          className="search-input rsn-input"
          placeholder="Your RuneScape name…"
          value={rsnInput}
          onChange={(e) => setRsnInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && loadPlayer()}
        />
        <button
          type="button"
          className="btn-ghost btn-sm demo-btn"
          onClick={() => setRsnInput(DEMO_RSN)}
          title="Load demo player data"
        >
          Demo
        </button>
        <button
          type="button"
          className="btn-primary btn-load-rsn"
          onClick={loadPlayer}
          disabled={playerLoading || !rsnInput.trim()}
        >
          {playerLoading ? '…' : 'Load'}
        </button>
      </div>

      {playerError && <p className="player-error">{playerError}</p>}

      {playerData && stats && (
        <div className="player-summary">
          <span className="player-name">{playerData.rsn}</span>
          <div className="stat-chips">
            <button
              type="button"
              className={`stat-chip chip-todo ${statusFilter === 'todo' ? 'active' : ''}`}
              onClick={() => setStatusFilter('todo')}
            >
              To do: {stats.available + stats.in_progress}
            </button>
            <button
              type="button"
              className={`stat-chip chip-available ${statusFilter === 'available' ? 'active' : ''}`}
              onClick={() => setStatusFilter('available')}
            >
              Ready: {stats.available}
            </button>
            <button
              type="button"
              className={`stat-chip chip-progress ${statusFilter === 'in_progress' ? 'active' : ''}`}
              onClick={() => setStatusFilter('in_progress')}
            >
              Started: {stats.in_progress}
            </button>
            <button
              type="button"
              className={`stat-chip chip-done ${statusFilter === 'completed' ? 'active' : ''}`}
              onClick={() => setStatusFilter('completed')}
            >
              Done: {stats.completed}
            </button>
            <button
              type="button"
              className={`stat-chip chip-locked ${statusFilter === 'locked' ? 'active' : ''}`}
              onClick={() => setStatusFilter('locked')}
            >
              Locked: {stats.locked}
            </button>
          </div>
        </div>
      )}

      {planner && planner.recommendations.length > 0 && (
        <div className="planner-recs">
          <h3 className="planner-title">Recommended next</h3>
          <ul className="rec-list">
            {planner.recommendations.map((rec) => (
              <li key={rec.pageName}>
                <button type="button" className="rec-btn" onClick={() => onSelect(rec.pageName)}>
                  <span>{rec.name}</span>
                  <span className="rec-reason">{rec.reason}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <input
        type="search"
        className="search-input"
        placeholder="Search quests…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="filter-tabs">
        {(['all', 'quest', 'miniquest', 'f2p'] as FilterType[]).map((f) => (
          <button
            key={f}
            type="button"
            className={`filter-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f === 'f2p' ? 'F2P' : f === 'miniquest' ? 'Mini' : 'Quests'}
          </button>
        ))}
        {playerData && (
          <button
            type="button"
            className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            Show all
          </button>
        )}
      </div>

      <p className="result-count">{filtered.length} quests</p>

      <ul className="quest-list quest-grid">
        {filtered.slice(0, 150).map((quest) => {
          const pq = playerMap?.get(quest.pageName);
          const plannerStatus = pq ? mapPlayerStatus(pq) : null;
          const curated = getCuratedQuest(quest.pageName);
          return (
            <li key={quest.pageName}>
              <button
                type="button"
                className={`quest-card quest-status-${plannerStatus ?? 'none'}`}
                onClick={() => onSelect(quest.pageName)}
              >
                <span className="quest-name">{quest.name}</span>
                <span className="quest-meta">
                  {curated && <span className="badge badge-curated">Guide</span>}
                  {plannerStatus && (
                    <span className={`status-pill pill-${plannerStatus}`}>
                      {STATUS_LABELS[plannerStatus]}
                    </span>
                  )}
                  {quest.isMiniquest && <span className="badge badge-mini">Mini</span>}
                  {!quest.members && <span className="badge badge-f2p">F2P</span>}
                </span>
                {plannerStatus === 'locked' && curated && (
                  <span className="quest-lock-hint">
                    Needs: {curated.skillRequirements.map((s) => `${s.skill} ${s.level}`).join(', ') ||
                      curated.requirements.slice(0, 2).join(' · ')}
                  </span>
                )}
              </button>
            </li>
          );
        })}
        {filtered.length > 150 && (
          <li className="quest-list-more">Refine search to see more results</li>
        )}
      </ul>
    </div>
  );
}
