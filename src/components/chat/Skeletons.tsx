"use client";

import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-white/5", className)}
            {...props}
        />
    );
}

export function SidebarSkeleton() {
    return (
        <div className="flex flex-col h-full bg-slate-950">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <div className="p-3">
                <Skeleton className="h-10 w-full rounded-full" />
            </div>
            <div className="p-2 space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                        <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-3 w-3/4" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function ChatSkeleton() {
    return (
        <div className="flex-1 flex flex-col h-full bg-slate-950/50">
            <div className="h-16 border-b border-white/5 px-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-12" />
                    </div>
                </div>
            </div>
            <div className="flex-1 p-4 space-y-4">
                <Skeleton className="h-10 w-1/3 rounded-2xl rounded-tl-none" />
                <Skeleton className="h-12 w-1/4 rounded-2xl rounded-tr-none ml-auto bg-cyan-500/10" />
                <Skeleton className="h-10 w-1/2 rounded-2xl rounded-tl-none" />
                <Skeleton className="h-10 w-1/3 rounded-2xl rounded-tr-none ml-auto bg-cyan-500/10" />
            </div>
            <div className="p-4 bg-slate-950/80 border-t border-white/5">
                <Skeleton className="h-12 w-full rounded-2xl" />
            </div>
        </div>
    );
}
