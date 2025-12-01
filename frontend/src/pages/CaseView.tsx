import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { casesApi, outputsApi } from '../lib/api';
import type { Case, Output } from '../types';
import ProvenancePanel from '../components/ProvenancePanel';
import OptionTable from '../components/OptionTable';

export default function CaseView() {
  const { id } = useParams<{ id: string }>();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [output, setOutput] = useState<Output | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadCase = async () => {
      try {
        const data = await casesApi.get(id);
        setCaseData(data);

        // Try to load existing analysis
        try {
          const outputs = await outputsApi.listByCaseId(id);
          if (outputs && outputs.length > 0) {
            setOutput(outputs[0]); // Use most recent output
          }
        } catch (outputErr) {
          // No outputs yet - this is fine
          console.log('No existing analysis found');
        }
      } catch (err: any) {
        setError(err.response?.data?.detail || err.message || 'Failed to load case');
      } finally {
        setLoading(false);
      }
    };

    loadCase();
  }, [id]);

  const handleAnalyze = async () => {
    if (!id) return;

    setAnalyzing(true);
    setError(null);

    try {
      // The analyze endpoint returns the Output object directly
      const outputData = await casesApi.analyze(id);
      setOutput(outputData);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-gray-600">Loading consultation...</div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Consultation not found</p>
          <Link to="/" className="text-red-600 hover:text-red-700">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <Link to="/" className="text-red-600 hover:text-red-700">
              ← Back to Home
            </Link>
            <Link to="/consultations" className="text-red-600 hover:text-red-700">
              View All Consultations →
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{caseData.title}</h1>
          {caseData.created_at && (
            <p className="text-gray-500 text-sm mt-2">
              {new Date(caseData.created_at).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Your Question</h2>
              <p className="text-gray-700 whitespace-pre-wrap text-lg leading-relaxed">{caseData.description}</p>

              {(caseData.stakeholders.length > 1 || caseData.stakeholders[0] !== 'self' ||
                caseData.constraints.length > 0 || caseData.role !== 'Individual') && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-medium text-gray-700 text-sm mb-3">Context</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {caseData.role !== 'Individual' && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Role:</span>
                        <span>{caseData.role}</span>
                      </div>
                    )}
                    {(caseData.stakeholders.length > 1 || caseData.stakeholders[0] !== 'self') && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Affects:</span>
                        <span>{caseData.stakeholders.join(', ')}</span>
                      </div>
                    )}
                    {caseData.constraints.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Constraints:</span>
                        <span>{caseData.constraints.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Analysis Section */}
            {!output && (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-600 mb-4">
                  Analyzing your question...
                </p>
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {analyzing ? 'Seeking guidance...' : 'Refresh Guidance'}
                </button>
              </div>
            )}

            {output && (
              <>
                {/* Scholar Flag Warning */}
                {output.scholar_flag && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-yellow-800 font-medium">⚠️ Scholar Review Required</span>
                    </div>
                    <p className="text-yellow-700 text-sm mt-1">
                      This case requires expert review before finalization due to high sensitivity or low confidence.
                    </p>
                  </div>
                )}

                {/* Guidance Summary */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Guidance</h2>
                  <p className="text-gray-700 text-lg leading-relaxed">{output.result_json.executive_summary}</p>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-gray-600">Confidence:</span>
                    <div className="ml-2 flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                      <div
                        className={`h-2 rounded-full ${
                          output.confidence >= 0.8
                            ? 'bg-green-500'
                            : output.confidence >= 0.6
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${output.confidence * 100}%` }}
                      />
                    </div>
                    <span className="ml-2 text-gray-900 font-medium">
                      {(output.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Options */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Paths Forward</h2>
                  <OptionTable options={output.result_json.options} />
                </div>

                {/* Recommended Action */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Recommended Path</h2>
                  {typeof output.result_json.recommended_action === 'string' ? (
                    <p className="text-gray-700 whitespace-pre-wrap text-lg leading-relaxed">
                      {output.result_json.recommended_action}
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {output.result_json.recommended_action.option && (
                        <p className="text-gray-700">
                          <span className="font-medium">Recommended:</span> Option {output.result_json.recommended_action.option}
                        </p>
                      )}
                      {output.result_json.recommended_action.steps && output.result_json.recommended_action.steps.length > 0 && (
                        <div>
                          <h3 className="font-medium text-gray-900 mb-2">Steps:</h3>
                          <ol className="list-decimal list-inside space-y-1 text-gray-700">
                            {output.result_json.recommended_action.steps.map((step, i) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Reflection Prompts */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Questions to Reflect On</h2>
                  <ul className="space-y-3">
                    {output.result_json.reflection_prompts.map((prompt, i) => (
                      <li key={i} className="text-gray-700 text-base">
                        <span className="font-medium text-red-600 mr-2">•</span> {prompt}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>

          {/* Sidebar - Provenance */}
          <div className="lg:col-span-1">
            {output && (
              <ProvenancePanel
                sources={output.result_json.sources}
                confidence={output.confidence}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
