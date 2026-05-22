interface EmptyGraphPanelProps {
  selectedProject: string | null;
}

export function EmptyGraphPanel({ selectedProject }: EmptyGraphPanelProps) {
  return (
    <section className="panel center-panel graph-panel" style={{ flex: 1 }}>
      <div className="graph-panel-header">
        <div>
          <p className="eyebrow">Workflow Graph</p>
          <h2>{selectedProject ? selectedProject : 'No project selected'}</h2>
          <p className="panel-copy">
            {selectedProject
              ? 'Select a saved record or create a new flow from the left pane.'
              : 'Select a project from the left sidebar to load its records and role chat.'}
          </p>
        </div>
      </div>
      <div className="graph-canvas">
        <div className="graph-empty">
          {selectedProject ? 'No flow selected' : 'Select a project to begin'}
        </div>
      </div>
    </section>
  );
}
