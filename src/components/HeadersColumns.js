import React from "react";

const HeadersColumns = ({ classEsp, columnTitles, columnActivate }) => {
  console.log(columnTitles);

  return (
    <div className={`generalTitle ${classEsp.toString().replace(",", " ")}`}>
      {columnTitles.map((column) => {
        if (column.show) return <span key={column.id}>{column.name}</span>;
      })}
    </div>
  );
};

export default HeadersColumns;
