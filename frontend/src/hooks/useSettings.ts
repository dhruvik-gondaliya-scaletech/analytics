import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../services/settings.service';
import type { CreateKeyPayload, CreateUserPayload } from '../services/settings.service';
import type { IngestionApiKey, User } from '../types';

export const SETTINGS_KEYS_QUERY_KEY = ['settings', 'keys'] as const;
export const SETTINGS_USERS_QUERY_KEY = ['settings', 'users'] as const;

export function useSettings(isAdmin: boolean = false) {
  const queryClient = useQueryClient();

  const keysQuery = useQuery<IngestionApiKey[]>({
    queryKey: SETTINGS_KEYS_QUERY_KEY,
    queryFn: () => settingsService.getIngestionKeys(),
  });

  const usersQuery = useQuery<User[]>({
    queryKey: SETTINGS_USERS_QUERY_KEY,
    queryFn: () => settingsService.getUsers(),
    enabled: isAdmin,
  });

  const createKeyMutation = useMutation({
    mutationFn: (payload: CreateKeyPayload) => settingsService.createIngestionKey(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS_QUERY_KEY });
    },
  });

  const revokeKeyMutation = useMutation({
    mutationFn: (id: string) => settingsService.revokeIngestionKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS_QUERY_KEY });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: (payload: CreateUserPayload) => settingsService.createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_USERS_QUERY_KEY });
    },
  });

  const purgeUserDataMutation = useMutation({
    mutationFn: (userId: string) => settingsService.purgeUserData(userId),
  });

  return {
    keys: keysQuery.data || [],
    users: usersQuery.data || [],
    loading: keysQuery.isLoading || (isAdmin && usersQuery.isLoading),
    error: (keysQuery.error || usersQuery.error) ? ((keysQuery.error || usersQuery.error) as Error).message : null,
    refreshAll: () => {
      keysQuery.refetch();
      if (isAdmin) usersQuery.refetch();
    },
    createKey: createKeyMutation.mutateAsync,
    revokeKey: revokeKeyMutation.mutateAsync,
    createUser: createUserMutation.mutateAsync,
    purgeUserData: purgeUserDataMutation.mutateAsync,
    isCreatingKey: createKeyMutation.isPending,
    isRevokingKey: revokeKeyMutation.isPending,
    isCreatingUser: createUserMutation.isPending,
    isPurgingData: purgeUserDataMutation.isPending,
  };
}
