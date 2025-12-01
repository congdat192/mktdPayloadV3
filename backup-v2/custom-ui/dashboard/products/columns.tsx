"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { productsAPI } from "@/lib/payload-client"

export type Product = {
    id: string
    name: string
    slug: string
    price: number
    stockStatus: 'instock' | 'outofstock' | 'onbackorder'
    updatedAt: string
}

function ActionsCell({ product, onRefresh }: { product: Product, onRefresh: () => void }) {
    const router = useRouter()

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
            return
        }

        try {
            await productsAPI.delete(product.id)
            alert('Product deleted successfully')
            // Refresh the data
            onRefresh()
        } catch (error) {
            console.error('Failed to delete product:', error)
            alert('Failed to delete product')
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={() => navigator.clipboard.writeText(product.id)}
                >
                    Copy ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(`/dashboard/products/${product.id}`)}>
                    Edit Product
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
                    Delete Product
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export const createColumns = (onRefresh: () => void): ColumnDef<Product>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("price"))
            const formatted = new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
            }).format(amount)
            return <div className="font-medium">{formatted}</div>
        },
    },
    {
        accessorKey: "stockStatus",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("stockStatus") as string
            return (
                <div className={`capitalize ${status === 'instock' ? 'text-green-600' : 'text-red-600'}`}>
                    {status}
                </div>
            )
        }
    },
    {
        id: "actions",
        cell: ({ row }) => <ActionsCell product={row.original} onRefresh={onRefresh} />,
    },
]
