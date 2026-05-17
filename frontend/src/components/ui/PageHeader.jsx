import React from 'react';

/**
 * PageHeader — consistent page-level heading.
 * @param {string}      title
 * @param {string}      subtitle   — optional
 * @param {ReactNode}   action     — optional button / element placed on the right
 */
const PageHeader = ({ title, subtitle, action }) => (
  <div className="mb-8 flex items-start justify-between gap-4">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      {subtitle && (
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
    {action && (
      <div className="shrink-0">{action}</div>
    )}
  </div>
);

export default PageHeader;
