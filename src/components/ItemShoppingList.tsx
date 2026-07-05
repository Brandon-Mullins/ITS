import { useState } from 'react';
import { buildShoppingList, copyShoppingList, formatShoppingListText } from '../services/item-brain';
import { extractItemName, itemGeSearchUrl } from '../utils/items';
import { listIncludesItem } from '../utils/item-match';
import { openWikiUrl } from '../services/storage';

interface ItemShoppingListProps {
  pageName: string;
  collectedItems: string[];
  bankItems: string[];
  needGeItems: string[];
  clickTargetItems?: string[];
}

export default function ItemShoppingList({
  pageName,
  collectedItems,
  bankItems,
  needGeItems,
  clickTargetItems = [],
}: ItemShoppingListProps) {
  const [copied, setCopied] = useState(false);
  const items = buildShoppingList(pageName, collectedItems, bankItems, needGeItems);

  if (items.length === 0) return null;

  const handleCopy = async () => {
    const text = formatShoppingListText(items);
    const ok = await copyShoppingList(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <details className="step-section shopping-list" open>
      <summary className="step-section-title">
        Shopping list
        <button type="button" className="btn-copy-list" onClick={(e) => { e.preventDefault(); handleCopy(); }}>
          {copied ? '✓ Copied' : '📋 Copy'}
        </button>
      </summary>
      <ul className="shopping-items">
        {items.map((item) => {
          const isClickTarget = clickTargetItems.some((t) => listIncludesItem([t], item.name));
          const hasReady = item.status === 'ready';
          const aura = isClickTarget && hasReady ? 'aura-blue' : hasReady || item.status === 'bank' ? 'aura-green' : 'aura-red';
          return (
          <li key={item.name} className={`shop-item shop-${item.status} ${aura}`}>
            <span className="shop-cat">{item.category}</span>
            <span className="shop-name">{extractItemName(item.name)}</span>
            <button
              type="button"
              className={`shop-status status-${item.status}`}
              onClick={() => openWikiUrl(itemGeSearchUrl(item.name))}
            >
              {item.status === 'ready' ? '✓ Ready' : item.status === 'bank' ? '🏦 Bank' : '🛒 GE'}
            </button>
            {item.ironmanNote && <span className="ironman-note">🛡 {item.ironmanNote}</span>}
          </li>
          );
        })}
      </ul>
    </details>
  );
}
