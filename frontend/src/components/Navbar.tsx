import { Link, NavLink } from "react-router-dom"
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"

const navLink = "px-3 py-2 rounded-md text-sm font-medium"
const active = "bg-slate-200"
const inactive = "hover:bg-slate-100"

export default function Navbar() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link to="/dashboard" className="font-bold">
          Jardín Mares
        </Link>

        <NavigationMenu>
          <NavigationMenuList className="gap-2">
            <NavigationMenuItem>
              <NavLink to="/dashboard" className={({ isActive }) => `${navLink} ${isActive ? active : inactive}`}>
                Dashboard
              </NavLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavLink to="/calendar" className={({ isActive }) => `${navLink} ${isActive ? active : inactive}`}>
                Calendario
              </NavLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/login">Login</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
