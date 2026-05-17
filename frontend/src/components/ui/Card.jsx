import React from 'react';

/**
 * Card — white surface wrapper.
 * @param {ReactNode} children
 * @param {string}    className — appended to base styles
 */
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 ${className}`}>
    {children}
  </div>
);

export default Card;
