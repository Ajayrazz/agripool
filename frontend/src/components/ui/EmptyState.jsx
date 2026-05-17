import React from 'react';

/**
 * EmptyState — full-width empty-state block.
 * @param {string|ReactNode} icon     — emoji or element
 * @param {string}           title
 * @param {string}           message  — optional
 * @param {ReactNode}        action   — optional CTA element
 */
const EmptyState = ({ icon, title, message, action }) => (
  <div className="py-16 flex flex-col items-center gap-3 text-center">
    {/* Icon circle */}
    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-3xl">
      {icon}
    </div>

    <p className="text-lg font-semibold text-gray-700">{title}</p>

    {message && (
      <p className="text-sm text-gray-400 max-w-xs">{message}</p>
    )}

    {action && (
      <div className="mt-2">{action}</div>
    )}
  </div>
);

export default EmptyState;
