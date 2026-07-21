import React from "react";

function InputField({ label, id, name, type = "text", placeholder, value, onChange, required = false, autoComplete }) {
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
                autoComplete={autoComplete}
            />
        </div>
    );
}

export default InputField;
