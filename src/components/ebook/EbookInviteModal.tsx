import { useState } from "react";
import { UserPlus, X, Check, Mail, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { WORKSPACE_MEMBERS, type WorkspaceMember } from "@/lib/workspaceMembers";

const ROLE_OPTIONS = ["Editor", "Viewer", "Comment"] as const;
type InviteRole = typeof ROLE_OPTIONS[number];

interface Invitee {
  id: string;
  name: string;
  email: string;
  role: InviteRole;
  isWorkspaceMember: boolean;
  initials: string;
  color: string;
}

interface EbookInviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EbookInviteModal({ open, onOpenChange }: EbookInviteModalProps) {
  const [emailInput, setEmailInput] = useState("");
  const [inviteRole, setInviteRole] = useState<InviteRole>("Editor");
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [invitedPeople, setInvitedPeople] = useState<Invitee[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const existingIds = new Set(invitedPeople.map(p => p.id));
  const filteredMembers = WORKSPACE_MEMBERS.filter(
    m => m.id !== "you" && !existingIds.has(m.id) &&
      (m.name.toLowerCase().includes(emailInput.toLowerCase()) ||
       m.email.toLowerCase().includes(emailInput.toLowerCase()))
  );

  const addWorkspaceMember = (member: WorkspaceMember) => {
    setInvitedPeople(prev => [...prev, {
      id: member.id, name: member.name, email: member.email,
      role: inviteRole, isWorkspaceMember: true,
      initials: member.initials, color: member.color,
    }]);
    setEmailInput("");
    setShowSuggestions(false);
  };

  const addExternalEmail = () => {
    const email = emailInput.trim();
    if (!email || !email.includes("@")) return;
    if (invitedPeople.some(p => p.email === email)) {
      toast({ title: "Already invited", variant: "destructive" });
      return;
    }
    const initials = email.substring(0, 2).toUpperCase();
    setInvitedPeople(prev => [...prev, {
      id: `ext-${Date.now()}`, name: email.split("@")[0], email,
      role: inviteRole, isWorkspaceMember: false,
      initials, color: "hsl(var(--muted-foreground))",
    }]);
    setEmailInput("");
    setShowSuggestions(false);
  };

  const removeInvitee = (id: string) => {
    setInvitedPeople(prev => prev.filter(p => p.id !== id));
  };

  const updateRole = (id: string, role: InviteRole) => {
    setInvitedPeople(prev => prev.map(p => p.id === id ? { ...p, role } : p));
  };

  const handleSendInvites = () => {
    if (invitedPeople.length === 0) {
      toast({ title: "Add people to invite first", variant: "destructive" });
      return;
    }
    toast({
      title: `Invitations sent!`,
      description: `${invitedPeople.length} ${invitedPeople.length === 1 ? "person" : "people"} invited to collaborate`,
    });
    setInvitedPeople([]);
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredMembers.length > 0) {
        addWorkspaceMember(filteredMembers[0]);
      } else {
        addExternalEmail();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 rounded-2xl overflow-hidden">
        <DialogHeader className="p-5 pb-0">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <UserPlus className="w-5 h-5" /> Invite Collaborators
          </DialogTitle>
        </DialogHeader>

        <div className="p-5 space-y-4">
          {/* Email input + role picker */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] focus-within:border-accent transition-colors">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  value={emailInput}
                  onChange={e => { setEmailInput(e.target.value); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={handleKeyDown}
                  placeholder="Name or email address..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>

              {/* Suggestions dropdown */}
              {showSuggestions && emailInput && (filteredMembers.length > 0 || emailInput.includes("@")) && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-background border border-foreground/[0.1] rounded-xl shadow-lg z-50 py-1 max-h-48 overflow-y-auto">
                  {filteredMembers.map(m => (
                    <button key={m.id} onClick={() => addWorkspaceMember(m)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-foreground/[0.04] transition-colors text-left">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                        style={{ backgroundColor: m.color }}>{m.initials}</div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{m.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{m.email} · Workspace member</p>
                      </div>
                    </button>
                  ))}
                  {emailInput.includes("@") && !filteredMembers.some(m => m.email === emailInput) && (
                    <button onClick={addExternalEmail}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-foreground/[0.04] transition-colors text-left border-t border-foreground/[0.05]">
                      <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                        <Mail className="w-3.5 h-3.5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Invite {emailInput}</p>
                        <p className="text-[11px] text-muted-foreground">Send email invitation</p>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Role selector */}
            <div className="relative">
              <button onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] text-sm font-medium hover:border-foreground/[0.15] transition-colors whitespace-nowrap">
                {inviteRole} <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {roleDropdownOpen && (
                <div className="absolute right-0 bottom-full mb-1 bg-background border border-foreground/[0.1] rounded-lg shadow-lg z-[999] py-1 min-w-[130px]">
                  {ROLE_OPTIONS.map(r => (
                    <button key={r} onClick={() => { setInviteRole(r); setRoleDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${inviteRole === r ? "bg-accent/10 text-accent font-medium" : "hover:bg-foreground/[0.04]"}`}>
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Invited people list */}
          {invitedPeople.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground font-medium">{invitedPeople.length} {invitedPeople.length === 1 ? "person" : "people"} to invite</p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {invitedPeople.map(person => (
                  <div key={person.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-foreground/[0.02] group">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                      style={{ backgroundColor: person.color }}>{person.initials}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{person.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {person.email}{!person.isWorkspaceMember && " · External"}
                      </p>
                    </div>
                    <select value={person.role}
                      onChange={e => updateRole(person.id, e.target.value as InviteRole)}
                      className="text-xs bg-transparent border border-foreground/[0.08] rounded-md px-1.5 py-1 outline-none">
                      {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <button onClick={() => removeInvitee(person.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-foreground/[0.06] rounded">
                      <X className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Send button */}
          <button onClick={handleSendInvites}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
              invitedPeople.length > 0
                ? "bg-accent text-white hover:bg-accent/90"
                : "bg-foreground/[0.06] text-muted-foreground cursor-not-allowed"
            }`}>
            <Check className="w-4 h-4" />
            Send {invitedPeople.length > 0 ? `${invitedPeople.length} ` : ""}Invite{invitedPeople.length !== 1 ? "s" : ""}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
