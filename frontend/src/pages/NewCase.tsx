import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { casesApi } from '../lib/api';
import type { Case } from '../types';

export default function NewCase() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    role: '',
    stakeholders: '',
    constraints: '',
    horizon: 'medium' as 'short' | 'medium' | 'long',
    sensitivity: 'medium' as 'low' | 'medium' | 'high',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (!formData.role.trim()) {
      newErrors.role = 'Role is required';
    }

    if (!formData.stakeholders.trim()) {
      newErrors.stakeholders = 'At least one stakeholder is required';
    }

    if (!formData.constraints.trim()) {
      newErrors.constraints = 'At least one constraint is required';
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
      // Parse comma-separated values into arrays
      const caseData: Omit<Case, 'id' | 'created_at'> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        role: formData.role.trim(),
        stakeholders: formData.stakeholders.split(',').map(s => s.trim()).filter(Boolean),
        constraints: formData.constraints.split(',').map(c => c.trim()).filter(Boolean),
        horizon: formData.horizon,
        sensitivity: formData.sensitivity,
      };

      const createdCase = await casesApi.create(caseData);

      // Navigate to case view (we'll create this next)
      navigate(`/cases/${createdCase.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to create case');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="text-red-600 hover:text-red-700 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create New Case</h1>
          <p className="text-gray-600 mt-2">
            Describe your ethical leadership dilemma to receive guidance from the Bhagavad Gita.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Proposed restructuring vs phased approach"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe the ethical dilemma in detail (1-4 paragraphs)..."
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            <p className="mt-1 text-sm text-gray-500">
              Minimum 20 characters. Be specific about the situation, constraints, and trade-offs.
            </p>
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              Your Role <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                errors.role ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Senior Manager, HR Director, Team Lead"
            />
            {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
          </div>

          {/* Stakeholders */}
          <div>
            <label htmlFor="stakeholders" className="block text-sm font-medium text-gray-700 mb-2">
              Stakeholders <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="stakeholders"
              name="stakeholders"
              value={formData.stakeholders}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                errors.stakeholders ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., team members, senior leadership, customers"
            />
            {errors.stakeholders && <p className="mt-1 text-sm text-red-600">{errors.stakeholders}</p>}
            <p className="mt-1 text-sm text-gray-500">
              Comma-separated list of affected parties
            </p>
          </div>

          {/* Constraints */}
          <div>
            <label htmlFor="constraints" className="block text-sm font-medium text-gray-700 mb-2">
              Constraints <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="constraints"
              name="constraints"
              value={formData.constraints}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                errors.constraints ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., budget limits, timeline pressure, legal requirements"
            />
            {errors.constraints && <p className="mt-1 text-sm text-red-600">{errors.constraints}</p>}
            <p className="mt-1 text-sm text-gray-500">
              Comma-separated list of limitations or requirements
            </p>
          </div>

          {/* Horizon & Sensitivity Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Horizon */}
            <div>
              <label htmlFor="horizon" className="block text-sm font-medium text-gray-700 mb-2">
                Time Horizon
              </label>
              <select
                id="horizon"
                name="horizon"
                value={formData.horizon}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="short">Short-term (0-6 months)</option>
                <option value="medium">Medium-term (6-18 months)</option>
                <option value="long">Long-term (18+ months)</option>
              </select>
            </div>

            {/* Sensitivity */}
            <div>
              <label htmlFor="sensitivity" className="block text-sm font-medium text-gray-700 mb-2">
                Sensitivity Level
              </label>
              <select
                id="sensitivity"
                name="sensitivity"
                value={formData.sensitivity}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="low">Low - Standard guidance</option>
                <option value="medium">Medium - Careful review</option>
                <option value="high">High - Scholar review required</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                High sensitivity cases require expert review before release
              </p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Link
              to="/"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Case & Analyze'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
