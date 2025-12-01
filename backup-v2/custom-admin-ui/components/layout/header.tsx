'use client'

import { useEffect, useState } from 'react'
import { authAPI } from '@/lib/payload-client'
import { User } from 'lucide-react'

export function Header() {
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        // Fetch user info
        const fetchUser = async () => {
            try {
                const userData = await authAPI.me()
                setUser(userData.user)
            } catch (error) {
                console.error('Failed to fetch user:', error)
            }
        }
        fetchUser()
    }, [])

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
            <div className="flex-1">
                <h1 className="text-lg font-semibold">Welcome back</h1>
            </div>
            <div className="flex items-center gap-4">
                {user && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                        </div>
                        <span>{user.email}</span>
                    </div>
                )}
            </div>
        </header>
    )
}
