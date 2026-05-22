import type { FlowRun } from '../types';

interface ImprovementChoiceModalProps {
  flowRun: FlowRun | null;
  onChoice: (mode: 'graph-based' | 'parallel' | 'none') => void;
}

export function ImprovementChoiceModal({ flowRun, onChoice }: ImprovementChoiceModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-panel">
        <p className="eyebrow">Improvement Phase</p>
        {flowRun?.improvementPhase?.singleRole ? (
          <>
            <h2>Run improvement?</h2>
            <p className="modal-copy">Forward pass is complete. Do you want to run the backward pass?</p>
            <div className="modal-choices">
              <button className="modal-choice" onClick={() => onChoice('parallel')}>
                <span className="modal-choice-label">Yes</span>
                <span className="modal-choice-desc">Run the backward pass for this role.</span>
              </button>
              <button className="modal-choice modal-choice-neutral" onClick={() => onChoice('none')}>
                <span className="modal-choice-label">No</span>
                <span className="modal-choice-desc">Close the record now without a backward pass.</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <h2>Choose improvement mode</h2>
            <p className="modal-copy">Forward pass is complete. How should the backward pass proceed?</p>
            <div className="modal-choices">
              <button className="modal-choice" onClick={() => onChoice('graph-based')}>
                <span className="modal-choice-label">Graph-based</span>
                <span className="modal-choice-desc">Roles run in reverse topological order; each receives findings from their direct forward successors.</span>
              </button>
              <button className="modal-choice" onClick={() => onChoice('parallel')}>
                <span className="modal-choice-label">Parallel</span>
                <span className="modal-choice-desc">All roles run simultaneously; no cross-role findings injected.</span>
              </button>
              <button className="modal-choice modal-choice-neutral" onClick={() => onChoice('none')}>
                <span className="modal-choice-label">No improvement</span>
                <span className="modal-choice-desc">Close the record now without a backward pass.</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
