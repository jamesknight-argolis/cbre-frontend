"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronsRight, type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

type SidebarContextProps = {
  isCollapsed: boolean;
  isInside: boolean;
};

const SidebarContext = React.createContext<SidebarContextProps | undefined>(
  undefined
);

const useSidebar = () => {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

const sidebarVariants = cva(
  "flex h-full flex-col data-[collapsed=true]:w-14",
  {
    variants: {
      variant: {
        default: "w-64 border-r bg-background",
        minimal: "w-14",
      },
      collapsible: {
        true: "transition-all duration-200 ease-in-out",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      collapsible: false,
    },
  }
);

interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {
  defaultCollapsed?: boolean;
}

function SidebarProvider({
  children,
  defaultCollapsed,
  collapsible,
}: {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
  collapsible?: boolean;
}) {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = React.useState(
    (collapsible && defaultCollapsed) || false
  );

  const collapse = () => {
    setIsCollapsed(true);
  };
  const expand = () => {
    setIsCollapsed(false);
  };
  const toggle = () => {
    setIsCollapsed((prev) => !prev);
  };

  React.useEffect(() => {
    if (isMobile) {
      collapse();
    } else {
      expand();
    }
  }, [isMobile]);

  return (
    <TooltipProvider>
      <SidebarContext.Provider value={{ isCollapsed, isInside: true }}>
        {children}
      </SidebarContext.Provider>
    </TooltipProvider>
  );
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, variant, collapsible, defaultCollapsed, ...props }, ref) => {
    const { isCollapsed } = useSidebar();
    return (
      <div
        ref={ref}
        className={cn(sidebarVariants({ variant, collapsible }), className)}
        data-collapsed={isCollapsed}
        {...props}
      />
    );
  }
);
Sidebar.displayName = "Sidebar";

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("p-2", className)} {...props} />;
});
SidebarHeader.displayName = "SidebarHeader";

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex h-full flex-col", className)}
    {...props}
  />
));
SidebarContent.displayName = "SidebarContent";

const SidebarMenu = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("flex-1", className)} {...props} />;
});
SidebarMenu.displayName = "SidebarMenu";

const SidebarMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("overflow-hidden text-ellipsis", className)}
      {...props}
    />
  );
});
SidebarMenuItem.displayName = "SidebarMenuItem";

const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isCollapsed } = useSidebar();
  return (
    <div
      ref={ref}
      className={cn(
        "px-3",
        isCollapsed ? "hidden" : "group-hover:flex",
        className
      )}
      {...props}
    />
  );
});
SidebarInset.displayName = "SidebarInset";

interface SidebarMenuButtonProps extends ButtonProps {
  isActive?: boolean;
  tooltip?: {
    children: React.ReactNode;
  };
}

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(({ className, tooltip, isActive, children, ...props }, ref) => {
  const { isCollapsed } = useSidebar();
  const menuButton = (
    <Button
      ref={ref}
      variant={isActive ? "secondary" : "ghost"}
      className={cn(
        "h-10 w-full justify-start",
        isCollapsed ? "justify-center" : "",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );

  if (isCollapsed && tooltip) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{menuButton}</TooltipTrigger>
        <TooltipContent side="right">{tooltip.children}</TooltipContent>
      </Tooltip>
    );
  }

  return menuButton;
});
SidebarMenuButton.displayName = "SidebarMenuButton";

const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement>
>((props, ref) => {
  const { isCollapsed } = useSidebar();
  return (
    <SidebarMenuButton ref={ref} {...props} aria-label="Toggle Sidebar">
      <ChevronsRight
        className={cn(
          "transition-transform duration-200",
          isCollapsed ? "rotate-0" : "rotate-180"
        )}
      />
    </SidebarMenuButton>
  );
});
SidebarTrigger.displayName = "SidebarTrigger";

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
};
