import React, { useState } from 'react';

const CustomSwitch = ({ isOn, handleToggle, onColor }) => {
  return (
    <div className="switch-container">
      <input
        checked={isOn}
        onChange={handleToggle}
        className="switch-checkbox"
        id={`react-switch-new`}
        type="checkbox"
      />
      <label
        className="switch-label"
        htmlFor={`react-switch-new`}
      >
        <span className={`switch-button`} />
      </label>
    </div>
  );
};

export default CustomSwitch;
