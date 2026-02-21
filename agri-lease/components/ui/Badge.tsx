type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    size?: 'sm' | 'md';
    dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
    success: 'badge-active',
    warning: 'badge-pending',
    danger: 'badge-rejected',
    info: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
    default: 'bg-earth-surface text-muted border border-earth-border',
};

export function Badge({ children, variant = 'default', size = 'sm', dot = false }: BadgeProps) {
    return (
        <span
            className={`
        inline-flex items-center gap-1.5 font-medium rounded-full
        ${size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}
        ${variantStyles[variant]}
      `}
        >
            {dot && (
                <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
            )}
            {children}
        </span>
    );
}

export function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; variant: BadgeVariant }> = {
        active: { label: 'Active', variant: 'success' },
        pending: { label: 'Pending', variant: 'warning' },
        accepted: { label: 'Accepted', variant: 'success' },
        rejected: { label: 'Rejected', variant: 'danger' },
        leased: { label: 'Leased', variant: 'info' },
        draft: { label: 'Draft', variant: 'default' },
        farmer_signed: { label: 'Awaiting Landowner', variant: 'warning' },
        completed: { label: 'Completed', variant: 'success' },
        cancelled: { label: 'Cancelled', variant: 'danger' },
        inactive: { label: 'Inactive', variant: 'default' },
        closed: { label: 'Closed', variant: 'default' },
    };

    const config = map[status] || { label: status, variant: 'default' as BadgeVariant };
    return <Badge variant={config.variant} dot>{config.label}</Badge>;
}
