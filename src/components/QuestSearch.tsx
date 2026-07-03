import { useMemo, useState } from 'react';
import type { QuestIndexEntry } from '../types/quest';

interface QuestSearchProps {
  quests: QuestIndexEntry[];
  onSelect: (pageName: string) => void;
  onRefreshIndex: () => void;
}

type FilterType = 'all' | 'quest' | 'miniquest' | 'f2p';

export default function QuestSearch({ quests, onSelect, onRefreshIndex }: QuestSearchProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return quests.filter((quest) => {
      if (filter === 'miniquest' && !quest.isMiniquest) return false;
      if (filter === 'quest' && quest.isMiniquest) return false;
      if (filter === 'f2p' && quest.members) return false;
      if (!q) return true;
      return (
        quest.name.toLowerCase().includes(q) ||
        quest.pageName.toLowerCase().includes(q)
      );
    });
  }, [quests, query, filter]);

  return (
    <div className="quest-search">
      <div className="search-header">
        <h2>Quest Guide</h2>
        <button type="button" className="btn-ghost btn-sm" onClick={onRefreshIndex} title="Refresh from Wiki">
          ↻ Wiki
        </button>
      </div>

      <input
        type="search"
        className="search-input"
        placeholder="Search quests…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
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
      </div>

      <p className="result-count">{filtered.length} quests</p>

      <ul className="quest-list">
        {filtered.slice(0, 100).map((quest) => (
          <li key={quest.pageName}>
            <button
              type="button"
              className="quest-list-item"
              onClick={() => onSelect(quest.pageName)}
            >
              <span className="quest-name">{quest.name}</span>
              <span className="quest-meta">
                {quest.isMiniquest && <span className="badge badge-mini">Mini</span>}
                {!quest.members && <span className="badge badge-f2p">F2P</span>}
                <span className="quest-length">{quest.length}</span>
              </span>
            </button>
          </li>
        ))}
        {filtered.length > 100 && (
          <li className="quest-list-more">Refine search to see more results</li>
        )}
      </ul>
    </div>
  );
}
