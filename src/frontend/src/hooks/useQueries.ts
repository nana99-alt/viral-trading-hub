import { createActor } from "@/backend";
import { type ContentFilter, type ContentId, toBackendFilter } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** Stable query key factory for the content feed. */
export const contentKeys = {
  all: ["content"] as const,
  list: (filter: ContentFilter) => ["content", "list", filter] as const,
  detail: (id: ContentId) => ["content", "detail", id.toString()] as const,
  related: (id: ContentId) => ["content", "related", id.toString()] as const,
  sources: ["content", "sources"] as const,
};

/** List viral content matching the optional filters, ranked by heat. */
export function useViralContent(filter: ContentFilter) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: contentKeys.list(filter),
    queryFn: async () => {
      if (!actor) return [];
      return actor.listViralContent(toBackendFilter(filter));
    },
    enabled: !!actor && !isFetching,
  });
}

/** Fetch a single content item by id. */
export function useContent(id: ContentId | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: contentKeys.detail(id ?? 0n),
    queryFn: async () => {
      if (!actor || id === undefined) return null;
      return actor.getContent(id);
    },
    enabled: !!actor && !isFetching && id !== undefined,
  });
}

/** Fetch content related to the given item by shared topics. */
export function useRelatedContent(id: ContentId | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: contentKeys.related(id ?? 0n),
    queryFn: async () => {
      if (!actor || id === undefined) return [];
      return actor.getRelatedContent(id);
    },
    enabled: !!actor && !isFetching && id !== undefined,
  });
}

/** List the available external content sources. */
export function useSources() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: contentKeys.sources,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listSources();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Pull fresh content from the external sources and persist it. */
export function useRefreshContent() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.refreshContent();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: contentKeys.all });
    },
  });
}
