import React from "react";

/**
 * CustomStatusSwitch — fully controlled toggle switch.
 * No internal state — parent owns isOn, parent handles toggle.
 *
 * Props:
 *   isOn         : boolean  — current on/off state (controlled)
 *   handleToggle : function — called when clicked, no args passed
 */
const CustomStatusSwitch = ({ isOn, handleToggle }) => {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        handleToggle();
      }}
      style={{
        width: 42,
        height: 24,
        borderRadius: 999,
        background: isOn ? "#2d5fa6" : "#cbd5e1",
        position: "relative",
        cursor: "pointer",
        transition: "background 0.25s ease",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 3,
          left: isOn ? 21 : 3,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          transition: "left 0.25s ease",
        }}
      />
    </div>
  );
};

export default CustomStatusSwitch;