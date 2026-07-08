import type { ItemBrain } from '../types/quest-data';

interface GpsQuestItemsOverviewProps {
  itemBrain?: ItemBrain;
  manualMarks: string[];
  bank: string[];
  detected: string[];
  wikiUrl: string;
  onOpenWiki: () => void;
}

function itemStatus(
  item: string,
  manualMarks: string[],
  detected: string[],
  bank: string[],
): 'ready' | 'bank' | 'missing' {
  const match = (list: string[]) => list.some((e) => e.toLowerCase().includes(item.toLowerCase().slice(0, 4)));
  if (match(manualMarks) || match(detected)) return 'ready';
  if (match(bank)) return 'bank';
  return 'missing';
}

export default function GpsQuestItemsOverview({
  itemBrain,
  manualMarks,
  bank,
  detected,
  onOpenWiki,
}: GpsQuestItemsOverviewProps) {
  if (!itemBrain) return null;

  const sections = [
    { title: 'Required', items: itemBrain.required ?? [], why: 'Needed to complete the quest' },
    { title: 'Recommended', items: itemBrain.recommended ?? [], why: 'Makes steps easier/safer' },
    { title: 'Consumed', items: itemBrain.consumed ?? [], why: 'Used up during the quest' },
    { title: 'Needed later', items: itemBrain.kept ?? [], why: 'Keep these — used in multiple steps' },
  ].filter((s) => s.items.length > 0);

  if (sections.length === 0) return null;

  return (
    <div className="gps-card gps-quest-items">
      <div className="gps-card-label">Quest Items</div>
      {sections.map((sec) => (
        <div key={sec.title} className="gps-quest-items-section">
          <div className="gps-quest-items-title">{sec.title}</div>
          <ul className="gps-quest-items-list">
            {sec.items.map((item) => {
              const status = itemStatus(item, manualMarks, detected, bank);
              const note = itemBrain.ironmanNotes?.[item];
              return (
                <li key={item} className={`gps-quest-item gps-quest-item-${status}`}>
                  <span className="gps-quest-item-status">
                    {status === 'ready' ? '✓' : status === 'bank' ? '◉' : '○'}
                  </span>
                  <div className="gps-quest-item-info">
                    <span className="gps-quest-item-name">{item}</span>
                    {note && <span className="gps-quest-item-note">{note}</span>}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <button type="button" className="gps-wiki-btn" onClick={onOpenWiki}>
        📖 Open quest wiki for GE prices
      </button>
    </div>
  );
}
