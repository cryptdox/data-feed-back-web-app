import { useState, useRef, useEffect } from 'react';

interface DropdownOption<T = any> {
    label: string;
    value: T;
}

interface CustomDropdownProps<T = any> {
    label?: string;
    value: T;
    options: DropdownOption<T>[];
    onChange: (value: T) => void;
    upward?: boolean; // 👈 control direction
    width?: string;   // optional width
}

export function CustomDropdown<T>({
    label,
    value,
    options,
    onChange,
    upward = false,
    width = 'w-24',
}: CustomDropdownProps<T>) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!ref.current?.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selected = options.find(o => o.value === value);

    return (
        <div
            onClick={() => setOpen(prev => !prev)}

            ref={ref}
            className="relative cursor-pointer flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
        >
            {label && (
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {label}
                </span>
            )}

            {/* Trigger */}
            <button

                className="text-sm font-semibold text-gray-800 dark:text-gray-200"
            >
                {selected?.label}
            </button>

            {/* Dropdown */}
            {open && (
                <div
                    className={`absolute ${upward ? 'bottom-full mb-2' : 'top-full mt-2'} ${width} max-h-48 overflow-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50`}
                >
                    {options.map((opt, i) => (
                        <div
                            key={i}
                            onClick={() => {
                                onChange(opt.value);
                                setOpen(false);
                            }}
                            className={`px-3 py-2 cursor-pointer text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${opt.value === value ? 'font-bold text-gray-800 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
                                }`}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}