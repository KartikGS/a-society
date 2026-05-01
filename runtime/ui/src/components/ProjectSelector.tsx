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
  canStartFlows: boolean;
  settingsReady: boolean;
  settingsConfigured: boolean;
  onSelectInitialized: (projectNamespace: string | null) => void;
  onInitializeExisting: (projectNamespace: string) => void;
  onOpenFlow: (flow: FlowSummary) => void;
  onNewFlow: (projectNamespace: string) => void;
  onDeleteFlow: (flow: FlowSummary) => void;
  onNewProjectNameChange: (value: string) => void;
  onCreateNew: () => void;
  onOpenSettings: () => void;
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
  canStartFlows: boolean;
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
          disabled={props.disabled || !props.canStartFlows}
          onClick={() => props.onNewFlow(props.selectedProject!)}
        >
          New
        </button>
      </div>
      <div className="sidebar-project-list">
        {props.flows.map((flow) => (
          <div
            key={flow.flowId}
            className="sidebar-flow-row"
            data-active={props.selectedFlowId === flow.flowId}
            data-disabled={props.disabled}
          >
            <button
              type="button"
              className="sidebar-flow-open-btn"
              disabled={props.disabled}
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

function SettingsAccess(props: {
  ready: boolean;
  configured: boolean;
  onOpen: () => void;
}) {
  let label = 'Open runtime settings';

  if (!props.ready) {
    label = 'Loading runtime settings';
  } else if (!props.configured) {
    label = 'Configure runtime model';
  }

  return (
    <button
      type="button"
      className="sidebar-settings-icon-btn"
      onClick={props.onOpen}
      aria-label={label}
      title={label}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M10.325 4.317a1.724 1.724 0 0 1 3.35 0l.186.796a1.724 1.724 0 0 0 2.573 1.066l.705-.403a1.724 1.724 0 0 1 2.35.63l.42.727a1.724 1.724 0 0 1-.63 2.35l-.705.403a1.724 1.724 0 0 0 0 2.988l.705.403a1.724 1.724 0 0 1 .63 2.35l-.42.727a1.724 1.724 0 0 1-2.35.63l-.705-.403a1.724 1.724 0 0 0-2.573 1.066l-.186.796a1.724 1.724 0 0 1-3.35 0l-.186-.796a1.724 1.724 0 0 0-2.573-1.066l-.705.403a1.724 1.724 0 0 1-2.35-.63l-.42-.727a1.724 1.724 0 0 1 .63-2.35l.705-.403a1.724 1.724 0 0 0 0-2.988l-.705-.403a1.724 1.724 0 0 1-.63-2.35l.42-.727a1.724 1.724 0 0 1 2.35-.63l.705.403a1.724 1.724 0 0 0 2.573-1.066l.186-.796Z" />
        <path d="M12 15.25A3.25 3.25 0 1 0 12 8.75a3.25 3.25 0 0 0 0 6.5Z" />
      </svg>
    </button>
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
            canStartFlows={props.canStartFlows}
            onOpenFlow={props.onOpenFlow}
            onNewFlow={props.onNewFlow}
            onDeleteFlow={props.onDeleteFlow}
          />
        </div>
        <div className="sidebar-footer sidebar-footer-compact">
          <div className="sidebar-settings-dock">
            <SettingsAccess
              ready={props.settingsReady}
              configured={props.settingsConfigured}
              onOpen={props.onOpenSettings}
            />
          </div>
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
          disabled={props.disabled || !props.canStartFlows}
          onSelect={props.onInitializeExisting}
          emptyMessage="No uninitialized projects."
        />
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-create-stack">
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
              disabled={props.disabled || !props.canStartFlows}
              placeholder="New project name..."
            />
            <button
              type="submit"
              className="sidebar-create-btn"
              disabled={props.disabled || !props.canStartFlows || props.newProjectName.trim().length === 0}
            >
              Create
            </button>
          </form>
        </div>

        <div className="sidebar-settings-dock">
          <SettingsAccess
            ready={props.settingsReady}
            configured={props.settingsConfigured}
            onOpen={props.onOpenSettings}
          />
        </div>
      </div>
    </aside>
  );
}
