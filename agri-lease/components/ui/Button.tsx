import React from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    loading?: boolean;
    icon?: React.ReactNode;
    fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
    primary: 'bg-gradient-green text-white hover:opacity-90 shadow-glow-olive hover:shadow-glow-green',
    secondary: 'bg-earth-card text-white border border-earth-border hover:border-primary-light hover:bg-earth-surface',
    outline: 'bg-transparent text-success border border-success hover:bg-success hover:text-earth-deep',
    ghost: 'bg-transparent text-muted hover:text-white hover:bg-earth-card',
    danger: 'bg-danger text-white hover:bg-red-700',
};

const sizeClasses: Record<Size, string> = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-5 py-2.5 text-sm rounded-lg',
    lg: 'px-7 py-3.5 text-base rounded-xl',
};

export function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    fullWidth = false,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            className={`
        inline-flex items-center justify-center gap-2 font-semibold tracking-wide
        transition-all duration-200 ease-in-out
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            ) : icon ? (
                <span className="flex-shrink-0">{icon}</span>
            ) : null}
            {children}
        </button>
    );
}
