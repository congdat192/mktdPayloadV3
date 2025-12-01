"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { attributesAPI } from "@/lib/payload-client"

export type Attribute = {
    id: string
    name: string
    slug: string
    type: string
    options: any[]
    createdAt: string
    updatedAt: string
}

export const columns: ColumnDef<Attribute>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "slug",
        header: "Slug",
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
            const type = row.getValue("type") as string
            return <div className="capitalize">{type}</div>
        },
    },
    {
        accessorKey: "options",
        header: "Terms",
        cell: ({ row }) => {
            const options = row.original.options || []
            return (
                <div className="flex flex-wrap gap-1">
                    {options.slice(0, 3).map((opt: any, i: number) => (
                        <span key={i} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                            {opt.label}
                        </span>
                    ))}
                    {options.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{options.length - 3} more</span>
                    )}
                </div>
            )
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const attribute = row.original

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
                            onClick={() => navigator.clipboard.writeText(attribute.id)}
                        >
                            Copy ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/attributes/${attribute.id}`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-red-600"
                            onClick={async () => {
                                if (confirm("Are you sure you want to delete this attribute?")) {
                                    try {
                                        await attributesAPI.delete(attribute.id)
                                        window.location.reload()
                                    } catch (error) {
                                        console.error("Failed to delete attribute:", error)
                                        alert("Failed to delete attribute")
                                    }
                                }
                            }}
                        >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
