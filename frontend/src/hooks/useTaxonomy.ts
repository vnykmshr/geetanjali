import { useState, useEffect, useCallback } from "react";
import {
  taxonomyApi,
  type Principle,
  type PrincipleGroup,
  type Goal,
} from "../lib/api";
import { errorMessages } from "../lib/errorMessages";

/**
 * Taxonomy data cache - shared across all hook instances
 * Prevents multiple API calls when used in multiple components
 */
let cachedPrinciples: Principle[] | null = null;
let cachedGroups: PrincipleGroup[] | null = null;
let cachedGoals: Goal[] | null = null;
let loadingPromise: Promise<void> | null = null;

/**
 * Hook for accessing principle and goal taxonomy data.
 *
 * Data is fetched once and cached globally, so multiple components
 * using this hook will share the same data.
 *
 * @example
 * const { principles, groups, goals, loading, getPrincipleLabel } = useTaxonomy();
 */
export function useTaxonomy() {
  const [principles, setPrinciples] = useState<Principle[]>(
    cachedPrinciples ?? [],
  );
  const [groups, setGroups] = useState<PrincipleGroup[]>(cachedGroups ?? []);
  const [goals, setGoals] = useState<Goal[]>(cachedGoals ?? []);
  const [loading, setLoading] = useState(!cachedPrinciples);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If already cached, no need to fetch
    if (cachedPrinciples && cachedGroups && cachedGoals) {
      setPrinciples(cachedPrinciples);
      setGroups(cachedGroups);
      setGoals(cachedGoals);
      setLoading(false);
      return;
    }

    // If fetch is already in progress, wait for it
    if (loadingPromise) {
      loadingPromise
        .then(() => {
          if (cachedPrinciples) setPrinciples(cachedPrinciples);
          if (cachedGroups) setGroups(cachedGroups);
          if (cachedGoals) setGoals(cachedGoals);
        })
        .catch((err) => {
          setError(errorMessages.general(err));
        })
        .finally(() => {
          setLoading(false);
        });
      return;
    }

    // Start fetching
    setLoading(true);
    loadingPromise = (async () => {
      try {
        const [principlesRes, goalsRes] = await Promise.all([
          taxonomyApi.getPrinciples(),
          taxonomyApi.getGoals(),
        ]);

        cachedPrinciples = principlesRes.principles;
        cachedGroups = principlesRes.groups;
        cachedGoals = goalsRes.goals;

        setPrinciples(cachedPrinciples);
        setGroups(cachedGroups);
        setGoals(cachedGoals);
      } catch (err) {
        setError(errorMessages.general(err));
      } finally {
        setLoading(false);
        loadingPromise = null;
      }
    })();
  }, []);

  /**
   * Get principle label by ID
   * Falls back to the ID itself if not found
   */
  const getPrincipleLabel = useCallback(
    (principleId: string): string => {
      const principle = principles.find((p) => p.id === principleId);
      return principle?.label ?? principleId;
    },
    [principles],
  );

  /**
   * Get principle short label by ID (for pills/tags)
   * Falls back to the ID itself if not found
   */
  const getPrincipleShortLabel = useCallback(
    (principleId: string): string => {
      const principle = principles.find((p) => p.id === principleId);
      return principle?.shortLabel ?? principleId;
    },
    [principles],
  );

  /**
   * Get principle description by ID
   */
  const getPrincipleDescription = useCallback(
    (principleId: string): string => {
      const principle = principles.find((p) => p.id === principleId);
      return principle?.description ?? "";
    },
    [principles],
  );

  /**
   * Get full principle object by ID
   */
  const getPrinciple = useCallback(
    (principleId: string): Principle | undefined => {
      return principles.find((p) => p.id === principleId);
    },
    [principles],
  );

  /**
   * Get goal by ID
   */
  const getGoal = useCallback(
    (goalId: string): Goal | undefined => {
      return goals.find((g) => g.id === goalId);
    },
    [goals],
  );

  /**
   * Get group by ID
   */
  const getGroup = useCallback(
    (groupId: string): PrincipleGroup | undefined => {
      return groups.find((g) => g.id === groupId);
    },
    [groups],
  );

  /**
   * Get principles for a specific goal
   */
  const getPrinciplesForGoal = useCallback(
    (goalId: string): Principle[] => {
      const goal = goals.find((g) => g.id === goalId);
      if (!goal || goal.principles.length === 0) {
        return principles; // "exploring" goal returns all
      }
      return principles.filter((p) => goal.principles.includes(p.id));
    },
    [goals, principles],
  );

  /**
   * Get principles for a specific group
   */
  const getPrinciplesForGroup = useCallback(
    (groupId: string): Principle[] => {
      return principles.filter((p) => p.group === groupId);
    },
    [principles],
  );

  return {
    // Data
    principles,
    groups,
    goals,
    loading,
    error,

    // Lookup helpers
    getPrincipleLabel,
    getPrincipleShortLabel,
    getPrincipleDescription,
    getPrinciple,
    getGoal,
    getGroup,
    getPrinciplesForGoal,
    getPrinciplesForGroup,
  };
}

/**
 * Preload taxonomy data (call early in app lifecycle)
 * This allows data to be ready before components mount
 */
export async function preloadTaxonomy(): Promise<void> {
  if (cachedPrinciples && cachedGroups && cachedGoals) {
    return;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    try {
      const [principlesRes, goalsRes] = await Promise.all([
        taxonomyApi.getPrinciples(),
        taxonomyApi.getGoals(),
      ]);

      cachedPrinciples = principlesRes.principles;
      cachedGroups = principlesRes.groups;
      cachedGoals = goalsRes.goals;
    } catch (err) {
      console.error("Failed to preload taxonomy:", err);
    } finally {
      loadingPromise = null;
    }
  })();

  return loadingPromise;
}

export default useTaxonomy;
