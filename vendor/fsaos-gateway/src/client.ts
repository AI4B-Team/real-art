/**
 * @fsaos/gateway — Gateway Call (RPC Dispatcher)
 *
 * The single function that all VFS operations go through.
 *
 * Protocol:
 *   POST https://{gatewayUrl}/d/{hostname}
 *   Body: { method: string, params: Record<string, unknown> }
 *
 * The gateway resolves the hostname to a domain scope, authenticates via
 * the Bearer token, and dispatches the method to the appropriate handler.
 *
 * If the domain scope is already known (from initSession), it is injected
 * as `domain_scope_id` into the params automatically.
 *
 * SCOPE GATING:
 * gatewayCall awaits `scopeReady` before sending any request that doesn't
 * already have an explicit `_scope_path`. This prevents race conditions where
 * hooks fire before account selection completes, sending relative paths that
 * the kernel can't resolve.
 *
 * Methods that are inherently scope-independent (list-memberships, auth-related)
 * bypass the scope gate because they're needed BEFORE scope is established.
 */

import { GATEWAY_URL } from './config';
import { EnforcementDeniedError } from './enforcement';
import { getAccessToken, getHostname, getSessionEntry, getScope, awaitScopeReady } from './session';
import type { GatewayParams, GatewayResponse, EnforcementPayload } from './types';

/**
 * Methods that can execute without scope being set.
 * These are bootstrap/auth methods needed before account selection.
 */
const SCOPE_INDEPENDENT_METHODS = new Set([
  'list-memberships',
  'init',
]);

/**
 * Call a gateway method.
 *
 * @param method  The RPC method name (e.g. "read", "list", "create", "update",
 *                "delete", "tree", "search", "edges", "move", "link",
 *                "types-list", "member-focus")
 * @param params  Method-specific parameters
 * @returns       The raw gateway response
 *
 * @throws {EnforcementDeniedError} When denied by rules, access, or entitlement
 * @throws {Error}                  On HTTP errors or gateway-level failures
 */
export async function gatewayCall(
  method: string,
  params: GatewayParams = {},
): Promise<GatewayResponse> {
  const hostname = getHostname();
  const url = `${GATEWAY_URL}/d/${hostname}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = await getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Gate scope-dependent calls until scope is established.
  // Scope-independent methods (list-memberships) bypass this gate.
  // Calls that already have an explicit _scope_path also bypass.
  if (!SCOPE_INDEPENDENT_METHODS.has(method) && !params._scope_path) {
    await awaitScopeReady();
  }

  // Auto-inject domain_scope_id if the session is initialized and the caller
  // didn't explicitly provide one.
  const enrichedParams: GatewayParams = { ...params };
  const session = getSessionEntry();
  if (!enrichedParams.domain_scope_id && session?.scope_id) {
    enrichedParams.domain_scope_id = session.scope_id;
  }

  // Auto-inject _scope_path for scoped auth enforcement.
  // When set (via setScope after account selection), kernel_auth validates
  // the user's membership at this scope instead of falling back to /root.
  const scopePath = getScope();
  if (!enrichedParams._scope_path && scopePath) {
    enrichedParams._scope_path = scopePath;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ method, params: enrichedParams }),
  });

  if (!response.ok) {
    throw new Error(`Gateway HTTP error: ${response.status} ${response.statusText}`);
  }

  const json: GatewayResponse = await response.json();

  if (json.success === false) {
    const err = (json as any).error || '';
    const deniedBy = (json as any).denied_by || (json as any).error_type || '';

    if (
      deniedBy === 'rule' ||
      deniedBy === 'access' ||
      deniedBy === 'entitlement' ||
      err === 'RULE_DENIED' ||
      err === 'ACCESS_DENIED' ||
      err === 'PERMISSION_DENIED' ||
      err === 'ENTITLEMENT_REQUIRED'
    ) {
      throw new EnforcementDeniedError(json as unknown as EnforcementPayload);
    }

    throw new Error(
      (json as any).message || (json as any).error || `Gateway call ${method} failed`,
    );
  }

  return json;
}
