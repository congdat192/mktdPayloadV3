'use client'

import { User as UserIcon, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface HeaderProps {
    user: any // Will be typed from Payload types
}

export function Header({ user }: HeaderProps) {
    const router = useRouter()

    const handleLogout = async () => {
        try {
            // Call Payload's logout endpoint
            await fetch('/api/users/logout', {
                method: 'POST',
                credentials: 'include',
            })
            // Redirect to login
            router.push('/admin/login')
            router.refresh()
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
            <div className="flex-1">
                <h1 className="text-lg font-semibold">Welcome back</h1>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-primary" />
                    </div>
                    <span>{user?.email}</span>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
                    title="Logout"
                >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                </button>
            </div>
        </header>
    )
}
