import { getPayload } from 'payload'
import config from '@payload-config'
import { StatsCard } from "@/components/dashboard/stats-card"
import { RecentItems } from "@/components/dashboard/recent-items"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { FileText, ShoppingBag, Image as ImageIcon, Users } from "lucide-react"

export default async function DashboardPage() {
    const payload = await getPayload({ config })

    const [
        productsCount,
        postsCount,
        mediaCount,
        usersCount,
        recentProducts,
        recentPosts
    ] = await Promise.all([
        payload.count({ collection: 'products' }),
        payload.count({ collection: 'posts' }),
        payload.count({ collection: 'media' }),
        payload.count({ collection: 'users' }),
        payload.find({
            collection: 'products',
            limit: 5,
            sort: '-createdAt',
        }),
        payload.find({
            collection: 'posts',
            limit: 5,
            sort: '-createdAt',
        }),
    ])

    const recentProductItems = recentProducts.docs.map((doc: any) => ({
        id: doc.id,
        title: doc.name,
        createdAt: doc.createdAt,
        status: doc.price ? `$${doc.price}` : undefined,
        type: 'product' as const,
    }))

    const recentPostItems = recentPosts.docs.map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        createdAt: doc.createdAt,
        status: doc.status,
        type: 'post' as const,
    }))

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Products"
                    value={productsCount.totalDocs}
                    icon={ShoppingBag}
                    description="Active products"
                />
                <StatsCard
                    title="Total Posts"
                    value={postsCount.totalDocs}
                    icon={FileText}
                    description="Published posts"
                />
                <StatsCard
                    title="Media Files"
                    value={mediaCount.totalDocs}
                    icon={ImageIcon}
                    description="Images & documents"
                />
                <StatsCard
                    title="Total Users"
                    value={usersCount.totalDocs}
                    icon={Users}
                    description="Registered users"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Recent Activity - Takes up 4 columns */}
                <div className="col-span-4 space-y-4">
                    <RecentItems
                        title="Recent Products"
                        items={recentProductItems}
                        viewAllLink="/dashboard/products"
                    />
                    <RecentItems
                        title="Recent Posts"
                        items={recentPostItems}
                        viewAllLink="/dashboard/posts"
                    />
                </div>

                {/* Quick Actions - Takes up 3 columns */}
                <div className="col-span-3">
                    <QuickActions />
                </div>
            </div>
        </div>
    )
}
