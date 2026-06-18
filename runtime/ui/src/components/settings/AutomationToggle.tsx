import type { SelectionMode } from '../../types';

interface AutomationToggleProps {
  label: string;
  mode: SelectionMode;
  onChange: (mode: SelectionMode) => void;
}

export function AutomationToggle({
  label,
  mode,
  onChange,
}: AutomationToggleProps) {
  return (
    <div className="automation-toggle">
      <div className="automation-toggle-text">
        <span className="automation-toggle-title">{label} selection</span>
        <span className="automation-toggle-desc">
          {mode === 'auto'
            ? 'An agent selects this for each role automatically.'
            : 'You are prompted to select this for each role.'}
        </span>
      </div>
      <div className="automation-toggle-options" role="group" aria-label={`${label} selection mode`}>
        <button
          type="button"
          className={`automation-toggle-option${mode === 'manual' ? ' automation-toggle-option-active' : ''}`}
          aria-pressed={mode === 'manual'}
          onClick={() => onChange('manual')}
        >
          Manual
        </button>
        <button
          type="button"
          className={`automation-toggle-option${mode === 'auto' ? ' automation-toggle-option-active' : ''}`}
          aria-pressed={mode === 'auto'}
          onClick={() => onChange('auto')}
        >
          Automatic
        </button>
      </div>
    </div>
  );
}
