import React from 'react';

const SectionSearch = ({
  query,
  setQuery,
  placeholder,
  title,
  searchAll,
  showAll,
  showButtonAll,
  messageButtonAll,
}) => {
  return (
    <div className="search_container">
      <h4>{title}</h4>
      <label for="search_bar" title="Busqueda rápida en pantalla">
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
      {showButtonAll && (
        <button
          type="button"
          className="buttonShowAll"
          onClick={() => {
            showAll(!searchAll);
          }}
          title={
            searchAll
              ? messageButtonAll
              : 'Mostrar todos los registros en pantalla'
          }
        >
          {searchAll ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM13.5 10.5h-6"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6"
              />
            </svg>
          )}

          {searchAll ? 'Ocultar antiguos' : 'Mostrar todo'}
        </button>
      )}
    </div>
  );
};

export default SectionSearch;
