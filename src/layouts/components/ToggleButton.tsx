interface ToggleButtonProps {
    isExpanded: boolean;
    onToggle: () => void;
}

export default function ToggleButton({ isExpanded, onToggle }: ToggleButtonProps) {
    return (
        <button
            onClick={onToggle}
            className={`
        hidden md:flex
        fixed top-4
        items-center justify-center
        w-6 h-6 
        bg-[var(--bg)] 
        border-2 border-app
        rounded-full 
        shadow-[0_2px_8px_rgba(0,0,0,0.1)]
        hover:shadow-lg
        hover:scale-110 
        active:scale-95
        transition-all duration-300 ease-out
        z-50
        group
        ${isExpanded ? 'left-[calc(16rem-0.75rem)]' : 'left-[calc(4rem-0.75rem)]'}
      `}
            aria-label={isExpanded ? "ย่อเมนู" : "ขยายเมนู"}
            title={isExpanded ? "ย่อเมนู" : "ขยายเมนู"}
        >
            {isExpanded ? (
                <svg className="w-3 h-3 text-[var(--accent)] group-hover:brightness-110 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
            ) : (
                <svg className="w-3 h-3 text-[var(--accent)] group-hover:brightness-110 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
            )}
        </button>
    );
}
