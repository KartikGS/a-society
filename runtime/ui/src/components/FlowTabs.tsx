import type { FlowTab } from '../app/flow-ui';

interface FlowTabsProps {
  tabs: FlowTab[];
  activeTabKey: string | null;
  onSelect: (tab: FlowTab) => void;
  onClose: (tab: FlowTab) => void;
}

export function FlowTabs({ tabs, activeTabKey, onSelect, onClose }: FlowTabsProps) {
  if (tabs.length === 0) return null;

  return (
    <nav className="flow-tab-strip" aria-label="Open flows">
      {tabs.map((tab) => (
        <div
          key={tab.key}
          className="flow-tab"
          data-active={tab.key === activeTabKey}
        >
          <button
            type="button"
            className="flow-tab-click-area"
            onClick={() => onSelect(tab)}
          >
            <span className="flow-tab-title">{tab.title}</span>
            <span className="flow-tab-project">{tab.ref.projectNamespace}</span>
          </button>
          <button
            type="button"
            className="flow-tab-close-btn"
            title="Close tab"
            onClick={() => onClose(tab)}
          >
            x
          </button>
        </div>
      ))}
    </nav>
  );
}
