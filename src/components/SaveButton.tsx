import React from 'react';

interface SaveButtonProps {
  onClick: () => void;
  disabled?: boolean;
  text?: string;
}

const SaveButton: React.FC<SaveButtonProps> = ({ onClick, disabled = false, text = "Guardar" }) => {
  return (
    <div className="save-btn-wrapper">
      <div className="line horizontal top" />
      <div className="line vertical right" />
      <div className="line horizontal bottom" />
      <div className="line vertical left" />
      <div className="dot top left" />
      <div className="dot top right" />
      <div className="dot bottom right" />
      <div className="dot bottom left" />
      <button className="save-btn" onClick={onClick} disabled={disabled}>
        <span className="btn-text">{text}</span>
      </button>
    </div>
  );
};

export default SaveButton;
