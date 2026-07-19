import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CONSENT_MODE,
  IMPROVEMENT_CHOICE_MODE,
} from '../../../shared/protocol-constants.js';
import type { ProtocolConsentMode, ProtocolImprovementChoiceMode } from '../../../shared/protocol-constants.js';
import type {
  ProjectRoleSettings,
  ProjectSettings,
} from '../../../shared/project-settings.js';
import {
  fetchMcpServers as fetchMcpServersApi,
  fetchModels as fetchModelsApi,
  fetchProjectRoles,
  fetchProjectSettings,
  fetchSkills as fetchSkillsApi,
  saveProjectSettings,
} from '../app/runtime-api';
import type { McpServerSummary, ModelConfig } from '../../../shared/settings.js';
import type { SkillSummary } from '../../../shared/skills.js';

interface ProjectSettingsModalProps {
  projectNamespace: string;
  displayName: string;
  deletable?: boolean;
  onClose: () => void;
  onError: (message: string) => void;
  onDeleteProject: () => void;
}

type NavSelection =
  | { kind: 'role'; roleId: string }
  | { kind: 'tools' }
  | { kind: 'improvement' };

const IMPROVEMENT_OPTIONS: Array<{ value: '' | ProtocolImprovementChoiceMode; label: string }> = [
  { value: '', label: 'Ask each flow' },
  { value: IMPROVEMENT_CHOICE_MODE.NONE, label: 'No improvement' },
  { value: IMPROVEMENT_CHOICE_MODE.GRAPH_BASED, label: 'Graph-based' },
  { value: IMPROVEMENT_CHOICE_MODE.PARALLEL, label: 'Parallel' },
];

const FEEDBACK_OPTIONS: Array<{ value: 'ask' | 'yes' | 'no'; label: string }> = [
  { value: 'ask', label: 'Ask each flow' },
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];

export function ProjectSettingsModal({
  projectNamespace,
  displayName,
  deletable = true,
  onClose,
  onError,
  onDeleteProject,
}: ProjectSettingsModalProps) {
  const [settings, setSettings] = useState<ProjectSettings | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [skills, setSkills] = useState<SkillSummary[]>([]);
  const [mcpServers, setMcpServers] = useState<McpServerSummary[]>([]);
  const [selection, setSelection] = useState<NavSelection>({ kind: 'tools' });
  const [commandsText, setCommandsText] = useState('');
  const commandsInitialized = useRef(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const reportError = useCallback((message: string): void => onError(message), [onError]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const [roleList, projectSettings, modelList, skillResults, mcpList] = await Promise.all([
          fetchProjectRoles(projectNamespace),
          fetchProjectSettings(projectNamespace),
          fetchModelsApi(),
          fetchSkillsApi(),
          fetchMcpServersApi(),
        ]);
        if (cancelled) return;
        setRoles(roleList);
        setSettings(projectSettings);
        setModels(modelList);
        setSkills(skillResults
          .filter((result): result is Extract<typeof result, { kind: 'ok' }> => result.kind === 'ok')
          .map((result) => result.skill));
        setMcpServers(mcpList);
        if (!commandsInitialized.current) {
          setCommandsText(projectSettings.permission.allowedCommands.join('\n'));
          commandsInitialized.current = true;
        }
        setSelection(roleList.length > 0 ? { kind: 'role', roleId: roleList[0] } : { kind: 'tools' });
      } catch (err) {
        if (!cancelled) reportError(err instanceof Error ? err.message : 'Failed to load project settings.');
      }
    })();

    return () => { cancelled = true; };
  }, [projectNamespace, reportError]);

  const persist = useCallback((next: ProjectSettings): void => {
    setSettings(next);
    void (async () => {
      try {
        const saved = await saveProjectSettings(projectNamespace, next);
        setSettings(saved);
      } catch (err) {
        reportError(err instanceof Error ? err.message : 'Failed to save project settings.');
      }
    })();
  }, [projectNamespace, reportError]);

  const updateRole = useCallback((roleId: string, patch: Partial<ProjectRoleSettings>): void => {
    if (!settings) return;
    const merged = { ...(settings.roles[roleId] ?? {}), ...patch };
    const cleaned: ProjectRoleSettings = {};
    if (merged.modelConfigId) cleaned.modelConfigId = merged.modelConfigId;
    if (merged.skills !== undefined) cleaned.skills = merged.skills;
    if (merged.mcpServers !== undefined) cleaned.mcpServers = merged.mcpServers;
    persist({ ...settings, roles: { ...settings.roles, [roleId]: cleaned } });
  }, [persist, settings]);

  function handleOverlayClick(event: React.MouseEvent): void {
    if (event.target === overlayRef.current) onClose();
  }

  const activeRoleId = useMemo(
    () => (selection.kind === 'role' && roles.includes(selection.roleId) ? selection.roleId : null),
    [roles, selection],
  );

  return (
    <div className="modal-overlay settings-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="settings-modal project-settings-modal" role="dialog" aria-modal="true" aria-label={`${displayName} settings`}>
        <div className="settings-modal-header">
          <div className="project-settings-title-row">
            <h2 className="settings-modal-title">{displayName}</h2>
            <label className="project-settings-enable" title="Apply these settings to new flows in this project">
              <input
                type="checkbox"
                checked={settings?.enabled ?? false}
                disabled={!settings}
                onChange={(event) => settings && persist({ ...settings, enabled: event.target.checked })}
              />
              <span>Enable project settings</span>
            </label>
          </div>
          <button type="button" className="settings-close-btn" onClick={onClose} aria-label="Close project settings">×</button>
        </div>

        <div className="settings-modal-body">
          <nav className="settings-nav">
            <p className="settings-nav-group-title">Roles</p>
            {roles.length === 0 ? (
              <p className="settings-nav-empty">No roles found.</p>
            ) : roles.map((roleId) => (
              <button
                key={roleId}
                type="button"
                className={`settings-nav-item${selection.kind === 'role' && selection.roleId === roleId ? ' settings-nav-item-active' : ''}`}
                onClick={() => setSelection({ kind: 'role', roleId })}
              >
                {roleId}
              </button>
            ))}

            <p className="settings-nav-group-title">Permission</p>
            <button
              type="button"
              className={`settings-nav-item${selection.kind === 'tools' ? ' settings-nav-item-active' : ''}`}
              onClick={() => setSelection({ kind: 'tools' })}
            >
              Tools
            </button>
            <button
              type="button"
              className={`settings-nav-item${selection.kind === 'improvement' ? ' settings-nav-item-active' : ''}`}
              onClick={() => setSelection({ kind: 'improvement' })}
            >
              Improvement &middot; Feedback
            </button>
          </nav>

          <div className="settings-content">
            {!settings ? (
              <p className="settings-nav-empty">Loading project settings…</p>
            ) : selection.kind === 'role' && activeRoleId ? (
              <RolePanel
                key={activeRoleId}
                roleId={activeRoleId}
                roleSettings={settings.roles[activeRoleId] ?? {}}
                models={models}
                skills={skills}
                mcpServers={mcpServers}
                onChange={(patch) => updateRole(activeRoleId, patch)}
              />
            ) : selection.kind === 'tools' ? (
              <ToolsPanel
                mode={settings.permission.mode}
                commandsText={commandsText}
                onModeChange={(mode) => persist({
                  ...settings,
                  permission: { ...settings.permission, mode },
                })}
                onCommandsChange={(text) => {
                  setCommandsText(text);
                  const allowedCommands = text
                    .split(/\r?\n/)
                    .map((line) => line.trim())
                    .filter((line) => line !== '');
                  persist({ ...settings, permission: { ...settings.permission, allowedCommands } });
                }}
              />
            ) : (
              <ImprovementPanel
                improvement={settings.improvement}
                feedback={settings.feedback}
                onImprovementChange={(value) => {
                  const next = { ...settings };
                  if (value === '') delete next.improvement;
                  else next.improvement = value;
                  persist(next);
                }}
                onFeedbackChange={(value) => {
                  const next = { ...settings };
                  if (value === 'ask') delete next.feedback;
                  else next.feedback = value === 'yes';
                  persist(next);
                }}
              />
            )}
          </div>
        </div>

        <div className="settings-modal-footer">
          <button
            type="button"
            className="project-delete-btn"
            onClick={onDeleteProject}
            disabled={!deletable}
            title={deletable ? 'Delete this project and all its runtime state' : 'The A-Society framework project cannot be deleted here.'}
          >
            Delete project
          </button>
        </div>
      </div>
    </div>
  );
}

function RolePanel({
  roleId,
  roleSettings,
  models,
  skills,
  mcpServers,
  onChange,
}: {
  roleId: string;
  roleSettings: ProjectRoleSettings;
  models: ModelConfig[];
  skills: SkillSummary[];
  mcpServers: McpServerSummary[];
  onChange: (patch: Partial<ProjectRoleSettings>) => void;
}) {
  const skillsConfigured = roleSettings.skills !== undefined;
  const mcpConfigured = roleSettings.mcpServers !== undefined;
  const selectedSkills = roleSettings.skills ?? [];
  const selectedMcp = roleSettings.mcpServers ?? [];

  function toggleSkill(name: string, checked: boolean): void {
    const next = checked
      ? [...selectedSkills, name]
      : selectedSkills.filter((entry) => entry !== name);
    onChange({ skills: next.filter((entry, index) => next.indexOf(entry) === index).sort((a, b) => a.localeCompare(b)) });
  }

  function toggleMcp(id: string, checked: boolean): void {
    const next = checked
      ? [...selectedMcp, id]
      : selectedMcp.filter((entry) => entry !== id);
    onChange({ mcpServers: next.filter((entry, index) => next.indexOf(entry) === index).sort((a, b) => a.localeCompare(b)) });
  }

  return (
    <div className="project-role-panel">
      <h3 className="project-settings-heading">{roleId}</h3>

      <section className="role-config-section" aria-label="Model">
        <h3 className="role-config-section-title">Model</h3>
        <ul className="model-select-options role-config-options">
          <li>
            <button
              type="button"
              className={`model-select-option${!roleSettings.modelConfigId ? ' model-select-option-selected' : ''}`}
              onClick={() => onChange({ modelConfigId: undefined })}
            >
              <span className="model-select-option-name">Use per-flow default</span>
              <span className="model-select-option-meta">Decide model when each flow runs</span>
            </button>
          </li>
          {models.map((model) => (
            <li key={model.id}>
              <button
                type="button"
                className={`model-select-option${roleSettings.modelConfigId === model.id ? ' model-select-option-selected' : ''}`}
                onClick={() => onChange({ modelConfigId: model.id })}
              >
                <span className="model-select-option-name">{model.displayName}</span>
                <span className="model-select-option-meta">
                  {model.providerType} &middot; {model.modelId}{model.active ? ' · active' : ''}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="role-config-section" aria-label="Skills">
        <div className="project-section-head">
          <h3 className="role-config-section-title">Skills</h3>
          <label className="project-dimension-toggle">
            <input
              type="checkbox"
              checked={skillsConfigured}
              onChange={(event) => onChange({ skills: event.target.checked ? [] : undefined })}
            />
            <span>Set for this project</span>
          </label>
        </div>
        {skillsConfigured ? (
          skills.length === 0 ? (
            <p className="model-select-empty">No skills configured in runtime Settings.</p>
          ) : (
            <div className="skill-select-list role-config-options">
              {skills.map((skill) => {
                const selected = selectedSkills.includes(skill.name);
                return (
                  <label key={skill.name} className={`skill-select-option model-select-option${selected ? ' model-select-option-selected' : ''}`}>
                    <input type="checkbox" checked={selected} onChange={(event) => toggleSkill(skill.name, event.target.checked)} />
                    <span>
                      <span className="skill-select-name model-select-option-name">{skill.name}</span>
                      <span className="skill-select-desc model-select-option-meta">{skill.description}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          )
        ) : (
          <p className="model-select-empty">Skills are chosen per flow.</p>
        )}
      </section>

      <section className="role-config-section" aria-label="MCP">
        <div className="project-section-head">
          <h3 className="role-config-section-title">MCP</h3>
          <label className="project-dimension-toggle">
            <input
              type="checkbox"
              checked={mcpConfigured}
              onChange={(event) => onChange({ mcpServers: event.target.checked ? [] : undefined })}
            />
            <span>Set for this project</span>
          </label>
        </div>
        {mcpConfigured ? (
          mcpServers.length === 0 ? (
            <p className="model-select-empty">No MCP servers configured in runtime Settings.</p>
          ) : (
            <div className="skill-select-list role-config-options">
              {mcpServers.map((server) => {
                const selected = selectedMcp.includes(server.id);
                return (
                  <label key={server.id} className={`skill-select-option model-select-option${selected ? ' model-select-option-selected' : ''}`}>
                    <input type="checkbox" checked={selected} onChange={(event) => toggleMcp(server.id, event.target.checked)} />
                    <span>
                      <span className="skill-select-name model-select-option-name">{server.name}</span>
                      <span className="skill-select-desc model-select-option-meta">{server.transport} · {server.toolNames.length} tools</span>
                    </span>
                  </label>
                );
              })}
            </div>
          )
        ) : (
          <p className="model-select-empty">MCP servers are chosen per flow.</p>
        )}
      </section>
    </div>
  );
}

function ToolsPanel({
  mode,
  commandsText,
  onModeChange,
  onCommandsChange,
}: {
  mode: ProtocolConsentMode;
  commandsText: string;
  onModeChange: (mode: ProtocolConsentMode) => void;
  onCommandsChange: (text: string) => void;
}) {
  return (
    <div className="project-settings-panel">
      <h3 className="project-settings-heading">Tools</h3>
      <div className="form-field">
        <label className="form-label" htmlFor="project-permission-mode">Permission level</label>
        <select
          id="project-permission-mode"
          className="form-input form-select"
          value={mode}
          onChange={(event) => onModeChange(event.target.value as ProtocolConsentMode)}
        >
          <option value={CONSENT_MODE.NO_ACCESS}>No access</option>
          <option value={CONSENT_MODE.PARTIAL_ACCESS}>Partial access</option>
          <option value={CONSENT_MODE.FULL_ACCESS}>Full access</option>
        </select>
        <p className="form-note">
          Seeds the tool permission mode for new flows in this project.
        </p>
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="project-allowed-commands">Allowed commands</label>
        <textarea
          id="project-allowed-commands"
          className="form-textarea"
          value={commandsText}
          onChange={(event) => onCommandsChange(event.target.value)}
          placeholder={'One command per line, e.g.\nnpm test\ngit status'}
          rows={6}
        />
        <p className="form-note">
          Pre-approved bash commands (one per line). Applied under partial access.
        </p>
      </div>
    </div>
  );
}

function ImprovementPanel({
  improvement,
  feedback,
  onImprovementChange,
  onFeedbackChange,
}: {
  improvement: ProtocolImprovementChoiceMode | undefined;
  feedback: boolean | undefined;
  onImprovementChange: (value: '' | ProtocolImprovementChoiceMode) => void;
  onFeedbackChange: (value: 'ask' | 'yes' | 'no') => void;
}) {
  const feedbackValue: 'ask' | 'yes' | 'no' = feedback === undefined ? 'ask' : feedback ? 'yes' : 'no';
  return (
    <div className="project-settings-panel">
      <h3 className="project-settings-heading">Improvement &middot; Feedback</h3>
      <div className="form-field">
        <label className="form-label" htmlFor="project-improvement">Improvement</label>
        <select
          id="project-improvement"
          className="form-input form-select"
          value={improvement ?? ''}
          onChange={(event) => onImprovementChange(event.target.value as '' | ProtocolImprovementChoiceMode)}
        >
          {IMPROVEMENT_OPTIONS.map((option) => (
            <option key={option.value || 'ask'} value={option.value}>{option.label}</option>
          ))}
        </select>
        <p className="form-note">
          Applied automatically at the end of each flow instead of prompting.
        </p>
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="project-feedback">Generate upstream feedback</label>
        <select
          id="project-feedback"
          className="form-input form-select"
          value={feedbackValue}
          onChange={(event) => onFeedbackChange(event.target.value as 'ask' | 'yes' | 'no')}
        >
          {FEEDBACK_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <p className="form-note">
          Whether to generate upstream feedback after improvement completes.
        </p>
      </div>
    </div>
  );
}
