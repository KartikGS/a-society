import type { ProjectSummary } from '../types';

interface ProjectSelectorProps {
  projectsWithADocs: ProjectSummary[];
  projectsWithoutADocs: ProjectSummary[];
  selectedProject: string | null;
  newProjectName: string;
  errorMessage: string | null;
  disabled: boolean;
  onSelectInitialized: (projectNamespace: string) => void;
  onInitializeExisting: (projectNamespace: string) => void;
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

export function ProjectSelector(props: ProjectSelectorProps) {
  return (
    <aside className="panel sidebar-panel">
      <div className="sidebar-header">
        <p className="eyebrow">A-Society</p>
        <h2>Projects</h2>
      </div>

      {props.errorMessage ? (
        <div className="sidebar-error">
          <p>{props.errorMessage}</p>
        </div>
      ) : null}

      <div className="sidebar-content">
        <ProjectSection
          title="Initialized (with a-docs)"
          projects={props.projectsWithADocs}
          selectedProject={props.selectedProject}
          disabled={props.disabled}
          onSelect={props.onSelectInitialized}
          emptyMessage="No initialized projects."
        />

        <ProjectSection
          title="Uninitialized (no a-docs)"
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
            placeholder="New project name…"
          />
          <button type="submit" className="sidebar-create-btn" disabled={props.disabled || props.newProjectName.trim().length === 0}>
            Create
          </button>
        </form>
      </div>
    </aside>
  );
}

