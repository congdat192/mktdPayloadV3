"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"

interface DataTableToolbarProps<TData> {
    table: Table<TData>
    searchKey?: string
    onDelete?: (rows: TData[]) => void
}

export function DataTableToolbar<TData>({
    table,
    searchKey = "name",
    onDelete,
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
                {selectedRows.length > 0 && onDelete && (
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(selectedRows.map((row) => row.original))}
                        className="h-8 px-2 lg:px-3"
                    >
                        Delete ({selectedRows.length})
                        <Cross2Icon className="ml-2 h-4 w-4 rotate-45" />
                    </Button>
                )}
            </div>
            <DataTableViewOptions table={table} />
        </div>
    )
}
