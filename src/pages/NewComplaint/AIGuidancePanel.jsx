import React from 'react';
import { Sparkles, MapPin } from 'lucide-react';

/**
 * AIGuidancePanel — lightweight assistant hints shown while the user types.
 * Never fabricates information. Only recommends what to include.
 */
export function AIGuidancePanel({ missingFields = [], onAddLocation }) {
  const tips = [
    { icon: '✓', text: 'What happened?' },
    { icon: '✓', text: 'Where did it happen? (locality, ward, landmark)' },
    { icon: '✓', text: 'Since when has this been happening?' },
    { icon: '✓', text: 'How serious is the issue?' },
  ];

  const hasLocation = !missingFields.includes('location');

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles size={15} className="text-blue-500 shrink-0" />
        <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">AI Complaint Assistant</span>
      </div>

      {missingFields.length === 0 ? (
        <p className="text-sm text-blue-700">
          Your complaint looks good! Press <strong>Analyse Complaint</strong> to continue.
        </p>
      ) : (
        <>
          <p className="text-sm text-slate-600">For a better complaint, try to mention:</p>
          <ul className="space-y-1">
            {tips.map((tip, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                <span className="text-emerald-500 font-bold">{tip.icon}</span>
                {tip.text}
              </li>
            ))}
          </ul>

          {/* Contextual suggestions */}
          {!hasLocation && (
            <div className="mt-3 bg-white border border-amber-200 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
                <MapPin size={13} /> Location is missing
              </p>
              <p className="text-xs text-slate-600">
                Adding a locality or ward number helps us route your complaint to the right department.
              </p>
              <button
                onClick={onAddLocation}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
              >
                Add Location →
              </button>
            </div>
          )}
        </>
      )}

      <p className="text-xs text-slate-400 italic">
        Example: "Garbage has not been collected near Arera Colony, Ward 42, for the last 3 days."
      </p>
    </div>
  );
}
