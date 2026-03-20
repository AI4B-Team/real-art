import { UserPlus } from "lucide-react";

export default function MembersTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Members</h2>
        <p className="text-sm text-muted mt-1">Manage your team members and their access levels.</p>
      </div>

      <hr className="border-foreground/[0.06]" />

      <div className="border border-foreground/[0.08] rounded-xl overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between">
          <h3 className="font-semibold">Team Members</h3>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-foreground/[0.1] text-sm font-medium hover:bg-foreground/[0.03] transition-colors">
            <UserPlus className="w-4 h-4" /> Invite Members
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-foreground/[0.06]">
                <th className="text-left px-6 py-3 text-muted font-medium">Name</th>
                <th className="text-left px-6 py-3 text-muted font-medium">Email address</th>
                <th className="text-left px-6 py-3 text-muted font-medium">Role</th>
                <th className="text-left px-6 py-3 text-muted font-medium">Status</th>
                <th className="text-left px-6 py-3 text-muted font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-foreground/[0.06]">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center text-accent text-sm font-bold">U</div>
                    <span>You</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-muted">—</td>
                <td className="px-6 py-4">
                  <span className="bg-accent/10 text-accent text-xs font-medium px-2.5 py-1 rounded-full">Admin</span>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-green-500/10 text-green-600 text-xs font-medium px-2.5 py-1 rounded-full">Active</span>
                </td>
                <td className="px-6 py-4 text-muted">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
