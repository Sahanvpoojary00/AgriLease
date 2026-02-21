import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    icon?: React.ReactNode;
    suffix?: React.ReactNode;
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    hint?: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    hint?: string;
    options: { value: string; label: string }[];
    placeholder?: string;
}

export function Input({ label, error, hint, icon, suffix, className = '', ...props }: InputProps) {
    return (
        <div className="space-y-1.5">
            {label && (
                <label className="block text-sm font-medium text-white/80">
                    {label}
                    {props.required && <span className="text-danger ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                        {icon}
                    </div>
                )}
                <input
                    className={`
            input-earth
            ${icon ? 'pl-10' : ''}
            ${suffix ? 'pr-12' : ''}
            ${error ? 'border-danger focus:border-danger focus:ring-danger/20' : ''}
            ${className}
          `}
                    {...props}
                />
                {suffix && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-sm">
                        {suffix}
                    </div>
                )}
            </div>
            {error && <p className="text-danger text-xs">{error}</p>}
            {hint && !error && <p className="text-muted text-xs">{hint}</p>}
        </div>
    );
}

export function Textarea({ label, error, hint, className = '', ...props }: TextareaProps) {
    return (
        <div className="space-y-1.5">
            {label && (
                <label className="block text-sm font-medium text-white/80">
                    {label}
                    {props.required && <span className="text-danger ml-1">*</span>}
                </label>
            )}
            <textarea
                className={`input-earth min-h-[100px] resize-y ${error ? 'border-danger' : ''} ${className}`}
                {...props}
            />
            {error && <p className="text-danger text-xs">{error}</p>}
            {hint && !error && <p className="text-muted text-xs">{hint}</p>}
        </div>
    );
}

export function Select({ label, error, hint, options, placeholder, className = '', ...props }: SelectProps) {
    return (
        <div className="space-y-1.5">
            {label && (
                <label className="block text-sm font-medium text-white/80">
                    {label}
                    {props.required && <span className="text-danger ml-1">*</span>}
                </label>
            )}
            <select
                className={`input-earth appearance-none ${error ? 'border-danger' : ''} ${className}`}
                {...props}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-earth-surface">
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <p className="text-danger text-xs">{error}</p>}
            {hint && !error && <p className="text-muted text-xs">{hint}</p>}
        </div>
    );
}
