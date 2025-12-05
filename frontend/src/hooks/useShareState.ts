import { useState, useEffect, useCallback } from 'react';
import { casesApi } from '../lib/api';
import type { Case } from '../types';

/**
 * Manages case sharing UI and toggle logic
 * Extracts share concerns from CaseView component
 */
export function useShareState(caseData: Case | null, caseId: string | undefined) {
  const [shareLoading, setShareLoading] = useState(false);
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [caseDataLocal, setCaseDataLocal] = useState(caseData);

  useEffect(() => {
    setCaseDataLocal(caseData);
  }, [caseData]);

  // Close share dropdown on escape key
  useEffect(() => {
    if (!showShareDropdown) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowShareDropdown(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showShareDropdown]);

  const handleToggleShare = useCallback(async () => {
    if (!caseDataLocal || !caseId) return;

    setShareLoading(true);
    try {
      const newIsPublic = !caseDataLocal.is_public;
      const updated = await casesApi.toggleShare(caseId, newIsPublic);
      setCaseDataLocal(updated);

      if (newIsPublic) {
        setCopySuccess(false);
      } else {
        setShowShareDropdown(false);
      }
    } catch {
      // Error handling in parent component
    } finally {
      setShareLoading(false);
    }
  }, [caseDataLocal, caseId]);

  const copyShareLink = useCallback(() => {
    if (!caseDataLocal?.public_slug) return;
    const url = `${window.location.origin}/c/${caseDataLocal.public_slug}`;
    navigator.clipboard.writeText(url);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  }, [caseDataLocal]);

  return {
    shareLoading,
    showShareDropdown,
    copySuccess,
    caseDataLocal,
    setShowShareDropdown,
    handleToggleShare,
    copyShareLink,
  };
}

export default useShareState;
