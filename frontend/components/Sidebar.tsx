"use client";
import React, { useState } from 'react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true); // State to manage sidebar open/close

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className={`${isOpen ? 'w-64' : 'w-16'} h-screen bg-gray-800 text-white p-4 transition-all duration-300`}
    >
      {/* Sidebar Header with Toggle Icon */}
      <div className="flex items-center justify-between mb-8">
        {isOpen && <h2 className="text-2xl font-semibold">Menu</h2>}
        <button onClick={toggleSidebar} className="focus:outline-none">
          {isOpen ? (
            // Close icon (e.g., "X" or a left arrow)
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-300 hover:text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            // Open icon (e.g., hamburger menu)
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-300 hover:text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Sidebar Menu */}
      <ul className="space-y-4">
        <li>
            <a href='#'></a>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;