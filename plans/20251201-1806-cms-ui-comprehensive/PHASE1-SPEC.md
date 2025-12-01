# PHASE 1 TECHNICAL SPECIFICATION
## Foundation & Architecture

**Duration**: 2-3 weeks
**Priority**: CRITICAL - Everything else depends on this

---

## 1.1 DESIGN SYSTEM ENHANCEMENT

### Task 1.1.1: Design Tokens
**File**: `lib/design-tokens.ts`

```typescript
export const designTokens = {
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
  },
  typography: {
    h1: 'text-4xl font-bold',
    h2: 'text-3xl font-semibold',
    h3: 'text-2xl font-semibold',
    body: 'text-base',
    small: 'text-sm',
  },
  colors: {
    // Extend Tailwind config
  }
}
```

### Task 1.1.2: Toast Notification System
**Files**:
- `components/ui/toast.tsx` (shadcn/ui - already available)
- `components/ui/toaster.tsx`
- `lib/hooks/use-toast.ts`

**Usage**:
```tsx
import { useToast } from '@/lib/hooks/use-toast'

const { toast } = useToast()

toast({
  title: 'Success',
  description: 'Product saved successfully',
  variant: 'success'
})
```

**Installation**:
```bash
npx shadcn-ui@latest add toast
```

### Task 1.1.3: Loading States & Skeletons
**Files**:
- `components/ui/skeleton.tsx` (shadcn/ui)
- `components/shared/loading-state.tsx`
- `components/shared/error-state.tsx`
- `components/shared/empty-state.tsx`

**Components**:
```tsx
// LoadingState.tsx
export function LoadingState() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

// ErrorState.tsx
export function ErrorState({ error, retry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
      <p className="text-sm text-muted-foreground mb-4">{error}</p>
      <Button onClick={retry}>Try again</Button>
    </div>
  )
}

// EmptyState.tsx
export function EmptyState({ title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      {action}
    </div>
  )
}
```

### Task 1.1.4: Error Boundaries
**File**: `components/shared/error-boundary.tsx`

```tsx
'use client'

import React from 'react'
import { ErrorState } from './error-state'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export class ErrorBoundary extends React.Component<
  Props,
  { hasError: boolean; error?: Error }
> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <ErrorState
          error={this.state.error?.message || 'An error occurred'}
          retry={() => this.setState({ hasError: false })}
        />
      )
    }

    return this.props.children
  }
}
```

---

## 1.2 ENHANCED NAVIGATION & UX

### Task 1.2.1: Command Palette (Cmd+K)
**Files**:
- `components/shared/command-palette.tsx`
- `lib/hooks/use-command-palette.ts`

**Dependencies**:
```bash
npm install cmdk
```

**Implementation**:
```tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/dashboard/products', icon: ShoppingBag },
  { name: 'Orders', href: '/dashboard/orders', icon: ShoppingCart },
  // ... more items
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {navigation.map((item) => (
            <CommandItem
              key={item.href}
              onSelect={() => {
                router.push(item.href)
                setOpen(false)
              }}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
```

**Add to layout**:
```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({ children }: Props) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
      <CommandPalette />
    </div>
  )
}
```

### Task 1.2.2: Breadcrumb Navigation
**Files**:
- `components/ui/breadcrumb.tsx` (shadcn/ui)
- `components/layout/breadcrumb-nav.tsx`

**Installation**:
```bash
npx shadcn-ui@latest add breadcrumb
```

**Implementation**:
```tsx
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export function BreadcrumbNav() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join('/')}`
          const isLast = index === segments.length - 1
          const label = segment.charAt(0).toUpperCase() + segment.slice(1)

          return (
            <React.Fragment key={href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
```

### Task 1.2.3: Collapsible Sidebar
**File**: `components/layout/sidebar.tsx` (enhance existing)

**Changes**:
```tsx
export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={cn(
      "flex h-full flex-col border-r bg-card transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex h-14 items-center border-b px-4 justify-between">
        {!collapsed && <span className="text-xl font-semibold">Admin</span>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </div>
      <nav className="flex-1 overflow-auto py-4">
        {sidebarItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 mx-2",
              collapsed && "justify-center"
            )}
          >
            <item.icon className="h-5 w-5" />
            {!collapsed && <span>{item.title}</span>}
          </Link>
        ))}
      </nav>
    </div>
  )
}
```

### Task 1.2.4: Mobile Responsive Header
**File**: `components/layout/header.tsx` (enhance existing)

**Add mobile menu**:
```tsx
export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="flex h-14 items-center gap-4 border-b px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMobileMenuOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <BreadcrumbNav />

      <div className="flex-1" />

      <Button variant="ghost" size="icon">
        <Bell className="h-5 w-5" />
      </Button>

      <UserMenu />

      {/* Mobile Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left">
          <Sidebar />
        </SheetContent>
      </Sheet>
    </header>
  )
}
```

---

## 1.3 ARCHITECTURE IMPROVEMENTS

### Task 1.3.1: Setup React Query
**Files**:
- `lib/react-query.ts`
- `app/providers.tsx` (update existing)

**Installation**:
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

**Setup**:
```tsx
// lib/react-query.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
})

// app/providers.tsx
'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/react-query'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

### Task 1.3.2: Generic API Resource Class
**File**: `lib/api-resource.ts`

```typescript
import { payloadClient } from './payload-client'

export interface QueryParams {
  page?: number
  limit?: number
  search?: string
  [key: string]: any
}

export interface PaginatedResponse<T> {
  docs: T[]
  totalDocs: number
  limit: number
  page: number
  totalPages: number
}

export class APIResource<T> {
  constructor(private endpoint: string) {}

  async getAll(params?: QueryParams): Promise<PaginatedResponse<T>> {
    const { data } = await payloadClient.get(this.endpoint, { params })
    return data
  }

  async getById(id: string): Promise<T> {
    const { data } = await payloadClient.get(`${this.endpoint}/${id}`)
    return data
  }

  async create(payload: Partial<T>): Promise<T> {
    const { data } = await payloadClient.post(this.endpoint, payload)
    return data
  }

  async update(id: string, payload: Partial<T>): Promise<T> {
    const { data } = await payloadClient.patch(`${this.endpoint}/${id}`, payload)
    return data
  }

  async delete(id: string): Promise<void> {
    await payloadClient.delete(`${this.endpoint}/${id}`)
  }

  async bulkDelete(ids: string[]): Promise<void> {
    await Promise.all(ids.map(id => this.delete(id)))
  }
}
```

**Usage**:
```typescript
// lib/api/orders.ts
import { APIResource } from '../api-resource'

export interface Order {
  id: string
  orderNumber: string
  customer: string
  total: number
  status: string
  createdAt: string
}

export const ordersAPI = new APIResource<Order>('/orders')

// In component:
import { useQuery, useMutation } from '@tanstack/react-query'
import { ordersAPI } from '@/lib/api/orders'

function OrdersList() {
  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersAPI.getAll()
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ordersAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast({ title: 'Order deleted' })
    }
  })

  // ...
}
```

### Task 1.3.3: Custom Hooks for Data Table
**File**: `lib/hooks/use-data-table.ts`

```tsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { APIResource } from '../api-resource'

interface UseDataTableOptions<T> {
  queryKey: string[]
  api: APIResource<T>
  initialPageSize?: number
}

export function useDataTable<T>({
  queryKey,
  api,
  initialPageSize = 10
}: UseDataTableOptions<T>) {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: [...queryKey, { page, pageSize, search }],
    queryFn: () => api.getAll({ page, limit: pageSize, search })
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    }
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => api.bulkDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    }
  })

  return {
    data: data?.docs || [],
    totalDocs: data?.totalDocs || 0,
    isLoading,
    page,
    pageSize,
    search,
    setPage,
    setPageSize,
    setSearch,
    deleteItem: deleteMutation.mutate,
    bulkDelete: bulkDeleteMutation.mutate,
  }
}
```

**Usage**:
```tsx
function OrdersList() {
  const {
    data: orders,
    totalDocs,
    isLoading,
    page,
    pageSize,
    setPage,
    deleteItem,
    bulkDelete
  } = useDataTable({
    queryKey: ['orders'],
    api: ordersAPI
  })

  // Just use the data!
}
```

### Task 1.3.4: State Management with Zustand
**Installation**:
```bash
npm install zustand
```

**Files**:
- `lib/stores/ui-store.ts`
- `lib/stores/auth-store.ts`

**UI Store**:
```typescript
// lib/stores/ui-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  sidebarCollapsed: boolean
  theme: 'light' | 'dark' | 'system'
  setSidebarCollapsed: (collapsed: boolean) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      theme: 'system',
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ui-settings',
    }
  )
)
```

**Auth Store**:
```typescript
// lib/stores/auth-store.ts
import { create } from 'zustand'

interface User {
  id: string
  email: string
  role: string
}

interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => {
    set({ user: null })
    localStorage.removeItem('payload-token')
    window.location.href = '/login'
  },
}))
```

---

## TESTING CHECKLIST

### Phase 1.1 - Design System
- [ ] Toast notifications appear correctly
- [ ] Skeleton loaders show during data fetch
- [ ] Error states display with retry button
- [ ] Empty states show helpful CTAs

### Phase 1.2 - Navigation
- [ ] Cmd+K opens command palette
- [ ] Command palette navigates correctly
- [ ] Breadcrumbs reflect current path
- [ ] Sidebar collapses/expands
- [ ] Mobile menu works on small screens

### Phase 1.3 - Architecture
- [ ] React Query devtools accessible
- [ ] API calls cached appropriately
- [ ] Optimistic updates work
- [ ] Zustand stores persist correctly

---

## NEXT PHASE PREPARATION

Before starting Phase 2:
1. ✅ All Phase 1 tasks complete
2. ✅ Code reviewed & refactored
3. ✅ Components documented
4. ✅ Performance baseline established (Lighthouse)
5. ✅ Team trained on new patterns

---

**Estimated Effort**: 2-3 weeks (1 developer full-time)
**Dependencies**: None (can start immediately)
**Blockers**: None identified