import React from 'react';

const TIMELINE_META = {
  pending:    { icon: '🕐', color: 'border-yellow-400',  bg: 'bg-yellow-50',  text: 'text-yellow-700',  label: 'Pending'    },
  confirmed:  { icon: '✅', color: 'border-green-500',   bg: 'bg-green-50',   text: 'text-green-700',   label: 'Confirmed'  },
  in_transit: { icon: '🚛', color: 'border-blue-500',    bg: 'bg-blue-50',    text: 'text-blue-700',    label: 'In Transit' },
  delivered:  { icon: '📦', color: 'border-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Delivered'  },
  completed:  { icon: '🎉', color: 'border-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Completed'  },
  cancelled:  { icon: '❌', color: 'border-red-500',     bg: 'bg-red-50',     text: 'text-red-700',     label: 'Cancelled'  },
};

const getMeta = (status) =>
  TIMELINE_META[status] ?? { icon: '❓', color: 'border-gray-400', bg: 'bg-gray-50', text: 'text-gray-600', label: status };

/**
 * BookingTimeline — takes an array of tracking_update objects and renders a
 * vertical timeline with per-status icons, colours, notes, and timestamps.
 *
 * @param {Array} updates  — array of tracking_update objects
 */
const BookingTimeline = ({ updates = [] }) => {
  if (updates.length === 0) {
    return (
      <div className="flex flex-col items-center py-10 text-gray-400 gap-2">
        <span className="text-4xl">📭</span>
        <p className="text-sm font-medium">No tracking updates yet.</p>
        <p className="text-xs">Updates will appear here as your shipment progresses.</p>
      </div>
    );
  }

  return (
    <ol className="relative">
      {/* Vertical connector line */}
      <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-200" />

      {updates.map((update, index) => {
        const meta = getMeta(update.status);
        const isLast = index === updates.length - 1;

        return (
          <li
            key={update.id ?? index}
            className={`relative flex gap-4 ${isLast ? '' : 'pb-8'}`}
          >
            {/* Icon dot */}
            <div
              className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${meta.color} ${meta.bg} text-base shadow-sm`}
            >
              {meta.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-1">
              <p className={`font-semibold text-sm ${meta.text}`}>
                {meta.label}
              </p>
              {update.notes && (
                <p className="mt-0.5 text-sm text-gray-600">{update.notes}</p>
              )}
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                {update.recorded_at && (
                  <span>
                    🕐 {new Date(update.recorded_at).toLocaleString('en-IN', {
                      dateStyle: 'medium', timeStyle: 'short',
                    })}
                  </span>
                )}
                {update.current_lat && update.current_lng && (
                  <span>
                    📍 {Number(update.current_lat).toFixed(4)}, {Number(update.current_lng).toFixed(4)}
                  </span>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default BookingTimeline;
