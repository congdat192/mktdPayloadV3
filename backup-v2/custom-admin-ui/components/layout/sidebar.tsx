'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    FileText,
    ShoppingBag,
    Tags,
    Image as ImageIcon,
    Settings,
    LogOut,
    Sliders
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { authAPI } from '@/lib/payload-client'

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

export function Sidebar() {
    const pathname = usePathname()

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
            <div className="border-t p-4">
                <Button
                    variant="outline"
                    className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => authAPI.logout()}
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
    )
}
