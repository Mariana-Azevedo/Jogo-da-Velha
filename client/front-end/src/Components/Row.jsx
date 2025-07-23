// Components/Row.jsx
import React from 'react';
import Box from './Box';

const Row = ({ row, rowIndex, handleClick }) => {
  return (
    <div className="row">
      {row.map((value, colIndex) => (
        <Box
          key={colIndex}
          value={value}
          onClick={() => handleClick(rowIndex, colIndex)}
        />
      ))}
    </div>
  );
};

export default Row;
