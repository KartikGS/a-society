import { SquarePen, Trash2 } from 'lucide-react';
import type React from 'react';
import type { McpServerSummary } from '../../../../shared/settings.js';
import type { McpFormState } from './settings-types';

interface McpSettingsPanelProps {
  servers: McpServerSummary[];
  form: McpFormState;
  editingId: string | null;
  saving: boolean;
  onChange: (updater: (current: McpFormState) => McpFormState) => void;
  onSubmit: (e: React.FormEvent) => void;
  onEdit: (id: string) => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
}

export function McpSettingsPanel({
  servers,
  form,
  editingId,
  saving,
  onChange,
  onSubmit,
  onEdit,
  onCancelEdit,
  onDelete,
}: McpSettingsPanelProps) {
  const isEditing = editingId !== null;
  return (
    <div className="settings-section">
      <div className="settings-section-header">
        <h3 className="settings-section-title">MCP</h3>
      </div>

      {servers.length === 0 ? (
        <p className="settings-empty">No MCP servers configured.</p>
      ) : (
        <ul className="model-list">
          {servers.map((server) => (
            <li key={server.id} className="model-card">
              <div className="model-card-main">
                <div className="model-card-name">{server.name}</div>
                <div className="model-card-meta">
                  <span>{server.transport}</span>
                  <span className="model-meta-sep">·</span>
                  <span>{server.toolNames.length} tools</span>
                  {server.toolNames.length > 0 ? (
                    <>
                      <span className="model-meta-sep">·</span>
                      <span>{server.toolNames.join(', ')}</span>
                    </>
                  ) : null}
                </div>
              </div>
              <div className="model-card-actions">
                <button
                  type="button"
                  className="model-action-icon-btn"
                  disabled={saving}
                  onClick={() => onEdit(server.id)}
                  aria-label={`Edit ${server.name}`}
                  title={`Edit ${server.name}`}
                >
                  <SquarePen aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="model-action-icon-btn model-delete-btn"
                  disabled={saving}
                  onClick={() => onDelete(server.id)}
                  aria-label={`Delete ${server.name}`}
                  title={`Delete ${server.name}`}
                >
                  <Trash2 aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form className="tool-settings-form skills-import-form" onSubmit={onSubmit} noValidate>
        <section className="tool-settings-card">
          <div className="tool-settings-header">
            <div>
              <h4 className="tool-settings-subtitle">{isEditing ? 'Edit MCP Server' : 'Add MCP Server'}</h4>
              <p className="tool-settings-copy">Saves only after a connection test and tool discovery succeed.</p>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label" htmlFor="sf-mcpName">Name</label>
              <input
                id="sf-mcpName"
                className="form-input"
                type="text"
                value={form.name}
                onChange={(e) => onChange((current) => ({ ...current, name: e.target.value }))}
                placeholder="linear"
              />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="sf-mcpTransport">Transport</label>
              <select
                id="sf-mcpTransport"
                className="form-input form-select"
                value={form.transport}
                onChange={(e) => onChange((current) => ({ ...current, transport: e.target.value as McpFormState['transport'] }))}
              >
                <option value="stdio">stdio</option>
                <option value="http">http</option>
              </select>
            </div>
          </div>

          {form.transport === 'stdio' ? (
            <>
              <div className="form-field">
                <label className="form-label" htmlFor="sf-mcpCommand">Command</label>
                <input
                  id="sf-mcpCommand"
                  className="form-input"
                  type="text"
                  value={form.command}
                  onChange={(e) => onChange((current) => ({ ...current, command: e.target.value }))}
                  placeholder="npx"
                />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="sf-mcpArgs">Args</label>
                <textarea
                  id="sf-mcpArgs"
                  className="form-input form-textarea form-textarea-compact"
                  value={form.args}
                  onChange={(e) => onChange((current) => ({ ...current, args: e.target.value }))}
                  rows={3}
                  placeholder={'-y\n@modelcontextprotocol/server-example'}
                />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="sf-mcpEnv">Env vars</label>
                <textarea
                  id="sf-mcpEnv"
                  className="form-input form-textarea form-textarea-compact"
                  value={form.envText}
                  onChange={(e) => onChange((current) => ({ ...current, envText: e.target.value }))}
                  rows={3}
                  placeholder="TOKEN=..."
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-field">
                <label className="form-label" htmlFor="sf-mcpUrl">URL</label>
                <input
                  id="sf-mcpUrl"
                  className="form-input"
                  type="url"
                  value={form.url}
                  onChange={(e) => onChange((current) => ({ ...current, url: e.target.value }))}
                  placeholder="https://example.com/mcp"
                />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="sf-mcpHeaders">Headers</label>
                <textarea
                  id="sf-mcpHeaders"
                  className="form-input form-textarea form-textarea-compact"
                  value={form.headersText}
                  onChange={(e) => onChange((current) => ({ ...current, headersText: e.target.value }))}
                  rows={3}
                  placeholder="Authorization=Bearer ..."
                />
              </div>
            </>
          )}

          <div className="form-actions">
            {isEditing ? (
              <button type="button" className="form-btn-cancel" disabled={saving} onClick={onCancelEdit}>
                Cancel
              </button>
            ) : null}
            <button type="submit" className="form-btn-submit" disabled={saving}>
              {saving ? 'Validating...' : isEditing ? 'Save MCP Server' : 'Add MCP Server'}
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}
