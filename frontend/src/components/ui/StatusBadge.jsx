import React from 'react';

/**
 * StatusBadge — pill badge for any booking/request status.
 * Preserved: STATUS_CONFIG keys, fallback, size prop.
 * Changed: colours updated to match new design system.
 */

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    bg: 'bg-amber-100',  text: 'text-amber-700',  dot: 'bg-amber-400'  },
  confirmed:  { label: 'Confirmed',  bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500'  },
  in_transit: { label: 'In Transit', bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500'   },
  delivered:  { label: 'Delivered',  bg: 'bg-teal-100',   text: 'text-teal-700',   dot: 'bg-teal-500'   },
  completed:  { label: 'Completed',  bg: 'bg-gray-100',   text: 'text-gray-600',   dot: 'bg-gray-400'   },
  cancelled:  { label: 'Cancelled',  bg: 'bg-red-100',    text: 'text-red-600',    dot: 'bg-red-500'    },
  open:       { label: 'Open',       bg: 'bg-sky-100',    text: 'text-sky-700',    dot: 'bg-sky-400'    },
  booked:     { label: 'Booked',     bg: 'bg-violet-100', text: 'text-violet-700', dot: 'bg-violet-500' },
  matched:    { label: 'Matched',    bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-400' },
};

/**
 * @param {string} status
 * @param {'sm'|'md'} size
 */
const StatusBadge = ({ status, size = 'md' }) => {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status ?? 'Unknown',
    bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400',
  };

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${cfg.bg} ${cfg.text} ${padding}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

export default StatusBadge;
