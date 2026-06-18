import { FEEDBACK_CONSENT_DECISION } from '../../../shared/protocol-constants.js';
import type { ProtocolFeedbackConsentDecision } from '../../../shared/protocol-constants.js';

interface FeedbackConsentModalProps {
  title: string;
  body: string;
  details: string;
  onChoice: (decision: ProtocolFeedbackConsentDecision) => void;
}

export function FeedbackConsentModal({ title, body, details, onChoice }: FeedbackConsentModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-panel">
        <p className="eyebrow">Feedback Step</p>
        <h2>{title}</h2>
        <p className="modal-copy">{body}</p>
        <p className="modal-copy">{details}</p>
        <div className="modal-choices">
          <button className="modal-choice" onClick={() => onChoice(FEEDBACK_CONSENT_DECISION.GRANTED)}>
            <span className="modal-choice-label">Generate feedback</span>
            <span className="modal-choice-desc">Run the feedback agent, create the report in `a-society/feedback/`, and leave it ready for review or manual PR sharing.</span>
          </button>
          <button className="modal-choice modal-choice-neutral" onClick={() => onChoice(FEEDBACK_CONSENT_DECISION.DENIED)}>
            <span className="modal-choice-label">Skip feedback</span>
            <span className="modal-choice-desc">Close the flow now without spending another turn or creating an upstream feedback file.</span>
          </button>
        </div>
      </div>
    </div>
  );
}
