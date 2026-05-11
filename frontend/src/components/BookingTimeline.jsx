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
 * Shows all steps in the normal progression. Unreached steps are greyed out.
 *
 * @param {Array} updates  — array of tracking_update objects
 */
const BookingTimeline = ({ updates = [] }) => {
  const isCancelled = updates.some(u => u.status === 'cancelled');
  const baseProgression = ['pending', 'confirmed', 'in_transit', 'delivered', 'completed'];

  let timelineItems = [];

  if (isCancelled) {
    // If cancelled, just show the literal history of what happened.
    timelineItems = updates.map(u => ({ ...u, isReached: true }));
  } else {
    // Show full 5-step progression
    timelineItems = baseProgression.map(status => {
      const update = updates.find(u => u.status === status);
      return {
        id: update?.id || status,
        status: status,
        notes: update?.notes,
        recorded_at: update?.recorded_at,
        current_lat: update?.current_lat,
        current_lng: update?.current_lng,
        isReached: !!update
      };
    });
  }

  if (timelineItems.length === 0) {
    return (
      <div className="flex flex-col items-center py-10 text-gray-400 gap-2">
        <span className="text-4xl">📭</span>
        <p className="text-sm font-medium">No tracking updates yet.</p>
      </div>
    );
  }

  return (
    <ol className="relative">
      {/* Vertical connector line */}
      <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-200" />

      {timelineItems.map((item, index) => {
        const meta = getMeta(item.status);
        const isLast = index === timelineItems.length - 1;

        // Apply muted styles if the step hasn't been reached
        const colorClass = item.isReached ? meta.color : 'border-gray-300';
        const bgClass    = item.isReached ? meta.bg : 'bg-gray-100';
        const textClass  = item.isReached ? meta.text : 'text-gray-400';
        const iconStyle  = item.isReached ? '' : 'grayscale opacity-50';

        return (
          <li
            key={item.id}
            className={`relative flex gap-4 ${isLast ? '' : 'pb-8'}`}
          >
            {/* Icon dot */}
            <div
              className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${colorClass} ${bgClass} text-base shadow-sm ${iconStyle}`}
            >
              {meta.icon}
            </div>

            {/* Content */}
            <div className={`flex-1 min-w-0 pt-2 ${item.isReached ? '' : 'opacity-60'}`}>
              <p className={`font-semibold text-sm ${textClass}`}>
                {meta.label}
              </p>
              {item.notes && (
                <p className="mt-0.5 text-sm text-gray-600">{item.notes}</p>
              )}
              {item.isReached && item.recorded_at && (
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                  <span>
                    🕐 {new Date(item.recorded_at).toLocaleString('en-IN', {
                      dateStyle: 'medium', timeStyle: 'short',
                    })}
                  </span>
                  {item.current_lat && item.current_lng && (
                    <span>
                      📍 {Number(item.current_lat).toFixed(4)}, {Number(item.current_lng).toFixed(4)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default BookingTimeline;

