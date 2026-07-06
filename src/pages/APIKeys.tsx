import { useEffect, useMemo, useState } from 'react';
import { useBranding } from '../branding/useBranding';
import { useApiKeys, useCreateApiKey, useDeleteApiKey, useRenameApiKey, useRotateApiKey } from '../hooks/useApiKeys';
import { ApiKeyItem, CreateApiKeyResponse } from '../services/apiKeyService';

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
  if (value.length <= 16) {
    const suffix = value.slice(-4);
    return `${value.slice(0, 4)}*******${suffix}`;
  }
  const prefix = value.slice(0, 12);
  const suffix = value.slice(-4);
  return `${prefix}*******${suffix}`;
}

export default function APIKeys() {
  const branding = useBranding();
  const { data: apiKeys = [], isLoading, error } = useApiKeys();
  const createMutation = useCreateApiKey();
  const renameMutation = useRenameApiKey();
  const deleteMutation = useDeleteApiKey();
  const rotateMutation = useRotateApiKey();

  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<CreateApiKeyResponse | null>(null);
  const [copiedValue, setCopiedValue] = useState('');
  const [showCreatedKey, setShowCreatedKey] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [revokedKeys, setRevokedKeys] = useState<ApiKeyItem[]>([]);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isRevokeOpen, setIsRevokeOpen] = useState(false);
  const [keyToRevoke, setKeyToRevoke] = useState<ApiKeyItem | null>(null);
  const [isRevoked, setIsRevoked] = useState(false);
  const [isRotateOpen, setIsRotateOpen] = useState(false);
  const [keyToRotate, setKeyToRotate] = useState<ApiKeyItem | null>(null);
  const [rotatedKeyResult, setRotatedKeyResult] = useState<CreateApiKeyResponse | null>(null);
  const [showRotatedKey, setShowRotatedKey] = useState(false);
  const [rotateError, setRotateError] = useState<string | null>(null);

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
      <section className="card api-hero-card" style={{ marginBottom: 0 }}>
        <p className="api-eyebrow">{branding.apiName} Keys</p>
        <h1>Manage your credentials for the {branding.apiName}</h1>
        <p style={{ margin: '8px 0 0 0' }}>
          Generate, rotate, and manage secure credentials to query the vehicle scores and profiling endpoints directly.
        </p>
      </section>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text)' }}>
            Active API keys ({apiKeys.length})
          </h2>
          <button
            className="api-action-btn primary"
            onClick={() => {
              setNewKeyName('');
              setIsCreateOpen(true);
            }}
            id="api-key-create-modal-trigger"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create new API key
          </button>
        </div>

        <div className="api-keys-container">

          {createMutation.error ? (
            <div className="api-key-message api-key-error">{createMutation.error.message}</div>
          ) : null}



          <div style={{ marginTop: 14 }}>
            {isLoading ? <div className="api-key-empty">Loading API credentials...</div> : null}
            {error ? <div className="api-key-message api-key-error">{error.message}</div> : null}
            {!isLoading && !error && apiKeys.length === 0 ? (
              <div className="api-key-empty">No active credentials found. Generate a key above to start integrating.</div>
            ) : null}

            {!isLoading && !error && visibleKeys.length > 0 ? (
              <div className="api-keys-table-container">
                 <table className="api-keys-table">
                  <thead>
                    <tr>
                      <th style={{ width: '25%' }}>Name</th>
                      <th style={{ width: '12%' }}>Status</th>
                      <th style={{ width: '18%' }}>Prefix</th>
                      <th style={{ width: '15%' }}>Created</th>
                      <th style={{ width: '15%' }}>Last Used</th>
                      <th style={{ width: '10%' }}>Expires At</th>
                      <th style={{ width: '5%', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleKeys.map((item) => {
                      const isRevoked = revokedKeys.some((key) => key.id === item.id) || !item.is_active;
                      const status = isRevoked ? 'revoked' : 'active';
                      const actionsPending = renameMutation.isPending || deleteMutation.isPending || rotateMutation.isPending;

                      return (
                        <tr key={item.id}>
                          <td>
                            <span style={{ fontWeight: 600 }}>{item.name}</span>
                          </td>
                          <td>
                            <span className={`api-keys-badge ${status}`}>
                              {status === 'active' ? 'Active' : 'Revoked'}
                            </span>
                          </td>
                          <td>
                            <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, background: 'var(--surface2)', padding: '2px 6px', borderRadius: 4 }}>
                              {item.key_prefix}
                            </code>
                          </td>
                          <td>{formatDate(item.created_at)}</td>
                          <td>{formatDate(item.last_used_at)}</td>
                          <td>{item.expires_at ? formatDate(item.expires_at) : 'Never'}</td>
                          <td style={{ textAlign: 'center' }}>
                            <div className="api-keys-actions-cell" style={{ justifyContent: 'center' }}>
                              {isRevoked ? (
                                <span style={{ color: 'var(--text3)', fontSize: 12 }}>None</span>
                              ) : (
                                <>
                                  <button
                                    className="api-key-icon-btn"
                                    onClick={() => {
                                      setEditingId(item.id);
                                      setEditingName(item.name);
                                      setIsRenameOpen(true);
                                    }}
                                    disabled={actionsPending}
                                    title="Rename Key"
                                    id={`rename-btn-${item.id}`}
                                  >
                                    <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                                    </svg>
                                  </button>
                                  <button
                                    className="api-key-icon-btn"
                                    onClick={() => {
                                      setKeyToRotate(item);
                                      setIsRotateOpen(true);
                                      setRotatedKeyResult(null);
                                      setShowRotatedKey(false);
                                      setRotateError(null);
                                    }}
                                    disabled={actionsPending}
                                    title="Rotate (Regenerate) Key"
                                    id={`rotate-btn-${item.id}`}
                                  >
                                    <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                    </svg>
                                  </button>
                                  <button
                                    className="api-key-icon-btn danger"
                                    onClick={() => {
                                      setKeyToRevoke(item);
                                      setIsRevokeOpen(true);
                                    }}
                                    disabled={actionsPending}
                                    title="Revoke Key"
                                    id={`revoke-btn-${item.id}`}
                                  >
                                    <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                    </svg>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>

          {renameMutation.error || deleteMutation.error || rotateMutation.error ? (
            <div className="api-key-message api-key-error">
              {renameMutation.error?.message || deleteMutation.error?.message || rotateMutation.error?.message}
            </div>
          ) : null}
        </div>
      </div>

      {/* Create Modal Dialog */}
      {isCreateOpen && (
        <div className="api-modal-overlay" onClick={() => {
          if (!createMutation.isPending) {
            setIsCreateOpen(false);
            setCreatedKey(null);
          }
        }}>
          <div className="api-modal" onClick={(e) => e.stopPropagation()}>
            <div className="api-modal-title">Create API Key</div>
            
            {!createdKey ? (
              <>
                <div className="api-modal-body">
                  <label className="api-modal-label" htmlFor="create-key-name">Key Name</label>
                  <input
                    id="create-key-name"
                    type="text"
                    className="api-modal-input"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. Underwriting Production"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newKeyName.trim() && !createMutation.isPending) {
                        handleCreateKey();
                      }
                    }}
                  />
                </div>
                <div className="api-modal-actions">
                  <button
                    className="api-action-btn"
                    onClick={() => {
                      setIsCreateOpen(false);
                      setCreatedKey(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="api-action-btn primary"
                    disabled={!newKeyName.trim() || createMutation.isPending}
                    onClick={async () => {
                      await handleCreateKey();
                    }}
                  >
                    {createMutation.isPending ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="api-modal-body">
                  <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text2)', lineHeight: 1.5 }}>
                    A new secret API key has been generated for <strong>"{createdKey.name}"</strong>.
                  </p>

                  <div className="field-label">New Secret API Key</div>
                  <div className="api-key-box" style={{ marginBottom: 16, flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>
                    <div 
                      className="api-key-value" 
                      style={{ 
                        width: '100%',
                        whiteSpace: showCreatedKey ? 'normal' : 'nowrap',
                        wordBreak: showCreatedKey ? 'break-all' : 'normal'
                      }}
                    >
                      {showCreatedKey ? createdKey.raw_key : maskSecret(createdKey.raw_key)}
                    </div>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-start' }}>
                      <button
                        className="api-action-btn"
                        onClick={() => setShowCreatedKey((current) => !current)}
                      >
                        {showCreatedKey ? 'Hide' : 'Reveal'}
                      </button>
                      <button
                        className="api-action-btn"
                        onClick={() => copyText(createdKey.raw_key)}
                      >
                        {copiedValue === createdKey.raw_key ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div className="api-keys-warning-banner">
                    <svg style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <strong>Security notice:</strong> Store this API key securely. It will never be shown again.
                    </div>
                  </div>
                </div>
                <div className="api-modal-actions">
                  <button
                    className="api-action-btn primary"
                    onClick={() => {
                      setIsCreateOpen(false);
                      setCreatedKey(null);
                      setShowCreatedKey(false);
                    }}
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Rename Modal Dialog */}
      {isRenameOpen && (
        <div className="api-modal-overlay" onClick={() => {
          setIsRenameOpen(false);
          setEditingId(null);
          setEditingName('');
        }}>
          <div className="api-modal" onClick={(e) => e.stopPropagation()}>
            <div className="api-modal-title">Rename API Key</div>
            <div className="api-modal-body">
              <label className="api-modal-label" htmlFor="rename-key-name">Key Name</label>
              <input
                id="rename-key-name"
                type="text"
                className="api-modal-input"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                placeholder="e.g. Underwriting Live"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && editingName.trim() && !renameMutation.isPending) {
                    handleSaveRename().then(() => setIsRenameOpen(false));
                  }
                }}
              />
            </div>
            <div className="api-modal-actions">
              <button
                className="api-action-btn"
                onClick={() => {
                  setIsRenameOpen(false);
                  setEditingId(null);
                  setEditingName('');
                }}
              >
                Cancel
              </button>
              <button
                className="api-action-btn primary"
                disabled={!editingName.trim() || renameMutation.isPending}
                onClick={async () => {
                  await handleSaveRename();
                  setIsRenameOpen(false);
                }}
              >
                {renameMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke Modal Dialog */}
      {isRevokeOpen && keyToRevoke && (
        <div className="api-modal-overlay" onClick={() => {
          if (!deleteMutation.isPending) {
            setIsRevokeOpen(false);
            setKeyToRevoke(null);
            setIsRevoked(false);
          }
        }}>
          <div className="api-modal" onClick={(e) => e.stopPropagation()}>
            <div className="api-modal-title" style={{ color: 'var(--red)' }}>Revoke API Key</div>
            
            {!isRevoked ? (
              <>
                <div className="api-modal-body">
                  <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text2)', lineHeight: 1.5 }}>
                    Are you sure you want to revoke the API key <strong>"{keyToRevoke.name}"</strong>?
                  </p>
                  <div className="api-keys-warning-banner danger">
                    <svg style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      This API key will be revoked immediately and be no longer usable. This action cannot be undone.
                    </div>
                  </div>
                </div>
                <div className="api-modal-actions">
                  <button
                    className="api-action-btn"
                    onClick={() => {
                      setIsRevokeOpen(false);
                      setKeyToRevoke(null);
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    Cancel
                  </button>
                  <button
                    className="api-action-btn primary"
                    style={{ background: 'var(--red)', borderColor: 'var(--red)' }}
                    disabled={deleteMutation.isPending}
                    onClick={async () => {
                      try {
                        await handleRevoke(keyToRevoke);
                        setIsRevoked(true);
                      } catch (err: any) {
                        alert(err.message || 'Unable to revoke API key');
                      }
                    }}
                  >
                    {deleteMutation.isPending ? 'Revoking...' : 'Yes, Revoke'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="api-modal-body">
                  <div className="api-keys-warning-banner danger" style={{ margin: 0 }}>
                    <svg style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      The API key <strong>"{keyToRevoke.name}"</strong> has been successfully revoked and is no longer usable.
                    </div>
                  </div>
                </div>
                <div className="api-modal-actions">
                  <button
                    className="api-action-btn primary"
                    onClick={() => {
                      setIsRevokeOpen(false);
                      setKeyToRevoke(null);
                      setIsRevoked(false);
                    }}
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Rotate Modal Dialog */}
      {isRotateOpen && keyToRotate && (
        <div className="api-modal-overlay" onClick={() => {
          if (!rotateMutation.isPending) {
            setIsRotateOpen(false);
            setKeyToRotate(null);
            setRotatedKeyResult(null);
            setShowRotatedKey(false);
            setRotateError(null);
          }
        }}>
          <div className="api-modal" onClick={(e) => e.stopPropagation()}>
            <div className="api-modal-title">Rotate API Key</div>
            
            {!rotatedKeyResult ? (
              <>
                <div className="api-modal-body">
                  <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text2)', lineHeight: 1.5 }}>
                    Are you sure you want to rotate the API key <strong>"{keyToRotate.name}"</strong>?
                  </p>
                  <p style={{ margin: '0 0 16px 0', fontSize: '13.5px', color: 'var(--text2)', lineHeight: 1.5 }}>
                    A new permanent API key will be generated immediately, and the existing key will remain active under a grace period of 24 hours before it is permanently deleted.
                  </p>

                  {rotateError && (
                    <div className="api-keys-warning-banner danger" style={{ marginTop: 12 }}>
                      <svg style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        {rotateError}
                      </div>
                    </div>
                  )}
                </div>
                <div className="api-modal-actions">
                  <button
                    className="api-action-btn"
                    onClick={() => {
                      setIsRotateOpen(false);
                      setKeyToRotate(null);
                      setRotateError(null);
                    }}
                    disabled={rotateMutation.isPending}
                  >
                    Cancel
                  </button>
                  <button
                    className="api-action-btn primary"
                    onClick={async () => {
                      if (keyToRotate.expires_at) {
                        setRotateError('Already scheduled for expiration.');
                        return;
                      }
                      try {
                        setRotateError(null);
                        const result = await rotateMutation.mutateAsync(keyToRotate.id);
                        setRotatedKeyResult(result);
                        setShowRotatedKey(false);
                      } catch (err: any) {
                        setRotateError(err.message || 'Unable to rotate API key');
                      }
                    }}
                    disabled={rotateMutation.isPending}
                  >
                    {rotateMutation.isPending ? 'Generating...' : 'Yes, Rotate Key'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="api-modal-body">
                  <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text2)', lineHeight: 1.5 }}>
                    A new secret API key has been generated for <strong>"{rotatedKeyResult.name}"</strong>.
                  </p>

                  <div className="field-label">New Secret API Key</div>
                  <div className="api-key-box" style={{ marginBottom: 16, flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>
                    <div 
                      className="api-key-value" 
                      style={{ 
                        width: '100%',
                        whiteSpace: showRotatedKey ? 'normal' : 'nowrap',
                        wordBreak: showRotatedKey ? 'break-all' : 'normal'
                      }}
                    >
                      {showRotatedKey ? rotatedKeyResult.raw_key : maskSecret(rotatedKeyResult.raw_key)}
                    </div>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-start' }}>
                      <button
                        className="api-action-btn"
                        onClick={() => setShowRotatedKey((current) => !current)}
                      >
                        {showRotatedKey ? 'Hide' : 'Reveal'}
                      </button>
                      <button
                        className="api-action-btn"
                        onClick={() => copyText(rotatedKeyResult.raw_key)}
                      >
                        {copiedValue === rotatedKeyResult.raw_key ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div className="api-keys-warning-banner">
                    <svg style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <strong>Security notice:</strong> Store this API key securely. For your security, this key value will never be shown again.
                    </div>
                  </div>
                </div>
                <div className="api-modal-actions">
                  <button
                    className="api-action-btn primary"
                    onClick={() => {
                      setIsRotateOpen(false);
                      setKeyToRotate(null);
                      setRotatedKeyResult(null);
                      setShowRotatedKey(false);
                    }}
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
