/**
 * FSAOS Gateway SDK Demo Page
 *
 * Proof-of-concept showing the FSAOS SDK working end-to-end inside this app:
 *   - Auth state via useAuth()
 *   - Reading items via useList(path)
 *   - Creating items via useCreate()
 *
 * Mounted under its own QueryClientProvider that uses the SDK's queryClient,
 * because FSAOS internally invalidates against `queryClient` from the SDK
 * — not the app's existing react-query client.
 *
 * Route: /fsaos-demo
 */

import { useEffect, useState } from "react";
import {
  QueryClientProvider,
  queryClient as fsaosQueryClient,
  useAuth,
  useList,
  useCreate,
  initSession,
  setScope,
  isScopeReady,
} from "@fsaos/gateway";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const DEMO_PATH = "/lovable-demo";

function FsaosDemoInner() {
  const { user, loading, signIn, signOut } = useAuth();
  const list = useList(DEMO_PATH);
  const create = useCreate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [scopeError, setScopeError] = useState<string | null>(null);

  // After sign-in: resolve domain → scope, then activate scope so queries fire.
  useEffect(() => {
    if (!user || isScopeReady()) return;
    let cancelled = false;
    (async () => {
      try {
        const session = await initSession();
        if (!cancelled) setScope(session.scope_path);
      } catch (e: any) {
        if (!cancelled) setScopeError(e?.message ?? String(e));
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  if (loading) {
    return (
      <div className="p-8 text-muted-foreground font-['DM_Sans']">
        Loading FSAOS Session…
      </div>
    );
  }

  // ── Not signed in: show inline FSAOS-side sign-in form ─────────────────
  if (!user) {
    return (
      <div className="max-w-md mx-auto p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-['Playfair_Display'] mb-2">
            FSAOS SDK Demo
          </h1>
          <p className="text-sm text-muted-foreground font-['DM_Sans']">
            Sign In Against The FSAOS Backend To See VFS Items.
          </p>
        </div>
        <Card className="p-6 space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            className="w-full rounded-lg bg-[#E8472A] hover:bg-[#E8472A]/90"
            onClick={() => signIn({ email, password })}
          >
            Sign In
          </Button>
          <Button
            variant="outline"
            className="w-full rounded-lg"
            onClick={() => signIn({ provider: "google" })}
          >
            Continue With Google
          </Button>
        </Card>
      </div>
    );
  }

  // ── Signed in: show items + create form ────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-['Playfair_Display']">FSAOS SDK Demo</h1>
          <p className="text-sm text-muted-foreground font-['DM_Sans']">
            Signed In As <span className="text-foreground">{user.email}</span>
          </p>
        </div>
        <Button variant="outline" className="rounded-lg" onClick={() => signOut()}>
          Sign Out
        </Button>
      </div>

      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-['Playfair_Display']">Create An Item</h2>
        <p className="text-xs text-muted-foreground font-['DM_Sans']">
          Path: <code>{DEMO_PATH}</code>
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="Item Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button
            className="rounded-lg bg-[#E8472A] hover:bg-[#E8472A]/90"
            disabled={!name || create.isPending}
            onClick={async () => {
              await create.mutateAsync({
                parent_path: DEMO_PATH,
                name,
                item_type: "note",
                data: { created_via: "lovable-demo" },
              });
              setName("");
            }}
          >
            {create.isPending ? "Creating…" : "Create"}
          </Button>
        </div>
        {create.error && (
          <p className="text-sm text-destructive font-['DM_Sans']">
            {(create.error as Error).message}
          </p>
        )}
      </Card>

      <Card className="p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-['Playfair_Display']">Items</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => list.refetch()}
            className="rounded-lg"
          >
            Refresh
          </Button>
        </div>
        {scopeError && (
          <p className="text-sm text-destructive font-['DM_Sans']">
            Scope Init Failed: {scopeError}
          </p>
        )}
        {list.isLoading && !scopeError && (
          <p className="text-sm text-muted-foreground font-['DM_Sans']">
            Loading…
          </p>
        )}
        {list.error && (
          <div className="text-sm text-destructive font-['DM_Sans'] space-y-2">
            <p>{(list.error as Error).message}</p>
            <p className="text-xs text-muted-foreground">
              If the path doesn't exist yet at this scope, create one above.
            </p>
          </div>
        )}
        {list.data && list.data.length === 0 && !list.isLoading && (
          <p className="text-sm text-muted-foreground font-['DM_Sans']">
            No Items Yet. Create One Above.
          </p>
        )}
        <ul className="divide-y">
          {list.data?.map((item: any) => (
            <li
              key={item.id}
              className="py-2 flex items-center justify-between text-sm font-['DM_Sans']"
            >
              <span>{item.name}</span>
              <span className="text-xs text-muted-foreground">
                {item.item_type}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

export default function FsaosDemoPage() {
  return (
    <QueryClientProvider client={fsaosQueryClient}>
      <FsaosDemoInner />
    </QueryClientProvider>
  );
}
