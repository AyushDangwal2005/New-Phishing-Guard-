"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Shield,
  Search,
  Globe,
  BookOpen,
  GraduationCap,
  HelpCircle,
  Newspaper,
  Menu,
} from "lucide-react"
import { useState } from "react"

const navItems = [
  { href: "/", label: "Analyzer", icon: Search, description: "Scan content" },
  { href: "/tracker", label: "Tracker", icon: Globe, description: "Check URLs" },
  { href: "/prevention", label: "Prevention", icon: BookOpen, description: "Learn safety" },
  { href: "/awareness", label: "Awareness", icon: GraduationCap, description: "Take quiz" },
  { href: "/support", label: "Support", icon: HelpCircle, description: "Get help" },
  { href: "/news", label: "News", icon: Newspaper, description: "Stay updated" },
]

export function Navigation() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
            <Shield className="h-5 w-5 text-primary-foreground transition-transform group-hover:scale-110" />
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-base tracking-tight">
              Phishing Guard
            </span>
            <span className="text-accent font-bold ml-1">AI</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-2 font-medium transition-all px-3",
                    isActive 
                      ? "bg-accent/10 text-accent hover:bg-accent/15" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", isActive && "text-accent")} />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            className="hidden sm:inline-flex bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
            asChild
          >
            <Link href="/">
              <Search className="h-4 w-4 mr-1.5" />
              Start Scanning
            </Link>
          </Button>
          
          <ThemeToggle />
          
          {/* Mobile Navigation */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetTitle className="flex items-center gap-2.5 mb-8">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Shield className="h-4.5 w-4.5 text-primary-foreground" />
                </div>
                <span className="font-bold">Phishing Guard AI</span>
              </SheetTitle>
              <nav className="flex flex-col gap-1.5">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                      <div
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                          isActive 
                            ? "bg-accent/10 text-accent" 
                            : "text-foreground hover:bg-muted"
                        )}
                      >
                        <div className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center",
                          isActive ? "bg-accent/15" : "bg-muted"
                        )}>
                          <item.icon className={cn("h-4.5 w-4.5", isActive && "text-accent")} />
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{item.label}</div>
                          <div className="text-xs text-muted-foreground">{item.description}</div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </nav>
              <div className="mt-8 pt-6 border-t border-border">
                <Button
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                  asChild
                >
                  <Link href="/" onClick={() => setOpen(false)}>
                    <Search className="h-4 w-4 mr-2" />
                    Start Scanning
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
