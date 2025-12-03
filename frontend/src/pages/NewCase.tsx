import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { casesApi } from '../lib/api';
import type { Case } from '../types';
import { Navbar } from '../components/Navbar';
import { errorMessages } from '../lib/errorMessages';

export default function NewCase() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [formData, setFormData] = useState({
    question: '',
    context: '',
    // Optional advanced fields with sensible defaults
    role: 'individual' as string,
    horizon: 'medium' as 'short' | 'medium' | 'long',
  });

  // Stakeholder checkboxes state
  const [selectedStakeholders, setSelectedStakeholders] = useState<Set<string>>(new Set(['self']));

  const ROLE_OPTIONS = [
    { value: 'individual', label: 'Individual' },
    { value: 'parent', label: 'Parent' },
    { value: 'manager', label: 'Manager / Leader' },
    { value: 'employee', label: 'Employee' },
    { value: 'student', label: 'Student' },
    { value: 'entrepreneur', label: 'Entrepreneur' },
  ];

  const STAKEHOLDER_OPTIONS = [
    { value: 'self', label: 'Self' },
    { value: 'family', label: 'Family' },
    { value: 'team', label: 'Team' },
    { value: 'organization', label: 'Organization' },
    { value: 'community', label: 'Community' },
  ];

  const toggleStakeholder = (value: string) => {
    setSelectedStakeholders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      return newSet;
    });
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.question.trim()) {
      newErrors.question = 'Please describe your situation';
    } else if (formData.question.length < 10) {
      newErrors.question = 'Please provide more detail (at least 10 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build description from question and context
      let description = formData.question.trim();
      if (formData.context.trim()) {
        description += '\n\n' + formData.context.trim();
      }

      // Generate simple title from question (first sentence or 100 chars)
      // LLM will generate a better title and update it after analysis
      const generateSimpleTitle = (text: string): string => {
        const firstSentence = text.split(/[.!?]/)[0].trim();
        if (firstSentence.length > 0 && firstSentence.length <= 100) {
          return firstSentence;
        }
        return text.slice(0, 100).trim();
      };

      // Create case with smart defaults
      const roleLabel = ROLE_OPTIONS.find(r => r.value === formData.role)?.label || 'Individual';
      const caseData: Omit<Case, 'id' | 'created_at'> = {
        title: generateSimpleTitle(formData.question), // Auto-generate, LLM will improve
        description: description,
        role: roleLabel,
        stakeholders: Array.from(selectedStakeholders),
        constraints: [], // Removed - users can mention in context
        horizon: formData.horizon,
      };

      const createdCase = await casesApi.create(caseData);

      // Trigger async analysis (returns immediately)
      try {
        await casesApi.analyzeAsync(createdCase.id);
      } catch {
        // Silent fail - user can manually analyze later
      }

      // Navigate to case view with waiting state
      navigate(`/cases/${createdCase.id}`);
    } catch (err) {
      setError(errorMessages.caseCreate(err));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex flex-col">
      <Navbar />
      <div className="flex-1 py-8">
        <div className="max-w-3xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Seek Guidance
            </h1>
            <p className="text-lg text-gray-600">
              Describe your situation and receive wisdom from the Bhagavad Geeta
            </p>
          </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Main Question */}
          <div>
            <label htmlFor="question" className="block text-lg font-medium text-gray-900 mb-3">
              What situation are you facing?
            </label>
            <textarea
              id="question"
              name="question"
              value={formData.question}
              onChange={handleChange}
              rows={4}
              className={`w-full px-4 py-3 text-lg border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                errors.question ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., I'm torn between pursuing a promotion that requires relocating, or staying in my current role to care for aging parents..."
              autoFocus
            />
            {errors.question && <p className="mt-2 text-sm text-red-600">{errors.question}</p>}
          </div>

          {/* Optional Context - Compact inline */}
          <div>
            <textarea
              id="context"
              name="context"
              value={formData.context}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50"
              placeholder="Any additional context? (optional) — background, constraints, considerations..."
            />
          </div>

          {/* Advanced Options Toggle */}
          <div className="border-t pt-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center"
            >
              {showAdvanced ? '− Hide' : '+ Show'} advanced options
            </button>
          </div>

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="space-y-4 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Role */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Your role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    {ROLE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Time Horizon */}
                <div>
                  <label htmlFor="horizon" className="block text-sm font-medium text-gray-700 mb-1">
                    Time frame
                  </label>
                  <select
                    id="horizon"
                    name="horizon"
                    value={formData.horizon}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="short">Short term</option>
                    <option value="medium">Medium term</option>
                    <option value="long">Long term</option>
                  </select>
                </div>
              </div>

              {/* Stakeholders - Checkboxes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Who's affected?
                </label>
                <div className="flex flex-wrap gap-2">
                  {STAKEHOLDER_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleStakeholder(opt.value)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                        selectedStakeholders.has(opt.value)
                          ? 'bg-red-100 border-red-300 text-red-700'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {selectedStakeholders.has(opt.value) && <span className="mr-1">✓</span>}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-2">
            <Link
              to="/"
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              {loading ? 'Seeking guidance...' : 'Get Guidance'}
            </button>
          </div>
        </form>

          {/* Helper Text */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Your question will be analyzed using wisdom from the Bhagavad Geeta to provide thoughtful guidance.
          </p>
        </div>
      </div>
    </div>
  );
}
