import { useEffect, useMemo, useState } from 'react';
import { useBranding } from '../branding/useBranding';
import { useApiKeys, useCreateApiKey, useDeleteApiKey, useRenameApiKey } from '../hooks/useApiKeys';
import { ApiKeyItem, CreateApiKeyResponse } from '../services/apiKeyService';

function buildEndpointDocs(scoreLabel: string) {
  return [
    {
      method: 'GET',
      path: '/api/v1/score/{vehicle_number}',
      title: 'Get Score',
      description: `Returns the ${scoreLabel}, risk label, premium modifier, and core score summary for a vehicle.`,
      auth: 'x-api-key',
      params: ['Path: vehicle_number', 'Header: x-api-key', 'Base URL: https://api.dbscore.in'],
      sampleVehicle: 'UP32AB1234'
    },
    {
      method: 'GET',
      path: '/api/v1/violations/{vehicle_number}',
      title: 'Get Violations',
      description: 'Returns challans, offense details, severity, deduction points, and violation metadata.',
      auth: 'x-api-key',
      params: ['Path: vehicle_number', 'Header: x-api-key', 'Use for violation-history screens'],
      sampleVehicle: 'MH04CD5678'
    },
    {
      method: 'GET',
      path: '/api/v1/vehicles/{vehicle_number}',
      title: 'Get Vehicle',
      description: 'Returns RC and vehicle profile details for a vehicle number.',
      auth: 'x-api-key',
      params: ['Path: vehicle_number', 'Header: x-api-key', 'Use for RC/profile lookup'],
      sampleVehicle: 'DL8CAF5031'
    }
  ] as const;
}

function buildGettingStarted(shortName: string) {
  return [
    {
      step: '1',
      title: 'Create an API key',
      description: `Generate a key from the API Keys panel below before calling any ${shortName} endpoint.`
    },
    {
      step: '2',
      title: 'Copy it securely',
      description: 'Store the raw key somewhere safe. You will use it later to authenticate every API request.'
    },
    {
      step: '3',
      title: 'Call the endpoints',
      description: 'Send the key in the `x-api-key` header and use the endpoint reference below to integrate.'
    }
  ] as const;
}

function formatDate(value: string | null) {
  if (!value) return 'Never';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function maskSecret(value: string) {
  if (!value) return '';
  const suffix = value.slice(-4);
  return `${'*'.repeat(Math.max(value.length - 4, 12))}${suffix}`;
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
  deletePending
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
            <span className="api-key-row-note">{status === 'revoked' ? 'This key has been revoked.' : 'This key is inactive.'}</span>
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
  const branding = useBranding();
  const { data: apiKeys = [], isLoading, error } = useApiKeys();
  const createMutation = useCreateApiKey();
  const renameMutation = useRenameApiKey();
  const deleteMutation = useDeleteApiKey();

  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<CreateApiKeyResponse | null>(null);
  const [copiedValue, setCopiedValue] = useState('');
  const [showCreatedKey, setShowCreatedKey] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [revokedKeys, setRevokedKeys] = useState<ApiKeyItem[]>([]);
  const endpointDocs = useMemo(() => buildEndpointDocs(branding.scoreLabel), [branding.scoreLabel]);
  const gettingStarted = useMemo(() => buildGettingStarted(branding.shortName), [branding.shortName]);

  const activeKeyCount = useMemo(() => apiKeys.filter((key) => key.is_active).length, [apiKeys]);

  const visibleKeys = useMemo(() => {
    const apiKeyIds = new Set(apiKeys.map((key) => key.id));
    return [...apiKeys, ...revokedKeys.filter((key) => !apiKeyIds.has(key.id))];
  }, [apiKeys, revokedKeys]);

  useEffect(() => {
    if (!createdKey) return;

    setShowCreatedKey(false);
    const timeoutId = window.setTimeout(() => {
      setCreatedKey(null);
      setCopiedValue('');
      setShowCreatedKey(false);
    }, 2 * 60 * 1000);

    return () => window.clearTimeout(timeoutId);
  }, [createdKey]);

  async function copyText(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedValue(value);
      window.setTimeout(() => {
        setCopiedValue((current) => (current === value ? '' : current));
      }, 2000);
    } catch {
      setCopiedValue('');
    }
  }

  async function handleCreateKey() {
    const trimmedName = newKeyName.trim();
    if (!trimmedName) return;

    const result = await createMutation.mutateAsync(trimmedName);
    setCreatedKey(result);
    setShowCreatedKey(false);
    setNewKeyName('');
  }

  async function handleSaveRename() {
    const trimmedName = editingName.trim();
    if (!editingId || !trimmedName) return;

    await renameMutation.mutateAsync({
      keyId: editingId,
      name: trimmedName
    });
    setEditingId(null);
    setEditingName('');
  }

  async function handleRevoke(item: ApiKeyItem) {
    const confirmed = window.confirm(`Revoke API key "${item.name}"? This action cannot be undone.`);
    if (!confirmed) return;

    await deleteMutation.mutateAsync(item.id);
    setRevokedKeys((current) => {
      if (current.some((key) => key.id === item.id)) return current;
      return [
        ...current,
        {
          ...item,
          is_active: false,
          last_used_at: item.last_used_at
        }
      ];
    });
    if (editingId === item.id) {
      setEditingId(null);
      setEditingName('');
    }
  }

  return (
    <div className="api-page">
      <section className="card api-hero-card">
        <p className="api-eyebrow">{branding.apiName} Console</p>
        <h1>Integrate the {branding.apiName} into your system</h1>
        <p>
          Use this page to generate a key, keep it safe, and then call the {branding.shortName} endpoints from your application using the
          <code>x-api-key</code> header.
        </p>
        <div className="api-hero-grid">
          <div className="api-hero-tile">
            <span>Base URL</span>
            <strong>https://api.dbscore.in</strong>
          </div>
          <div className="api-hero-tile">
            <span>Authentication</span>
            <strong>x-api-key</strong>
          </div>
          <div className="api-hero-tile">
            <span>Recommended flow</span>
            <strong>Generate key, copy safely, then call APIs</strong>
          </div>
        </div>
      </section>

      <section className="api-two-column">
        <div className="card api-guide-card">
          <div className="card-title">How to use this page</div>
          <div className="api-step-list">
            {gettingStarted.map((item) => (
              <div key={item.step} className="api-step-card">
                <div className="api-step-number">{item.step}</div>
                <div>
                  <div className="api-step-title">{item.title}</div>
                  <div className="api-step-description">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="api-callout">
            After you generate a key, store the raw value somewhere secure. You will use that same key for every other {branding.shortName} endpoint.
          </div>
        </div>

        <div className="card">
          <div className="card-title">API Keys</div>
          <div className="api-key-create-row">
            <input
              value={newKeyName}
              onChange={(event) => setNewKeyName(event.target.value)}
              className="api-key-input"
              placeholder="Give this key a name"
            />
            <button className="api-action-btn primary api-create-btn" onClick={handleCreateKey} disabled={createMutation.isPending || !newKeyName.trim()}>
              {createMutation.isPending ? 'Creating...' : 'Create API Key'}
            </button>
          </div>
          {createMutation.error ? <div className="api-key-message api-key-error">{createMutation.error.message}</div> : null}
          {createdKey ? (
            <div className="api-key-created">
              <div className="field-label">New API Key</div>
              <div className="api-key-box">
                <div className="api-key-value">{showCreatedKey ? createdKey.raw_key : maskSecret(createdKey.raw_key)}</div>
                <button className="api-action-btn" onClick={() => setShowCreatedKey((current) => !current)}>
                  {showCreatedKey ? 'Hide' : 'Reveal'}
                </button>
                <button className="api-action-btn" onClick={() => copyText(createdKey.raw_key)}>
                  {copiedValue === createdKey.raw_key ? 'Copied' : 'Copy'}
                </button>
                <button className="api-action-btn" onClick={() => setCreatedKey(null)}>
                  Clear
                </button>
              </div>
              <div className="api-key-message api-key-warning">
                {createdKey.warning} This value is hidden by default and will be cleared from this screen automatically.
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
            {isLoading ? <div className="api-key-empty">Loading API keys...</div> : null}
            {error ? <div className="api-key-message api-key-error">{error.message}</div> : null}
            {!isLoading && !error && apiKeys.length === 0 ? <div className="api-key-empty">No API keys created yet.</div> : null}
            {!isLoading && !error
              ? visibleKeys.map((item) => (
                  <ApiKeyRow
                    key={item.id}
                    item={item}
                    status={revokedKeys.some((key) => key.id === item.id) ? 'revoked' : item.is_active ? 'active' : 'inactive'}
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
                      setEditingName('');
                    }}
                    onSaveRename={handleSaveRename}
                    onRevoke={handleRevoke}
                    renamePending={renameMutation.isPending && editingId === item.id}
                    deletePending={deleteMutation.isPending}
                  />
                ))
              : null}
          </div>
          {renameMutation.error || deleteMutation.error ? (
            <div className="api-key-message api-key-error">{renameMutation.error?.message || deleteMutation.error?.message}</div>
          ) : null}
        </div>
      </section>

      <section className="card api-reference-card">
        <div className="api-reference-header">
          <div>
            <div className="card-title">Endpoint reference</div>
            <p className="api-reference-copy">
              These are the public {branding.shortName} endpoints you can integrate after generating a key. Each request should include the
              <code>x-api-key</code> header.
            </p>
          </div>
        </div>
        <div className="api-catalog">
          {endpointDocs.map((api) => (
            <div key={api.path} className="api-endpoint-card">
              <div className="api-endpoint-header">
                <span className="api-method-tag">{api.method}</span>
                <span className="api-endpoint-path">{api.path}</span>
              </div>
              <div className="api-endpoint-title">{api.title}</div>
              <div className="api-endpoint-description">{api.description}</div>
              <div className="api-endpoint-param-list">
                {api.params.map((param) => (
                  <span key={param} className="api-param-chip">
                    {param}
                  </span>
                ))}
              </div>
              <div className="api-endpoint-meta">
                <span>Auth: {api.auth}</span>
                <span>Vehicle: {api.sampleVehicle}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
