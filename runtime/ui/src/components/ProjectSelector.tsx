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
  copy: string;
  projects: ProjectSummary[];
  selectedProject: string | null;
  disabled: boolean;
  onSelect: (projectNamespace: string) => void;
  emptyMessage: string;
}

function ProjectSection(props: ProjectSectionProps) {
  return (
    <section className="panel selector-panel">
      <div className="panel-header">
        <p className="eyebrow">Runtime</p>
        <h2>{props.title}</h2>
        <p className="panel-copy">{props.copy}</p>
      </div>

      <div className="project-grid">
        {props.projects.map((project) => (
          <button
            key={project.folderName}
            type="button"
            className="project-card"
            disabled={props.disabled}
            data-active={props.selectedProject === project.folderName}
            onClick={() => props.onSelect(project.folderName)}
          >
            <span className="project-name">{project.displayName}</span>
            <span className="project-path">{project.folderName}</span>
          </button>
        ))}
      </div>

      {props.projects.length === 0 ? (
        <p className="empty-state">{props.emptyMessage}</p>
      ) : null}
    </section>
  );
}

export function ProjectSelector(props: ProjectSelectorProps) {
  return (
    <section className="selector-stack">
      <section className="panel selector-panel">
        <div className="panel-header">
          <p className="eyebrow">Runtime</p>
          <h1>Choose how to begin</h1>
          <p className="panel-copy">
            Open an existing project flow, initialize a project that does not yet have `a-docs/`, or start a brand-new project from scratch.
          </p>
        </div>
      </section>

      {props.errorMessage ? (
        <section className="panel selector-panel selector-error-panel">
          <div className="panel-header">
            <p className="eyebrow">Runtime Error</p>
            <h2>Startup blocked</h2>
            <p className="panel-copy">{props.errorMessage}</p>
          </div>
        </section>
      ) : null}

      <ProjectSection
        title="Existing Projects With a-docs"
        copy="These projects already have agent docs. Selecting one starts the normal Owner flow."
        projects={props.projectsWithADocs}
        selectedProject={props.selectedProject}
        disabled={props.disabled}
        onSelect={props.onSelectInitialized}
        emptyMessage="No projects with a-docs were discovered in this workspace."
      />

      <ProjectSection
        title="Existing Projects Without a-docs"
        copy="These projects will be scaffolded and then initialized through a runtime-owned Owner flow."
        projects={props.projectsWithoutADocs}
        selectedProject={props.selectedProject}
        disabled={props.disabled}
        onSelect={props.onInitializeExisting}
        emptyMessage="No projects without a-docs were discovered in this workspace."
      />

      <section className="panel selector-panel">
        <div className="panel-header">
          <p className="eyebrow">Runtime</p>
          <h2>Create New Project</h2>
          <p className="panel-copy">
            Enter a project name. The runtime will create the folder, scaffold the compulsory `a-docs/`, and start an Owner initialization flow.
          </p>
        </div>

        <form
          className="composer"
          onSubmit={(event) => {
            event.preventDefault();
            props.onCreateNew();
          }}
        >
          <textarea
            value={props.newProjectName}
            onChange={(event) => props.onNewProjectNameChange(event.target.value)}
            disabled={props.disabled}
            placeholder="Enter a new project name…"
            rows={2}
          />
          <button type="submit" disabled={props.disabled || props.newProjectName.trim().length === 0}>
            Create and initialize
          </button>
        </form>
      </section>
    </section>
  );
}
