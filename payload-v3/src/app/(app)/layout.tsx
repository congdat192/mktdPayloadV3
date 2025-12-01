import React from 'react'
import '../globals.css'

export const metadata = {
    title: 'Custom Admin Dashboard',
    description: 'Manage your products and content',
}

export default function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
