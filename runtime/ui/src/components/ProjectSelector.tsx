import type { FlowSummary, ProjectSummary } from '../types';

interface ProjectSelectorProps {
  projectsWithADocs: ProjectSummary[];
  projectsWithoutADocs: ProjectSummary[];
  selectedProject: string | null;
  selectedFlowId: string | null;
  projectFlows: FlowSummary[];
  newProjectName: string;
  errorMessage: string | null;
  disabled: boolean;
  onSelectInitialized: (projectNamespace: string | null) => void;
  onInitializeExisting: (projectNamespace: string) => void;
  onOpenFlow: (flow: FlowSummary) => void;
  onNewFlow: (projectNamespace: string) => void;
  onDeleteFlow: (flow: FlowSummary) => void;
  onNewProjectNameChange: (value: string) => void;
  onCreateNew: () => void;
}

interface ProjectSectionProps {
  title: string;
  projects: ProjectSummary[];
  selectedProject: string | null;
  disabled: boolean;
  onSelect: (projectNamespace: string) => void;
  emptyMessage: string;
}

function ProjectSection(props: ProjectSectionProps) {
  return (
    <div className="sidebar-section">
      <h3 className="sidebar-section-title">{props.title}</h3>
      <div className="sidebar-project-list">
        {props.projects.map((project) => (
          <button
            key={project.folderName}
            type="button"
            className="sidebar-project-item"
            disabled={props.disabled}
            data-active={props.selectedProject === project.folderName}
            onClick={() => props.onSelect(project.folderName)}
          >
            <span className="sidebar-project-name">{project.displayName}</span>
            <span className="sidebar-project-path">{project.folderName}</span>
          </button>
        ))}
      </div>
      {props.projects.length === 0 ? (
        <p className="sidebar-empty-state">{props.emptyMessage}</p>
      ) : null}
    </div>
  );
}

function FlowList(props: {
  selectedProject: string | null;
  selectedFlowId: string | null;
  flows: FlowSummary[];
  disabled: boolean;
  onOpenFlow: (flow: FlowSummary) => void;
  onNewFlow: (projectNamespace: string) => void;
  onDeleteFlow: (flow: FlowSummary) => void;
}) {
  if (!props.selectedProject) return null;

  return (
    <div className="sidebar-section">
      <div className="sidebar-section-row">
        <h3 className="sidebar-section-title">Records</h3>
        <button
          type="button"
          className="sidebar-mini-btn"
          disabled={props.disabled}
          onClick={() => props.onNewFlow(props.selectedProject!)}
        >
          New
        </button>
      </div>
      <div className="sidebar-project-list">
        {props.flows.map((flow) => (
          <div key={flow.flowId} className="sidebar-flow-row">
            <button
              type="button"
              className="sidebar-project-item"
              disabled={props.disabled}
              data-active={props.selectedFlowId === flow.flowId}
              onClick={() => props.onOpenFlow(flow)}
            >
              <span className="sidebar-project-name">{flow.recordName ?? flow.flowId}</span>
              <span className="sidebar-project-path">{flow.status}</span>
            </button>
            <button
              type="button"
              className="sidebar-flow-delete-btn"
              disabled={props.disabled}
              title="Delete record"
              onClick={() => props.onDeleteFlow(flow)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      {props.flows.length === 0 ? (
        <p className="sidebar-empty-state">No saved records yet.</p>
      ) : null}
    </div>
  );
}

export function ProjectSelector(props: ProjectSelectorProps) {
  if (props.selectedProject) {
    return (
      <aside className="panel sidebar-panel" style={{ flex: 1, minHeight: 0 }}>
        <div className="sidebar-header" style={{ marginBottom: 0 }}>
          <button
            type="button"
            className="sidebar-mini-btn"
            onClick={() => props.onSelectInitialized(null)}
          >
            &larr; Back to Projects
          </button>
        </div>
        <div className="sidebar-content">
          <FlowList
            selectedProject={props.selectedProject}
            selectedFlowId={props.selectedFlowId}
            flows={props.projectFlows}
            disabled={props.disabled}
            onOpenFlow={props.onOpenFlow}
            onNewFlow={props.onNewFlow}
            onDeleteFlow={props.onDeleteFlow}
          />
        </div>
      </aside>
    );
  }

  return (
    <aside className="panel sidebar-panel" style={{ flex: 1, minHeight: 0 }}>
      {props.errorMessage ? (
        <div className="sidebar-error">
          <p>{props.errorMessage}</p>
        </div>
      ) : null}

      <div className="sidebar-content">
        <ProjectSection
          title="Initialized"
          projects={props.projectsWithADocs}
          selectedProject={props.selectedProject}
          disabled={props.disabled}
          onSelect={props.onSelectInitialized}
          emptyMessage="No initialized projects."
        />

        <ProjectSection
          title="Uninitialized"
          projects={props.projectsWithoutADocs}
          selectedProject={props.selectedProject}
          disabled={props.disabled}
          onSelect={props.onInitializeExisting}
          emptyMessage="No uninitialized projects."
        />
      </div>

      <div className="sidebar-footer">
        <h3 className="sidebar-section-title">Create New Project</h3>
        <form
          className="sidebar-create-form"
          onSubmit={(event) => {
            event.preventDefault();
            props.onCreateNew();
          }}
        >
          <input
            type="text"
            className="sidebar-input"
            value={props.newProjectName}
            onChange={(event) => props.onNewProjectNameChange(event.target.value)}
            disabled={props.disabled}
            placeholder="New project name..."
          />
          <button type="submit" className="sidebar-create-btn" disabled={props.disabled || props.newProjectName.trim().length === 0}>
            Create
          </button>
        </form>
      </div>
    </aside>
  );
}
