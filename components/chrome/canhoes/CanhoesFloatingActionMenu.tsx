"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Calendar,
  CircleDollarSign,
  Edit,
  Flag,
  LayoutTemplate,
  LogOut,
  MessageSquare,
  Settings,
  Share2,
  ShoppingCart,
  Trophy,
  User,
  Users,
  X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { adminCopy } from "@/lib/canhoesCopy";
import { canhoesNavigation } from "@/lib/canhoesNavigation";
import { useAuth } from "@/hooks/useAuth";
import { useEventOverview } from "@/hooks/useEventOverview";
import { IS_LOCAL_MODE } from "@/lib/mock";
import { cn } from "@/lib/utils";

type CanhoesFloatingActionMenuProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin: boolean;
  isLocalMode: boolean;
  overview: any;
  primaryIds: readonly string[];
  onNavigate: (href: string) => void;
};

export function CanhoesFloatingActionMenu({
  isOpen,
  onOpenChange,
  isAdmin,
  isLocalMode,
  overview,
  primaryIds,
  onNavigate,
}: Readonly<CanhoesFloatingActionMenuProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(isOpen);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setVisible(false);
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setVisible(false);
        onOpenChange(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onOpenChange]);

  const menuItems = canhoesNavigation({
    isAdmin,
    isLocalMode,
    overview,
    pathname,
    router,
  });

  if (!isOpen) return null;

  const groupedItems: Record<string, { title: string; items: any[] }> = {};
  menuItems.forEach((item) => {
    const key = item.id;
    if (!groupedItems[key]) {
      groupedItems[key] = {
        title: item.group || item.label,
        items: [],
      };
    }
    groupedItems[key].items.push(item);
  });

  const renderIcon = (iconName: string) => {
    const iconMap: Record<string, any> = {
      more: Menu,
      compose: Edit,
      home: BookOpen,
      events: Calendar,
      explore: ArrowUpRight,
      messages: MessageSquare,
      shop: ShoppingCart,
      market: Trophy,
      friends: Users,
      admin: Settings,
      logout: LogOut,
      profile: User,
    };
    const Icon = iconMap[iconName] || ArrowUpRight;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div
      ref={menuRef}
      className="fixed inset-0 z-50 flex items-start justify-end"
    >
      <div
        className={cn(
          "fixed right-0 top-0 z-40 mt-[calc(3.5rem+env(safe-area-inset-top))] mr-4 w-[32rem] overflow-hidden rounded-2xl border bg-[rgba(12,15,9,0.98)] p-4 shadow-[var(--shadow-panel)], transition-all duration-200 ease-out",
          visible ? "opacity-100 translate-x-0" : "opacity-0 pointer-events-none translate-x-full"
        )}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="space-y-1">
            <p className="label text-[rgba(245,237,224,0.58)]">Menu</p>
            <p className="truncate text-sm font-semibold text-[var(--bg-paper)]">
              {adminCopy.shell.more.title}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setVisible(false);
              onOpenChange(false);
            }}
            className="canhoes-tap rounded-full p-2 text-[var(--accent-purple-soft)] hover:bg-[rgba(177,140,255,0.18)]"
            aria-label={adminCopy.shell.more.closeAction}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="overflow-y-auto max-h-[60vh] space-y-6">
          {Object.entries(groupedItems).map(([key, { title, items }]) => (
            <div key={key} className="space-y-1">
              <p className="px-1 text-[10px] uppercase leading-none text-[rgba(245,237,224,0.4)]">
                {title}
              </p>
              <ul className="grid grid-cols-[auto_1fr] gap-x-2">
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onNavigate(item.href);
                      }}
                      className={cn(
                        "canhoes-tap grid grid-cols-[auto_auto] items-center gap-2 rounded-md px-2 py-2 transition-colors",
                        pathname === item.href
                          ? "bg-[rgba(177,140,255,0.18)] text-[var(--bg-paper)]"
                          : "text-[var(--text-primary)] hover:bg-[rgba(177,140,255,0.12)]"
                      )}
                      aria-current={pathname === item.href ? "page" : undefined}
                    >
                      <span
                        className={cn(
                          "grid h-8 w-8 place-items-center rounded-full",
                          pathname === item.href
                            ? "bg-[var(--neon-green)] text-[var(--bg-void)]"
                            : "bg-[var(--beige)]/50 text-[var(--accent-purple-soft)]"
                        )}
                      >
                        {renderIcon(item.icon)}
                      </span>
                      <span
                        className={cn(
                          "truncate text-xs",
                          pathname === item.href ? "font-semibold" : "font-medium"
                        )}
                      >
                        {item.label}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {isLogged && (
          <div className="mt-4 border-t border-[rgba(212,184,150,0.12)] pt-3">
            <button
              type="button"
              onClick={() => {
                onNavigate("/perfil");
              }}
              className={cn(
                "canhoes-tap flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-[var(--text-primary)] transition-colors",
                pathname === "/perfil"
                  ? "bg-[rgba(177,140,255,0.18)]"
                  : "hover:bg-[rgba(177,140,255,0.12)]"
              )}
            >
              <span
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-full",
                  pathname === "/perfil"
                    ? "bg-[var(--neon-green)] text-[var(--bg-void)]"
                    : "bg-[var(--beige)]/50 text-[var(--accent-purple-soft)]"
                )}
              >
                <User className="h-4 w-4" />
              </span>
              <span className="truncate text-sm font-medium">
                {user?.name || user?.email || "Perfil"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                event?.preventDefault();
                event?.stopPropagation();
                logout();
              }}
              className={cn(
                "canhoes-tap mt-1 flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-[var(--text-primary)] transition-colors",
                pathname === "/sair"
                  ? "bg-[rgba(255,100,100,0.18)]"
                  : "hover:bg-[rgba(255,100,100,0.12)]"
              )}
            >
              <span
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-full",
                  pathname === "/sair"
                    ? "bg-[var(--accent-red)] text-[var(--bg-void)]"
                    : "bg-[var(--beige)]/50 text-[var(--accent-red)]"
                )}
              >
                <LogOut className="h-4 w-4" />
              </span>
              <span className="truncate text-sm font-medium">Sair</span>
            </button>
          </div>
        )}
      </div>

      <div
        className={cn(
          "fixed inset-0 bg-[var(--bg-void)] opacity-0 transition-opacity duration-200",
          visible ? "opacity-50" : "opacity-0"
        )}
        aria-hidden={!visible}
      />
    </div>
  );
}
