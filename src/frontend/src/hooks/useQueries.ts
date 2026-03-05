import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TruckStop } from "../backend.d";
import { useActor } from "./useActor";

export function useGetAllTruckStops() {
  const { actor, isFetching } = useActor();
  return useQuery<TruckStop[]>({
    queryKey: ["truckStops"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTruckStops();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000, // refresh every 30 seconds
  });
}

export function useSearchTruckStops(searchText: string) {
  const { actor, isFetching } = useActor();
  return useQuery<TruckStop[]>({
    queryKey: ["truckStops", "search", searchText],
    queryFn: async () => {
      if (!actor) return [];
      if (!searchText.trim()) return actor.getAllTruckStops();
      return actor.searchTruckStops(searchText);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSeedSampleData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.seedSampleData();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["truckStops"] });
    },
  });
}

export function useUpdateShowerAvailability() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      availableShowers,
    }: { id: bigint; availableShowers: bigint }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateShowerAvailability(id, availableShowers);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["truckStops"] });
    },
  });
}

export function useAddOrUpdateTruckStop() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      chain,
      city,
      state,
      highway,
      totalShowers,
    }: {
      id: bigint | null;
      name: string;
      chain: string;
      city: string;
      state: string;
      highway: string;
      totalShowers: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addOrUpdateTruckStop(
        id,
        name,
        chain,
        city,
        state,
        highway,
        totalShowers,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["truckStops"] });
    },
  });
}

export function useRemoveTruckStop() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.removeTruckStop(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["truckStops"] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}
