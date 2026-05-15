/**
 * @fsaos/gateway — Enforcement Error
 *
 * Thrown when a gateway call is denied by the enforcement layer
 * (rules, access control, or entitlement checks).
 */

import type { EnforcementPayload } from './types';

export class EnforcementDeniedError extends Error {
  public readonly name = 'EnforcementDeniedError';
  public readonly deniedBy: string;
  public readonly ruleKey?: string;
  public readonly displayName?: string;

  constructor(payload: EnforcementPayload) {
    const message = payload.message || EnforcementDeniedError.fallbackMessage(payload);
    super(message);
    this.deniedBy = payload.denied_by || payload.error_type || payload.error || 'unknown';
    const enforcement = payload.enforcement;
    this.ruleKey = enforcement?.rule_key ?? undefined;
    this.displayName = enforcement?.display_name ?? undefined;
  }

  static fallbackMessage(payload: EnforcementPayload): string {
    const err = payload.error || '';
    const deniedBy = payload.denied_by || '';

    if (deniedBy === 'rule' || err === 'RULE_DENIED') {
      return 'This feature is not enabled for this workspace.';
    }
    if (deniedBy === 'entitlement' || err === 'ENTITLEMENT_REQUIRED') {
      return 'This feature requires a plan upgrade.';
    }
    if (deniedBy === 'access' || err === 'ACCESS_DENIED' || err === 'PERMISSION_DENIED') {
      return "You don't have permission to do this.";
    }
    return 'This action is not allowed.';
  }

  get isRuleDenial(): boolean {
    return this.deniedBy === 'rule' || this.deniedBy === 'RULE_DENIED';
  }

  get isAccessDenial(): boolean {
    return this.deniedBy === 'access' || this.deniedBy === 'ACCESS_DENIED';
  }

  get isEntitlementDenial(): boolean {
    return this.deniedBy === 'entitlement' || this.deniedBy === 'ENTITLEMENT_REQUIRED';
  }
}
