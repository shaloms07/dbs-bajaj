import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiKeyItem, CreateApiKeyResponse, createApiKey, deleteApiKey, fetchApiKeys, renameApiKey } from '../services/apiKeyService';

const apiKeysQueryKey = ['api-keys'] as const;

export function useApiKeys() {
  return useQuery<ApiKeyItem[], Error>({
    queryKey: apiKeysQueryKey,
    queryFn: fetchApiKeys,
    staleTime: 60 * 1000
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();

  return useMutation<CreateApiKeyResponse, Error, string>({
    mutationFn: createApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeysQueryKey });
    }
  });
}

export function useRenameApiKey() {
  const queryClient = useQueryClient();

  return useMutation<ApiKeyItem, Error, { keyId: string; name: string }>({
    mutationFn: ({ keyId, name }) => renameApiKey(keyId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeysQueryKey });
    }
  });
}

export function useDeleteApiKey() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeysQueryKey });
    }
  });
}
