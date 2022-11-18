import React from 'react'

export const Typo: React.FC<React.PropsWithChildren<{
    component?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    title?: string
}>> = (
    {
        component, title,
        children,
    }
) => {
    const Comp = component || 'p'
    return <Comp style={{margin: '0 0 0.125em 0'}} title={title}>
        {children}
    </Comp>
}
