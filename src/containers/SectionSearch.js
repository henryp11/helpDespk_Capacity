import React from 'react';

const SectionSearch = ({ query, setQuery, placeholder }) => {
  return (
    <div className="search_container">
      <label for="search_bar">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="icon_search"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <input
          id="search_bar"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          placeholder={placeholder}
          className="search_bar"
        />
      </label>
    </div>
  );
};

export default SectionSearch;
