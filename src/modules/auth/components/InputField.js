import React from "react";

function InputField({ label, id, name, type = "text", placeholder, value, onChange, required = false }) {
    return (
        <div className="form-group">
            <label className="form-label" htmlFor={id}>{label}</label>
            <input
                id={id}
                name={name}
                type={type}
                className="form-input"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
            />
        </div>
    );
}

export default InputField;
