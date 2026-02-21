import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    glass?: boolean;
    hover?: boolean;
    padding?: 'sm' | 'md' | 'lg' | 'none';
}

const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
};

export function Card({ children, className = '', glass = false, hover = false, padding = 'md' }: CardProps) {
    return (
        <div
            className={`
        rounded-2xl border border-earth-border
        ${glass ? 'glass-card' : 'bg-earth-card'}
        ${hover ? 'hover:border-primary-light hover:shadow-card transition-all duration-300 cursor-pointer' : ''}
        ${paddingClasses[padding]}
        ${className}
      `}
        >
            {children}
        </div>
    );
}

interface CardHeaderProps {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
    icon?: React.ReactNode;
}

export function CardHeader({ title, subtitle, action, icon }: CardHeaderProps) {
    return (
        <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
                {icon && (
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-success flex-shrink-0">
                        {icon}
                    </div>
                )}
                <div>
                    <h3 className="text-white font-semibold font-heading text-lg leading-tight">{title}</h3>
                    {subtitle && <p className="text-muted text-sm mt-0.5">{subtitle}</p>}
                </div>
            </div>
            {action && <div className="flex-shrink-0">{action}</div>}
        </div>
    );
}
