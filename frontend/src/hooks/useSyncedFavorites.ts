/**
 * Hook for synced favorites across devices.
 *
 * For anonymous users: Uses localStorage only (via useFavorites).
 * For authenticated users: Syncs with server on login and on changes.
 *
 * Features:
 * - Merge on login (union of local + server favorites)
 * - Debounced sync on add/remove (1 second)
 * - Optimistic updates (UI updates immediately, sync in background)
 * - Graceful error handling (continues working if sync fails)
 */

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useFavorites } from "./useFavorites";
import { useAuth } from "../contexts/AuthContext";
import { preferencesApi } from "../lib/api";

export type SyncStatus = "idle" | "syncing" | "synced" | "error";

interface UseSyncedFavoritesReturn {
  /** Set of favorited verse IDs */
  favorites: Set<string>;
  /** Check if a verse is favorited */
  isFavorite: (verseId: string) => boolean;
  /** Toggle favorite status */
  toggleFavorite: (verseId: string) => boolean;
  /** Add a favorite */
  addFavorite: (verseId: string) => boolean;
  /** Remove a favorite */
  removeFavorite: (verseId: string) => void;
  /** Number of favorites */
  favoritesCount: number;
  /** Current sync status */
  syncStatus: SyncStatus;
  /** Last sync timestamp */
  lastSynced: Date | null;
  /** Manually trigger sync (for debugging) */
  resync: () => Promise<void>;
  /** Whether first sync after login completed (for toast) */
  didInitialSync: boolean;
}

// Debounce delay for syncing changes to server
const SYNC_DEBOUNCE_MS = 1000;

/**
 * Hook for managing favorites with cross-device sync.
 *
 * @example
 * ```tsx
 * const { favorites, isFavorite, toggleFavorite, syncStatus } = useSyncedFavorites();
 *
 * // Check if verse is favorited
 * const isLiked = isFavorite('BG_2_47');
 *
 * // Toggle favorite (syncs automatically if authenticated)
 * const handleClick = () => toggleFavorite('BG_2_47');
 * ```
 */
export function useSyncedFavorites(): UseSyncedFavoritesReturn {
  const { isAuthenticated, user } = useAuth();
  const localFavorites = useFavorites();

  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [didInitialSync, setDidInitialSync] = useState(false);

  // Track user ID to detect login/logout
  const previousUserIdRef = useRef<string | null>(null);
  // Debounce timer ref
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track if we're currently syncing to prevent duplicate calls
  const isSyncingRef = useRef(false);

  /**
   * Merge local favorites with server (used on login)
   */
  const mergeWithServer = useCallback(async () => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    setSyncStatus("syncing");

    try {
      // Get current local favorites
      const localItems = Array.from(localFavorites.favorites);

      // Merge with server (backend field is called "bookmarks")
      const merged = await preferencesApi.merge({
        bookmarks: { items: localItems },
      });

      // Update local storage with merged result
      // Clear and re-add to ensure we have the server's merged set
      localFavorites.clearFavorites();
      for (const item of merged.bookmarks.items) {
        localFavorites.addFavorite(item);
      }

      setSyncStatus("synced");
      setLastSynced(new Date());
      setDidInitialSync(true);

      console.debug(
        `[SyncedFavorites] Merged: ${localItems.length} local + server = ${merged.bookmarks.items.length} total`,
      );
    } catch (error) {
      console.error("[SyncedFavorites] Merge failed:", error);
      setSyncStatus("error");
    } finally {
      isSyncingRef.current = false;
    }
  }, [localFavorites]);

  /**
   * Sync current favorites to server (debounced)
   */
  const syncToServer = useCallback(
    async (items: string[]) => {
      if (!isAuthenticated || isSyncingRef.current) return;

      // Clear existing timeout
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      // Debounce the sync
      syncTimeoutRef.current = setTimeout(async () => {
        isSyncingRef.current = true;
        setSyncStatus("syncing");

        try {
          await preferencesApi.update({
            bookmarks: { items },
          });
          setSyncStatus("synced");
          setLastSynced(new Date());
        } catch (error) {
          console.error("[SyncedFavorites] Sync failed:", error);
          setSyncStatus("error");
        } finally {
          isSyncingRef.current = false;
        }
      }, SYNC_DEBOUNCE_MS);
    },
    [isAuthenticated],
  );

  /**
   * Handle login: merge local favorites with server
   */
  useEffect(() => {
    const currentUserId = user?.id ?? null;
    const wasLoggedOut = previousUserIdRef.current === null;
    const isNowLoggedIn = currentUserId !== null;

    // Detect login (was null, now has user ID)
    if (wasLoggedOut && isNowLoggedIn) {
      console.debug("[SyncedFavorites] Login detected, merging with server");
      mergeWithServer();
    }

    // Detect logout (had user ID, now null)
    if (previousUserIdRef.current !== null && currentUserId === null) {
      console.debug("[SyncedFavorites] Logout detected, resetting sync status");
      setSyncStatus("idle");
      setLastSynced(null);
      setDidInitialSync(false);
    }

    previousUserIdRef.current = currentUserId;
  }, [user?.id, mergeWithServer]);

  /**
   * Add a favorite (syncs to server if authenticated)
   */
  const addFavorite = useCallback(
    (verseId: string): boolean => {
      const success = localFavorites.addFavorite(verseId);

      if (success && isAuthenticated) {
        // Get updated list and sync
        const updatedItems = [...Array.from(localFavorites.favorites), verseId];
        syncToServer(updatedItems);
      }

      return success;
    },
    [localFavorites, isAuthenticated, syncToServer],
  );

  /**
   * Remove a favorite (syncs to server if authenticated)
   */
  const removeFavorite = useCallback(
    (verseId: string): void => {
      localFavorites.removeFavorite(verseId);

      if (isAuthenticated) {
        // Get updated list and sync
        const updatedItems = Array.from(localFavorites.favorites).filter(
          (id) => id !== verseId,
        );
        syncToServer(updatedItems);
      }
    },
    [localFavorites, isAuthenticated, syncToServer],
  );

  /**
   * Toggle favorite status
   */
  const toggleFavorite = useCallback(
    (verseId: string): boolean => {
      if (localFavorites.isFavorite(verseId)) {
        removeFavorite(verseId);
        return false;
      } else {
        return addFavorite(verseId);
      }
    },
    [localFavorites, addFavorite, removeFavorite],
  );

  /**
   * Manual resync (for debugging or retry)
   */
  const resync = useCallback(async () => {
    if (isAuthenticated) {
      await mergeWithServer();
    }
  }, [isAuthenticated, mergeWithServer]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  // Memoize return value to prevent unnecessary re-renders
  return useMemo(
    () => ({
      favorites: localFavorites.favorites,
      isFavorite: localFavorites.isFavorite,
      toggleFavorite,
      addFavorite,
      removeFavorite,
      favoritesCount: localFavorites.favoritesCount,
      syncStatus,
      lastSynced,
      resync,
      didInitialSync,
    }),
    [
      localFavorites.favorites,
      localFavorites.isFavorite,
      localFavorites.favoritesCount,
      toggleFavorite,
      addFavorite,
      removeFavorite,
      syncStatus,
      lastSynced,
      resync,
      didInitialSync,
    ],
  );
}
