import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Image, FolderPlus, Settings } from "lucide-react"

export function QuickActions() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
                    <Link href="/dashboard/products/new">
                        <PlusCircle className="h-6 w-6" />
                        <span>New Product</span>
                    </Link>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
                    <Link href="/dashboard/posts/new">
                        <FileTextIcon className="h-6 w-6" />
                        <span>New Post</span>
                    </Link>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
                    <Link href="/dashboard/media">
                        <Image className="h-6 w-6" />
                        <span>Upload Media</span>
                    </Link>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
                    <Link href="/dashboard/categories/new">
                        <FolderPlus className="h-6 w-6" />
                        <span>New Category</span>
                    </Link>
                </Button>
            </CardContent>
        </Card>
    )
}

function FileTextIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" x2="8" y1="13" y2="13" />
            <line x1="16" x2="8" y1="17" y2="17" />
            <line x1="10" x2="8" y1="9" y2="9" />
        </svg>
    )
}
