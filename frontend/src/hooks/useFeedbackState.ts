import { useState, useCallback } from 'react';
import { outputsApi } from '../lib/api';

/**
 * Manages feedback UI and submission logic
 * Extracts feedback concerns from CaseView component
 */
export function useFeedbackState() {
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'up' | 'down' | null>>({});
  const [feedbackLoading, setFeedbackLoading] = useState<string | null>(null);
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState<Record<string, string>>({});

  const handleFeedback = useCallback(
    async (outputId: string, type: 'up' | 'down') => {
      if (feedbackLoading === outputId) return;

      const current = feedbackGiven[outputId];

      if (type === 'down' && current !== 'down') {
        setExpandedFeedback(outputId);
        return;
      }

      if (current === type) {
        setFeedbackGiven(prev => ({ ...prev, [outputId]: null }));
        setExpandedFeedback(null);
        return;
      }

      setFeedbackLoading(outputId);
      try {
        await outputsApi.submitFeedback(outputId, { rating: true });
        setFeedbackGiven(prev => ({ ...prev, [outputId]: 'up' }));
        setExpandedFeedback(null);
      } catch {
        setFeedbackGiven(prev => ({ ...prev, [outputId]: 'up' }));
      } finally {
        setFeedbackLoading(null);
      }
    },
    [feedbackLoading, feedbackGiven]
  );

  const handleSubmitNegativeFeedback = useCallback(
    async (outputId: string) => {
      if (feedbackLoading === outputId) return;

      setFeedbackLoading(outputId);
      try {
        const comment = feedbackText[outputId]?.trim() || undefined;
        await outputsApi.submitFeedback(outputId, { rating: false, comment });
        setFeedbackGiven(prev => ({ ...prev, [outputId]: 'down' }));
        setExpandedFeedback(null);
      } catch {
        setFeedbackGiven(prev => ({ ...prev, [outputId]: 'down' }));
      } finally {
        setFeedbackLoading(null);
      }
    },
    [feedbackLoading, feedbackText]
  );

  const handleCancelFeedback = useCallback((outputId: string) => {
    setExpandedFeedback(null);
    setFeedbackText(prev => ({ ...prev, [outputId]: '' }));
  }, []);

  const handleFeedbackTextChange = useCallback((outputId: string, text: string) => {
    setFeedbackText(prev => ({ ...prev, [outputId]: text }));
  }, []);

  return {
    feedbackGiven,
    feedbackLoading,
    expandedFeedback,
    feedbackText,
    handleFeedback,
    handleSubmitNegativeFeedback,
    handleCancelFeedback,
    handleFeedbackTextChange,
  };
}

export default useFeedbackState;
