export interface WorkspaceMember {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: "Admin" | "Editor" | "Viewer";
  status: "Active" | "Invited" | "Inactive";
  color: string;
}

export const WORKSPACE_MEMBERS: WorkspaceMember[] = [
  { id: "you", name: "You", initials: "U", email: "—", role: "Admin", status: "Active", color: "hsl(var(--accent))" },
  { id: "dolmar", name: "Dolmar Cross", initials: "DC", email: "dolmar@realart.io", role: "Editor", status: "Active", color: "hsl(220, 70%, 50%)" },
  { id: "javier", name: "Javier Pons", initials: "JP", email: "javier@realart.io", role: "Editor", status: "Active", color: "hsl(160, 60%, 45%)" },
  { id: "jaypee", name: "Jaypee Vestidas", initials: "JV", email: "jaypee@realart.io", role: "Editor", status: "Active", color: "hsl(280, 60%, 50%)" },
  { id: "digital", name: "Digital Babes", initials: "DB", email: "team@digitalbabes.io", role: "Viewer", status: "Active", color: "hsl(330, 70%, 55%)" },
];
