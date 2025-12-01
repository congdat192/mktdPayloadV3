"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"
import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DataTableToolbarProps<TData> {
    table: Table<TData>
    searchKey?: string
    onDelete?: (rows: TData[]) => void
    onBulkAction?: (action: string, rows: TData[]) => void
}

export function DataTableToolbar<TData>({
    table,
    searchKey = "name",
    onDelete,
    onBulkAction,
}: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0
    const selectedRows = table.getFilteredSelectedRowModel().rows

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                <Input
                    placeholder="Filter..."
                    value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn(searchKey)?.setFilterValue(event.target.value)
                    }
                    className="h-8 w-[150px] lg:w-[250px]"
                />
                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => table.resetColumnFilters()}
                        className="h-8 px-2 lg:px-3"
                    >
                        Reset
                        <Cross2Icon className="ml-2 h-4 w-4" />
                    </Button>
                )}
                {selectedRows.length > 0 && (
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8">
                                    Bulk Actions ({selectedRows.length})
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                {onBulkAction && (
                                    <>
                                        <DropdownMenuItem
                                            onClick={() => onBulkAction("publish", selectedRows.map((row) => row.original))}
                                        >
                                            Publish
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => onBulkAction("unpublish", selectedRows.map((row) => row.original))}
                                        >
                                            Unpublish
                                        </DropdownMenuItem>
                                    </>
                                )}
                                {onDelete && (
                                    <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={() => onDelete(selectedRows.map((row) => row.original))}
                                    >
                                        Delete
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>
            <DataTableViewOptions table={table} />
        </div>
    )
}
