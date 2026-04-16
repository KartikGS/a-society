import type { ProjectSummary } from '../types';

interface ProjectSelectorProps {
  projects: ProjectSummary[];
  selectedProject: string | null;
  disabled: boolean;
  onSelect: (projectNamespace: string) => void;
}

export function ProjectSelector(props: ProjectSelectorProps) {
  return (
    <section className="panel selector-panel">
      <div className="panel-header">
        <p className="eyebrow">Runtime</p>
        <h1>Pick a project to orchestrate</h1>
        <p className="panel-copy">
          The UI replaces the old terminal selector. Once a workflow node activates, the live graph takes over.
        </p>
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
        <p className="empty-state">
          No initialized A-Society projects were discovered in this workspace yet.
        </p>
      ) : null}
    </section>
  );
}
