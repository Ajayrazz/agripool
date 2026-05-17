import React from 'react';
import { colorVariants } from '../../styles/theme';

/**
 * StatCard — reusable metric card.
 * @param {string|ReactNode} icon   — emoji or element
 * @param {string}           label  — metric label
 * @param {string|number}    value  — metric value
 * @param {'green'|'blue'|'amber'|'purple'} color — icon bg tint
 * @param {boolean}          loading — show skeleton when true
 */
const StatCard = ({ icon, label, value, color = 'green', loading = false }) => {
  const variant = colorVariants[color] ?? colorVariants.green;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4">
      {/* Icon square */}
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${variant.bg} ring-1 ${variant.ring}`}
      >
        {icon}
      </div>

      {/* Text */}
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        {loading ? (
          <div className="h-8 w-16 mt-1 bg-gray-100 animate-pulse rounded-lg" />
        ) : (
          <p className="text-3xl font-bold text-gray-900 leading-none mt-0.5">{value}</p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
