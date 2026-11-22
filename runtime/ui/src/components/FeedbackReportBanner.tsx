import { useEffect, useState } from 'react';
import { A_SOCIETY_FEEDBACK_SUBMIT_URL } from '../app/constants';
import type { FeedbackReportNotice } from '../app/feedback-copy';

interface FeedbackReportBannerProps {
  report: FeedbackReportNotice;
}

export function FeedbackReportBanner({ report }: FeedbackReportBannerProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  function handleCopy() {
    // The Clipboard API is absent in insecure contexts; leave the label unchanged.
    if (typeof navigator.clipboard?.writeText !== 'function') return;
    navigator.clipboard.writeText(report.absolutePath).then(
      () => setCopied(true),
      () => {
        // Clipboard failure is non-critical; the path stays visible for manual copying.
      },
    );
  }

  return (
    <div className="consent-banner">
      <div className="consent-banner-body">
        <span className="consent-banner-tool">Feedback report saved</span>
        <span className="consent-banner-desc">
          Nothing has been sent. Review the report and remove anything you don&apos;t want public, then submit it as a pull request that adds the file to feedback/ in the A-Society repository.
        </span>
        <span className="feedback-report-path">
          <code>{report.absolutePath}</code>
          <button
            type="button"
            className="consent-btn consent-btn-allow"
            onClick={handleCopy}
          >
            {copied ? 'Copied' : 'Copy path'}
          </button>
        </span>
        <span className="consent-links">
          <a className="consent-link" href={A_SOCIETY_FEEDBACK_SUBMIT_URL} target="_blank" rel="noopener noreferrer">
            How to submit a feedback report
          </a>
        </span>
      </div>
    </div>
  );
}
