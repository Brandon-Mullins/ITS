import { openWikiUrl } from '../services/storage';
import { findNpc } from '../data/travel/npcs';

interface NpcInfoCardProps {
  npcName: string;
  onShowRoute?: () => void;
}

export default function NpcInfoCard({ npcName, onShowRoute }: NpcInfoCardProps) {
  const npc = findNpc(npcName);
  const wikiUrl = `https://runescape.wiki/w/${encodeURIComponent(npc?.wikiPage ?? npcName)}`;

  return (
    <div className="tb-npc-card">
      <div className="tb-npc-portrait" aria-hidden>
        {npc?.portraitIcon ?? '👤'}
      </div>
      <div className="tb-npc-body">
        <div className="tb-npc-name">{npc?.name ?? npcName}</div>
        <div className="tb-npc-location">
          <span className="tb-npc-pin">📍</span>
          {npc?.area ?? npc?.location ?? 'Unknown location'}
        </div>
        {npc?.compassDirection && (
          <div className="tb-npc-direction">
            <span>↖ {npc.compassDirection}</span>
            {npc.tilesAway != null && (
              <span className="tb-npc-distance">{npc.tilesAway} tiles away</span>
            )}
          </div>
        )}
        {npc?.examine && (
          <p className="tb-npc-examine">"{npc.examine}"</p>
        )}
        <div className="tb-npc-actions">
          <button type="button" className="tb-npc-btn" onClick={() => openWikiUrl(wikiUrl)}>
            Wiki
          </button>
          {onShowRoute && (
            <button type="button" className="tb-npc-btn tb-npc-map" onClick={onShowRoute}>
              Map
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
