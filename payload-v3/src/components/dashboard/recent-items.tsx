import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, FileText, ShoppingBag } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Item {
    id: string
    title: string
    createdAt: string
    status?: string
    type: 'product' | 'post'
}

interface RecentItemsProps {
    title: string
    items: Item[]
    viewAllLink: string
}

export function RecentItems({ title, items, viewAllLink }: RecentItemsProps) {
    return (
        <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{title}</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                    <Link href={viewAllLink}>
                        View All <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {items.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No items found.</p>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                                        {item.type === 'product' ? (
                                            <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                                        ) : (
                                            <FileText className="h-5 w-5 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">{item.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                                {item.status && (
                                    <div className="text-xs font-medium px-2 py-1 rounded-full bg-secondary">
                                        {item.status}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
