import { Link } from '@inertiajs/react';

export default function RetroNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition duration-150 ease-in-out font-mono uppercase tracking-wider ' +
                (active
                    ? 'border-[#00ffaa] text-[#00ffaa] focus:outline-none focus:border-[#00ffaa]'
                    : 'border-transparent text-[#005533] hover:text-[#00ffaa] hover:border-[#005533] focus:text-[#00ffaa] focus:border-[#005533]') +
                className
            }
        >
            {children}
        </Link>
    );
}
