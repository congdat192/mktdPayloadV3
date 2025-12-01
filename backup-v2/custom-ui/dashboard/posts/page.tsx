"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { columns, Post } from "./columns"
import { postsAPI } from "@/lib/payload-client"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import Link from "next/link"

export default function PostsPage() {
    const [data, setData] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await postsAPI.getAll()
                setData(response.docs)
            } catch (error) {
                console.error("Failed to fetch posts:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Posts</h2>
                <Button asChild>
                    <Link href="/dashboard/posts/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Post
                    </Link>
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <DataTable columns={columns} data={data} />
            )}
        </div>
    )
}
