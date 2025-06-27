import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";

interface MobileNavProps {
  currentPath: string;
}

export default function MobileNav({ currentPath }: MobileNavProps) {
  const [, setLocation] = useLocation();

  const navItems = [
    { 
      path: "/", 
      label: "Dashboard", 
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      )
    },
    { 
      path: "/reviews", 
      label: "Reviews", 
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ),
      count: 3
    },
    { 
      path: "/integrations/gmb", 
      label: "Google My Business", 
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h2v-2h2v-2h2v8z"/>
        </svg>
      )
    },
    { 
      path: "/templates", 
      label: "Templates", 
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
        </svg>
      )
    },
    { 
      path: "/profile", 
      label: "Profile", 
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      )
    },
  ];

  return (
    <nav className="mobile-nav">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => setLocation(item.path)}
            className={`flex flex-col items-center space-y-1 py-2 px-3 relative touch-target ${
              currentPath === item.path
                ? "text-primary"
                : "text-slate-600"
            }`}
          >
            {item.icon}
            <span className="text-xs font-medium">{item.label}</span>
            {item.count && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {item.count}
              </Badge>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
