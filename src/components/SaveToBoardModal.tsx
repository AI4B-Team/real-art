import { useState, useEffect } from "react";
import { useLayoutContext } from "@/components/LayoutContext";
import { X, Plus, Bookmark, Check, Search, Lock, Globe, Image, UserPlus, ChevronDown, Mail, Trash2, Users } from "lucide-react";
import {
  getCollections,
  addItemToCollection,
  createSavedCollection,
  type UnifiedCollection,
} from "@/lib/collectionStore";

type CollabRole = "viewer" | "editor" | "admin";

interface PendingInvite {
  email: string;
  role: CollabRole;
}

const ROLE_LABELS: Record<CollabRole, { label: string; desc: string }> = {
  viewer: { label: "Viewer",  desc: "Can view" },
  editor: { label: "Editor",  desc: "Can add & edit" },
  admin:  { label: "Admin",   desc: "Full access" },
};

interface Props {
  open: boolean;
  onClose: () => void;
  imageId?: string;
  imagePhoto?: string;
  imageTitle?: string;
}

function ModalBackdrop({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  const { sidebarCollapsed } = useLayoutContext();
  // Check if sidebar is visible (logged in state uses sidebar)
  const isLoggedIn = typeof window !== "undefined" && localStorage.getItem("ra_auth") === "1";
  const sidebarWidth = isLoggedIn ? (sidebarCollapsed ? 68 : 260) : 0;

  return (
    <div
      className="fixed top-0 right-0 bottom-0 z-[60] flex items-center justify-center bg-foreground/60 backdrop-blur-sm px-4"
      style={{ left: sidebarWidth }}
      onClick={onClose}
    >
      {children}
    </div>
  );
}

export default function SaveToBoardModal({
  open,
  onClose,
  imageId = "0",
  imagePhoto = "photo-1618005182384-a83a8bd57fbe",
  imageTitle = "Untitled",
}: Props) {
  const [collections, setCollections] = useState<UnifiedCollection[]>([]);
  const [search, setSearch] = useState("");
  const [savedTo, setSavedTo] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newVisibility, setNewVisibility] = useState<"public" | "private">("private");
  // Invite state
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<CollabRole>("editor");
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setCollections(getCollections());
      setSearch("");
      setSavedTo(null);
      setShowCreate(false);
      setNewName("");
      setShowInvite(false);
      setInviteEmail("");
      setInvites([]);
    }
  }, [open]);

  if (!open) return null;

  const filtered = collections.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const alreadySaved = (colId: string) =>
    collections.find(c => c.id === colId)?.items?.some(i => i.imageId === imageId) ?? false;

  const handleSave = (colId: string) => {
    addItemToCollection(colId, { imageId, photo: imagePhoto, title: imageTitle });
    setSavedTo(colId);
    setTimeout(() => { onClose(); setSavedTo(null); setSearch(""); }, 900);
  };

  const handleAddInvite = () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    if (invites.some(i => i.email === email)) return;
    setInvites(prev => [...prev, { email, role: inviteRole }]);
    setInviteEmail("");
  };

  const handleRemoveInvite = (email: string) =>
    setInvites(prev => prev.filter(i => i.email !== email));

  const handleCreate = () => {
    if (!newName.trim()) return;
    const col = createSavedCollection(newName.trim(), newVisibility);
    addItemToCollection(col.id, { imageId, photo: imagePhoto, title: imageTitle });
    setCollections(getCollections());
    setSavedTo(col.id);
    // In a real app, fire invite emails here via Supabase edge function
    setTimeout(() => { onClose(); setSavedTo(null); setSearch(""); setNewName(""); setShowCreate(false); setInvites([]); }, 900);
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div
        className="bg-background border border-foreground/[0.08] rounded-2xl w-full max-w-[400px] overflow-hidden shadow-2xl animate-drop-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-foreground/[0.06]">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-accent" />
            <h3 className="font-display text-[1.05rem] font-bold">Save to Collection</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-foreground/[0.06] transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Image preview strip */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-foreground/[0.06] bg-foreground/[0.02]">
          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-foreground/[0.06]">
            <img src={`https://images.unsplash.com/${imagePhoto}?w=80&h=80&fit=crop&q=70`} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <div className="text-[0.84rem] font-semibold truncate">{imageTitle}</div>
            <div className="text-[0.72rem] text-muted">Save to one of your collections</div>
          </div>
        </div>

        {/* Search */}
        <div className="px-5 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search collections…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-foreground/[0.04] border border-foreground/[0.06] text-[0.84rem] font-body outline-none focus:border-accent/40 transition-colors"
            />
          </div>
        </div>

        {/* Collection list */}
        <div className="px-5 py-2 max-h-[240px] overflow-y-auto">
          {filtered.length === 0 && !showCreate && (
            <p className="text-[0.82rem] text-muted text-center py-4">
              {search ? "No matching collections" : "No collections yet — create one below"}
            </p>
          )}
          {filtered.map(col => {
            const done = savedTo === col.id;
            const already = alreadySaved(col.id);
            const thumb = col.items?.[0]?.photo || col.thumbs?.[0];
            return (
              <button
                key={col.id}
                onClick={() => !already && !done && handleSave(col.id)}
                disabled={already || !!done}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-colors text-left group ${done ? "bg-green-50 dark:bg-green-950/20" : already ? "opacity-50 cursor-default" : "hover:bg-foreground/[0.04] cursor-pointer"}`}
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-foreground/[0.06]">
                  {thumb ? (
                    <img src={`https://images.unsplash.com/${thumb}?w=80&h=80&fit=crop&q=70`} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Bookmark className="w-4 h-4 text-muted" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[0.84rem] font-semibold truncate">{col.title}</div>
                  <div className="text-[0.72rem] text-muted flex items-center gap-1">
                    {col.visibility === "private" ?
                      <Lock className="w-2.5 h-2.5" /> :
                      <Globe className="w-2.5 h-2.5" />
                    }
                    {col.items?.length || 0} saved
                    {col.accessCode && <span className="ml-1 opacity-60">· {col.accessCode}</span>}
                  </div>
                </div>
                <Check className={`w-4 h-4 shrink-0 transition-all ${done || already ? "text-accent" : "text-muted opacity-0 group-hover:opacity-60"}`} />
              </button>
            );
          })}
        </div>

        {/* Create new collection */}
        <div className="px-5 pb-4 pt-2 border-t border-foreground/[0.06]">
          {!showCreate ? (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 w-full text-[0.84rem] font-semibold text-accent hover:text-accent/80 transition-colors py-1"
            >
              <Plus className="w-4 h-4" /> New Collection
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Name */}
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleCreate()}
                placeholder="Collection name…"
                autoFocus
                maxLength={60}
                className="w-full px-4 py-2.5 rounded-xl border border-foreground/[0.1] text-[0.84rem] font-body outline-none focus:border-accent/40 transition-colors bg-background"
              />

              {/* Visibility */}
              <div className="grid grid-cols-2 gap-2">
                {(["private", "public"] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setNewVisibility(v)}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[0.78rem] font-medium border transition-all ${
                      newVisibility === v
                        ? "bg-foreground text-primary-foreground border-foreground"
                        : "border-foreground/[0.12] text-muted hover:border-foreground/30 hover:text-foreground"
                    }`}
                  >
                    {v === "private" ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                    {v === "private" ? "Private" : "Public"}
                  </button>
                ))}
              </div>

              {/* Invite Collaborators toggle */}
              <button
                onClick={() => setShowInvite(v => !v)}
                className={`flex items-center gap-2 text-[0.78rem] font-semibold transition-colors py-0.5 ${showInvite ? "text-foreground" : "text-muted hover:text-foreground"}`}
              >
                <Users className="w-3.5 h-3.5" />
                Invite collaborators
                {invites.length > 0 && (
                  <span className="ml-auto bg-accent text-white text-[0.68rem] font-bold px-1.5 py-0.5 rounded-full leading-none">
                    {invites.length}
                  </span>
                )}
              </button>

              {/* Invite panel */}
              {showInvite && (
                <div className="rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] p-3 flex flex-col gap-2.5">
                  {/* Email + role row */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleAddInvite()}
                        placeholder="Email address…"
                        className="w-full pl-8 pr-3 py-2 rounded-lg border border-foreground/[0.1] text-[0.78rem] font-body outline-none focus:border-accent/40 transition-colors bg-background"
                      />
                    </div>

                    {/* Role picker */}
                    <div className="relative">
                      <button
                        onClick={() => setRoleDropdownOpen(v => !v)}
                        className="flex items-center gap-1 px-2.5 py-2 rounded-lg border border-foreground/[0.1] bg-background text-[0.75rem] font-medium text-foreground hover:border-foreground/30 transition-colors whitespace-nowrap"
                      >
                        {ROLE_LABELS[inviteRole].label}
                        <ChevronDown className="w-3 h-3 text-muted" />
                      </button>
                      {roleDropdownOpen && (
                        <div className="absolute right-0 top-full mt-1 bg-background border border-foreground/[0.1] rounded-xl shadow-lg z-10 w-36 overflow-hidden">
                          {(Object.entries(ROLE_LABELS) as [CollabRole, { label: string; desc: string }][]).map(([key, { label, desc }]) => (
                            <button
                              key={key}
                              onClick={() => { setInviteRole(key); setRoleDropdownOpen(false); }}
                              className={`flex items-center justify-between w-full px-3 py-2 text-left text-[0.78rem] transition-colors hover:bg-foreground/[0.04] ${inviteRole === key ? "text-accent font-semibold" : "text-foreground"}`}
                            >
                              <div>
                                <div className="font-medium">{label}</div>
                                <div className="text-[0.68rem] text-muted">{desc}</div>
                              </div>
                              {inviteRole === key && <Check className="w-3 h-3 text-accent shrink-0" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleAddInvite}
                      disabled={!inviteEmail.trim()}
                      className="px-3 py-2 rounded-lg bg-foreground text-primary-foreground text-[0.75rem] font-semibold hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    >
                      Add
                    </button>
                  </div>

                  {/* Pending invites list */}
                  {invites.length > 0 && (
                    <div className="flex flex-col gap-1">
                      {invites.map(inv => (
                        <div key={inv.email} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-background border border-foreground/[0.07]">
                          <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                            <UserPlus className="w-3 h-3 text-accent" />
                          </div>
                          <span className="flex-1 text-[0.75rem] font-medium truncate">{inv.email}</span>
                          <span className={`text-[0.66rem] font-semibold px-1.5 py-0.5 rounded-md ${
                            inv.role === "admin"  ? "bg-purple-100 text-purple-700" :
                            inv.role === "editor" ? "bg-blue-100 text-blue-700" :
                            "bg-foreground/[0.06] text-muted"
                          }`}>
                            {ROLE_LABELS[inv.role].label}
                          </span>
                          <button onClick={() => handleRemoveInvite(inv.email)} className="text-muted hover:text-destructive transition-colors ml-0.5">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-[0.68rem] text-muted leading-relaxed">
                    Invites are sent after the collection is created.
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleCreate}
                  className="px-4 py-2.5 rounded-xl bg-foreground text-primary-foreground text-[0.82rem] font-semibold hover:bg-accent transition-colors"
                >
                  {invites.length > 0 ? "Create & Invite" : "Create & Save"}
                </button>
                <button
                  onClick={() => { setShowCreate(false); setNewName(""); setInvites([]); setShowInvite(false); }}
                  className="px-4 py-2.5 rounded-xl border border-foreground/[0.12] text-[0.84rem] hover:border-foreground/30 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModalBackdrop>
  );
}
