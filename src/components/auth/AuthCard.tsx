import { cn } from "@/lib/utils";

export function AuthCard({ children, className, title, subtitle }: { children: React.ReactNode, className?: string, title: string, subtitle?: string }) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

            <div className={cn(
                "w-full max-w-md bg-card/60 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl p-8 relative z-10",
                "animate-in fade-in zoom-in-95 duration-500",
                className
            )}>
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">{title}</h1>
                    {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
                </div>
                {children}
            </div>
        </div>
    );
}
