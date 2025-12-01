'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    FileText,
    ShoppingBag,
    Tags,
    Image as ImageIcon,
    Settings,
    LogOut,
    Sliders,
    User as UserIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const sidebarItems = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Posts',
        href: '/dashboard/posts',
        icon: FileText,
    },
    {
        title: 'Products',
        href: '/dashboard/products',
        icon: ShoppingBag,
    },
    {
        title: 'Categories',
        href: '/dashboard/categories',
        icon: Tags,
    },
    {
        title: 'Attributes',
        href: '/dashboard/attributes',
        icon: Sliders,
    },
    {
        title: 'Media',
        href: '/dashboard/media',
        icon: ImageIcon,
    },
]

interface SidebarProps {
    user: any // Will be typed from Payload types
}

export function Sidebar({ user }: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()

    const handleLogout = async () => {
        try {
            await fetch('/api/users/logout', {
                method: 'POST',
                credentials: 'include',
            })
            router.push('/admin/login')
            router.refresh()
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    return (
        <div className="flex h-full w-64 flex-col border-r bg-card text-card-foreground">
            <div className="flex h-14 items-center border-b px-6">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                    <span className="text-xl">Admin Panel</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid gap-1 px-2">
                    {sidebarItems.map((item, index) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href

                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {item.title}
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="border-t p-4 space-y-3">
                {/* User Info */}
                <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-accent/50">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <UserIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user?.email}</p>
                        <p className="text-xs text-muted-foreground capitalize">{user?.role || 'user'}</p>
                    </div>
                </div>
                {/* Logout Button */}
                <Button
                    variant="outline"
                    className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
    )
}
