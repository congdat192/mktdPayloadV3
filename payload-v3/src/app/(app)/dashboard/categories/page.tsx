"use client"

import { useEffect, useState } from "react"
import { SortableCategoryList } from "@/components/categories/category-list"
import { Category } from "./columns"
import { categoriesAPI } from "@/lib/payload-client"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import Link from "next/link"

export default function CategoriesPage() {
    const [data, setData] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await categoriesAPI.getAll({ limit: 1000 }) // Fetch all to build tree
                const docs = response.docs as Category[]
                console.log("Fetched categories:", docs)

                // Build hierarchy
                const buildTree = (categories: Category[]) => {
                    const categoryMap = new Map<string, Category & { children: any[] }>()
                    const roots: any[] = []

                    // Initialize map
                    categories.forEach(cat => {
                        categoryMap.set(cat.id, { ...cat, children: [] })
                    })

                    // Build tree
                    categories.forEach(cat => {
                        const node = categoryMap.get(cat.id)
                        const parentId = typeof cat.parent === 'object' ? cat.parent?.id : cat.parent

                        if (parentId && categoryMap.has(parentId)) {
                            categoryMap.get(parentId)!.children.push(node)
                        } else {
                            roots.push(node)
                        }
                    })

                    // Sort by order
                    const sortNodes = (nodes: any[]) => {
                        nodes.sort((a, b) => (a.order || 0) - (b.order || 0))
                        nodes.forEach(node => sortNodes(node.children))
                    }

                    sortNodes(roots)
                    return roots
                }

                const flattenTree = (nodes: any[], depth = 0): Category[] => {
                    return nodes.reduce((acc, node) => {
                        const { children, ...category } = node
                        return [
                            ...acc,
                            { ...category, depth },
                            ...flattenTree(children, depth + 1)
                        ]
                    }, [])
                }

                const tree = buildTree(docs)
                const flatData = flattenTree(tree)
                console.log("Built tree:", tree)
                console.log("Flat data with depth:", flatData)

                setData(flatData)
            } catch (error) {
                console.error("Failed to fetch categories:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
                <Button asChild>
                    <Link href="/dashboard/categories/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Category
                    </Link>
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <SortableCategoryList
                    categories={data}
                    onReorder={async (newOrder) => {
                        setData(newOrder)
                        try {
                            // Update order for all items based on their new index
                            await Promise.all(newOrder.map((cat, index) =>
                                categoriesAPI.update(cat.id, { order: index })
                            ))
                            console.log("Order updated successfully")
                        } catch (error) {
                            console.error("Failed to update order:", error)
                        }
                    }}
                    onDelete={async (id) => {
                        if (confirm("Are you sure you want to delete this category?")) {
                            try {
                                await categoriesAPI.delete(id)
                                setData(data.filter(c => c.id !== id))
                            } catch (error) {
                                console.error("Failed to delete category:", error)
                                alert("Failed to delete category")
                            }
                        }
                    }}
                />
            )}
        </div>
    )
}
