"use client"

import { useEffect, useState, useMemo } from "react"
import { productsAPI } from "@/lib/payload-client"
import { Product, createColumns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function ProductsPage() {
    const [data, setData] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        setLoading(true)
        try {
            const result = await productsAPI.getAll({ limit: 100 })
            setData(result.docs)
        } catch (error) {
            console.error("Failed to fetch products:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const columns = useMemo(() => createColumns(fetchData), [])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Products</h2>
                <Button asChild>
                    <a href="/dashboard/products/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                    </a>
                </Button>
            </div>

            {loading ? (
                <div>Loading products...</div>
            ) : (
                <DataTable
                    columns={columns}
                    data={data}
                    onDelete={async (selectedRows) => {
                        if (!confirm(`Are you sure you want to delete ${selectedRows.length} products?`)) return

                        setLoading(true)
                        try {
                            await Promise.all(selectedRows.map(row => productsAPI.delete(row.id)))
                            await fetchData()
                        } catch (error) {
                            console.error("Failed to delete products:", error)
                            alert("Failed to delete some products")
                        } finally {
                            setLoading(false)
                        }
                    }}
                    onBulkAction={async (action, selectedRows) => {
                        const actionText = action === 'publish' ? 'publish' : 'unpublish'
                        if (!confirm(`Are you sure you want to ${actionText} ${selectedRows.length} products?`)) return

                        setLoading(true)
                        try {
                            const updates = selectedRows.map(row =>
                                productsAPI.update(row.id, {
                                    _status: action === 'publish' ? 'published' : 'draft'
                                })
                            )
                            await Promise.all(updates)
                            await fetchData()
                            alert(`Successfully ${actionText}ed ${selectedRows.length} products`)
                        } catch (error) {
                            console.error(`Failed to ${actionText} products:`, error)
                            alert(`Failed to ${actionText} some products`)
                        } finally {
                            setLoading(false)
                        }
                    }}
                />
            )}
        </div>
    )
}
