import type { ReactNode } from 'react'

interface SectionProps {
    title?: string
    children: ReactNode
}

export function Section({ title, children }: SectionProps) {
    return (
        <section className="w-full">
            {title && (
                <h2 className="mb-4 text-left text-sm tracking-widest text-slate-500">
                    {title}
                </h2>
            )}
            {children}
        </section>
    )
}