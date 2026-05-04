import React from 'react';

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    bg: 'bg-yellow-100',  text: 'text-yellow-800', dot: 'bg-yellow-400' },
  confirmed:  { label: 'Confirmed',  bg: 'bg-green-100',   text: 'text-green-800',  dot: 'bg-green-500'  },
  in_transit: { label: 'In Transit', bg: 'bg-blue-100',    text: 'text-blue-800',   dot: 'bg-blue-500'   },
  delivered:  { label: 'Delivered',  bg: 'bg-emerald-100', text: 'text-emerald-800',dot: 'bg-emerald-500'},
  completed:  { label: 'Completed',  bg: 'bg-emerald-100', text: 'text-emerald-800',dot: 'bg-emerald-600'},
  cancelled:  { label: 'Cancelled',  bg: 'bg-red-100',     text: 'text-red-800',    dot: 'bg-red-500'    },
  open:       { label: 'Open',       bg: 'bg-sky-100',     text: 'text-sky-800',    dot: 'bg-sky-400'    },
  booked:     { label: 'Booked',     bg: 'bg-violet-100',  text: 'text-violet-800', dot: 'bg-violet-500' },
  matched:    { label: 'Matched',    bg: 'bg-orange-100',  text: 'text-orange-800', dot: 'bg-orange-400' },
};

/**
 * StatusBadge — renders a coloured pill badge for any booking/request status.
 * @param {string} status
 * @param {'sm'|'md'} size
 */
const StatusBadge = ({ status, size = 'md' }) => {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status ?? 'Unknown',
    bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400',
  };

  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wide ${cfg.bg} ${cfg.text} ${padding}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

export default StatusBadge;
