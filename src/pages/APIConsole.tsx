import { useMemo, useState } from "react";
import {
  useApiKeys,
  useCreateApiKey,
  useDeleteApiKey,
  useRenameApiKey,
} from "../hooks/useApiKeys";
import { ApiKeyItem, CreateApiKeyResponse } from "../services/apiKeyService";

const publicApis = [
  {
    method: "GET",
    path: "/api/v1/score/{vehicle_number}",
    title: "Get Score",
    description: "Get the DBS-Bajaj score and premium view for a vehicle number.",
    auth: "x-api-key",
    sampleVehicle: "UP32AB1234",
  },
  {
    method: "GET",
    path: "/api/v1/violations/{vehicle_number}",
    title: "Get Violations",
    description:
      "Get active challans and violation details for a vehicle number.",
    auth: "x-api-key",
    sampleVehicle: "MH04CD5678",
  },
  {
    method: "GET",
    path: "/api/v1/vehicles/{vehicle_number}",
    title: "Get Vehicle",
    description: "Get RC and vehicle profile details for a vehicle number.",
    auth: "x-api-key",
    sampleVehicle: "DL8CAF5031",
  },
] as const;

function formatDate(value: string | null) {
  if (!value) return "Never";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ApiKeyRow({
  item,
  status,
  isEditing,
  editName,
  onEditNameChange,
  onStartRename,
  onCancelRename,
  onSaveRename,
  onRevoke,
  renamePending,
  deletePending,
}: {
  item: ApiKeyItem;
  status: 'active' | 'inactive' | 'revoked';
  isEditing: boolean;
  editName: string;
  onEditNameChange: (value: string) => void;
  onStartRename: (item: ApiKeyItem) => void;
  onCancelRename: () => void;
  onSaveRename: () => void;
  onRevoke: (item: ApiKeyItem) => void;
  renamePending: boolean;
  deletePending: boolean;
}) {
  const isReadOnly = status !== 'active';

  return (
    <div className="api-key-row">
      <div className="api-key-row-top">
        <div className="api-key-row-main">
          <div className="api-key-row-title-wrap">
            {isEditing ? (
              <input
                value={editName}
                onChange={(event) => onEditNameChange(event.target.value)}
                className="api-key-input api-key-edit-input"
                placeholder="Key name"
              />
            ) : (
              <div className="api-key-row-title">{item.name}</div>
            )}
            <div className={status === 'active' ? 'api-key-status-badge' : 'api-key-status-badge muted'}>
              {status === 'active' ? 'Active' : status === 'revoked' ? 'Revoked' : 'Inactive'}
            </div>
          </div>
          <div className="api-key-row-prefix">{item.key_prefix}</div>
        </div>
        <div className="api-key-actions">
          {isReadOnly ? (
            <span className="api-key-row-note">
              {status === 'revoked' ? 'This key has been revoked.' : 'This key is inactive.'}
            </span>
          ) : isEditing ? (
            <>
              <button className="api-action-btn primary" onClick={onSaveRename} disabled={renamePending || !editName.trim()}>
                {renamePending ? 'Saving...' : 'Save'}
              </button>
              <button className="api-action-btn" onClick={onCancelRename} disabled={renamePending}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <button className="api-action-btn" onClick={() => onStartRename(item)} disabled={deletePending}>
                Rename
              </button>
              <button className="api-action-btn danger" onClick={() => onRevoke(item)} disabled={deletePending}>
                {deletePending ? 'Revoking...' : 'Revoke'}
              </button>
            </>
          )}
        </div>
      </div>
      <div className="api-key-row-meta">
        <div className="api-key-meta-chip">
          <span className="api-key-meta-label">Created</span>
          <span className="api-key-meta-value">{formatDate(item.created_at)}</span>
        </div>
        <div className="api-key-meta-chip">
          <span className="api-key-meta-label">Last Used</span>
          <span className="api-key-meta-value">{formatDate(item.last_used_at)}</span>
        </div>
      </div>
    </div>
  );
}

export default function APIConsole() {
  const { data: apiKeys = [], isLoading, error } = useApiKeys();
  const createMutation = useCreateApiKey();
  const renameMutation = useRenameApiKey();
  const deleteMutation = useDeleteApiKey();

  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<CreateApiKeyResponse | null>(
    null,
  );
  const [copiedValue, setCopiedValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [revokedKeys, setRevokedKeys] = useState<ApiKeyItem[]>([]);

  const activeKeyCount = useMemo(
    () => apiKeys.filter((key) => key.is_active).length,
    [apiKeys],
  );

  const visibleKeys = useMemo(() => {
    const apiKeyIds = new Set(apiKeys.map((key) => key.id));
    return [...apiKeys, ...revokedKeys.filter((key) => !apiKeyIds.has(key.id))];
  }, [apiKeys, revokedKeys]);

  async function copyText(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedValue(value);
      window.setTimeout(() => {
        setCopiedValue((current) => (current === value ? "" : current));
      }, 2000);
    } catch {
      setCopiedValue("");
    }
  }

  async function handleCreateKey() {
    const trimmedName = newKeyName.trim();
    if (!trimmedName) return;

    const result = await createMutation.mutateAsync(trimmedName);
    setCreatedKey(result);
    setNewKeyName("");
  }

  async function handleSaveRename() {
    const trimmedName = editingName.trim();
    if (!editingId || !trimmedName) return;

    await renameMutation.mutateAsync({
      keyId: editingId,
      name: trimmedName,
    });
    setEditingId(null);
    setEditingName("");
  }

  async function handleRevoke(item: ApiKeyItem) {
    const confirmed = window.confirm(
      `Revoke API key "${item.name}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    await deleteMutation.mutateAsync(item.id);
    setRevokedKeys((current) => {
      if (current.some((key) => key.id === item.id)) return current;
      return [
        ...current,
        {
          ...item,
          is_active: false,
          last_used_at: item.last_used_at,
        },
      ];
    });
    if (editingId === item.id) {
      setEditingId(null);
      setEditingName("");
    }
  }

  return (
    <div className="api-layout">
      <div>
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title">Public APIs</div>
          <div className="api-catalog">
            {publicApis.map((api) => (
              <div key={api.path} className="api-endpoint-card">
                <div className="api-endpoint-header">
                  <span className="api-method-tag">{api.method}</span>
                  <span className="api-endpoint-path">{api.path}</span>
                </div>
                <div className="api-endpoint-title">{api.title}</div>
                <div className="api-endpoint-description">
                  {api.description}
                </div>
                <div className="api-endpoint-meta">
                  <span>Auth: {api.auth}</span>
                  <span>Vehicle: {api.sampleVehicle}</span>
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 14,
              padding: 12,
              background: "var(--surface2)",
              borderRadius: 8,
              fontFamily: "DM Mono, monospace",
              fontSize: 11,
              color: "var(--text2)",
              lineHeight: 1.8,
            }}
          >
            <span style={{ color: "var(--text3)" }}>Header</span> x-api-key:{" "}
            {"<"}your-api-key{">"}
            <br />
            <span style={{ color: "var(--text3)" }}>Base URL</span>{" "}
            https://driver-behavior-score.onrender.com
            <br />
            <span style={{ color: "var(--text3)" }}>Use the API keys</span> to
            authenticate these public endpoints.
          </div>
        </div>
      </div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">API Keys</div>
        <div className="api-key-create-row">
          <input
            value={newKeyName}
            onChange={(event) => setNewKeyName(event.target.value)}
            className="api-key-input"
            placeholder="Give this key a name"
          />
          <button
            className="api-action-btn primary api-create-btn"
            onClick={handleCreateKey}
            disabled={createMutation.isPending || !newKeyName.trim()}
          >
            {createMutation.isPending ? "Creating..." : "Create API Key"}
          </button>
        </div>
        {createMutation.error ? (
          <div className="api-key-message api-key-error">
            {createMutation.error.message}
          </div>
        ) : null}
        {createdKey ? (
          <div className="api-key-created">
            <div className="field-label">New API Key</div>
            <div className="api-key-box">
              <div className="api-key-value">{createdKey.raw_key}</div>
              <button
                className="api-action-btn"
                onClick={() => copyText(createdKey.raw_key)}
              >
                {copiedValue === createdKey.raw_key ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="api-key-message api-key-warning">
              {createdKey.warning}
            </div>
          </div>
        ) : null}
        <div className="api-key-summary">
          <div className="sla-item">
            <div className="sla-value">{apiKeys.length}</div>
            <div className="sla-label">Total Keys</div>
          </div>
          <div className="sla-item">
            <div className="sla-value">{activeKeyCount}</div>
            <div className="sla-label">Active Keys</div>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <div className="field-label">Stored Keys</div>
          {isLoading ? (
            <div className="api-key-empty">Loading API keys...</div>
          ) : null}
          {error ? (
            <div className="api-key-message api-key-error">{error.message}</div>
          ) : null}
          {!isLoading && !error && apiKeys.length === 0 ? (
            <div className="api-key-empty">No API keys created yet.</div>
          ) : null}
          {!isLoading && !error
            ? visibleKeys.map((item) => (
                <ApiKeyRow
                  key={item.id}
                  item={item}
                  status={
                    revokedKeys.some((key) => key.id === item.id)
                      ? 'revoked'
                      : item.is_active
                        ? 'active'
                        : 'inactive'
                  }
                  isEditing={editingId === item.id && item.is_active && !revokedKeys.some((key) => key.id === item.id)}
                  editName={editingId === item.id ? editingName : item.name}
                  onEditNameChange={setEditingName}
                  onStartRename={(keyItem) => {
                    if (!keyItem.is_active || revokedKeys.some((key) => key.id === keyItem.id)) return;
                    setEditingId(keyItem.id);
                    setEditingName(keyItem.name);
                  }}
                  onCancelRename={() => {
                    setEditingId(null);
                    setEditingName("");
                  }}
                  onSaveRename={handleSaveRename}
                  onRevoke={handleRevoke}
                  renamePending={
                    renameMutation.isPending && editingId === item.id
                  }
                  deletePending={deleteMutation.isPending}
                />
              ))
            : null}
        </div>
        {renameMutation.error || deleteMutation.error ? (
          <div className="api-key-message api-key-error">
            {renameMutation.error?.message || deleteMutation.error?.message}
          </div>
        ) : null}
      </div>

      {/* <div className="card">
          <div className="card-title">SLA Metrics (Live)</div>
          <div className="sla-grid">
            <div className="sla-item">
              <div className="sla-value">99.98%</div>
              <div className="sla-label">Uptime (30d)</div>
            </div>
            <div className="sla-item">
              <div className="sla-value">124ms</div>
              <div className="sla-label">Avg Response</div>
            </div>
            <div className="sla-item">
              <div className="sla-value">847</div>
              <div className="sla-label">Calls Today</div>
            </div>
          </div>
        </div> */}

      {/* <div className="card">
        <div className="card-title">Recent API Calls</div>
        <div className="log-list">
          <div className="log-item" style={{ background: 'var(--surface3)', fontSize: 10, fontWeight: 500 }}>
            <span>TIME</span>
            <span>REG NO.</span>
            <span>ENDPOINT</span>
            <span>RESP (ms)</span>
            <span>STATUS</span>
          </div>
          <div className="log-item">
            <span className="log-time">11:48:32</span>
            <span className="log-reg">UP32AB****</span>
            <span className="log-endpoint">/v1/score</span>
            <span className="log-ms">112ms</span>
            <span className="log-status log-200">200</span>
          </div>
          <div className="log-item">
            <span className="log-time">11:48:11</span>
            <span className="log-reg">MH04CD****</span>
            <span className="log-endpoint">/v1/score</span>
            <span className="log-ms">98ms</span>
            <span className="log-status log-200">200</span>
          </div>
          <div className="log-item">
            <span className="log-time">11:47:59</span>
            <span className="log-reg">DL8CAF****</span>
            <span className="log-endpoint">/v1/score</span>
            <span className="log-ms">134ms</span>
            <span className="log-status log-200">200</span>
          </div>
          <div className="log-item">
            <span className="log-time">11:47:45</span>
            <span className="log-reg">KA01MN****</span>
            <span className="log-endpoint">/v1/score</span>
            <span className="log-ms">-</span>
            <span className="log-status log-404">404</span>
          </div>
          <div className="log-item">
            <span className="log-time">11:47:30</span>
            <span className="log-reg">TN09GH****</span>
            <span className="log-endpoint">/v1/score</span>
            <span className="log-ms">141ms</span>
            <span className="log-status log-200">200</span>
          </div>
          <div className="log-item">
            <span className="log-time">11:47:18</span>
            <span className="log-reg">UP80EF****</span>
            <span className="log-endpoint">/v1/batch</span>
            <span className="log-ms">2.1s</span>
            <span className="log-status log-200">200</span>
          </div>
          <div className="log-item">
            <span className="log-time">11:46:55</span>
            <span className="log-reg">GJ05AB****</span>
            <span className="log-endpoint">/v1/score</span>
            <span className="log-ms">119ms</span>
            <span className="log-status log-200">200</span>
          </div>
        </div>
      </div> */}
    </div>
  );
}
