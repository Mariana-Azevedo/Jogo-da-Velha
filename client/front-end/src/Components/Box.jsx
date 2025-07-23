// Components/Box.jsx
import React from 'react';

const Box = ({ value, onClick }) => {
  return (
    <div className="boxes" onClick={onClick}>
      {value && <img src={value} alt="jogada" className="symbol" />}
    </div>
  );
};

export default Box;
