import { Badge } from "@/components/ui/badge";

export function Navbar() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-slate-800">
          Operational Dashboard
        </h2>
        <Badge
          variant="outline"
          className="bg-emerald-50 text-emerald-700 border-emerald-200"
        >
          System Active
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-900">Admin Gym</p>
          <p className="text-xs text-slate-500">Full-Stack Solo</p>
        </div>
        <div className="h-9 w-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm">
          AG
        </div>
      </div>
    </header>
  );
}
