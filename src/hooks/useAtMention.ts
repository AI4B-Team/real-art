import { useState, useCallback, useRef, useEffect } from "react";

export interface MentionState {
  active: boolean;
  query: string;
  anchorRect: { top: number; left: number } | null;
  triggerNode: Text | null;
  triggerOffset: number;
}

const INITIAL: MentionState = { active: false, query: "", anchorRect: null, triggerNode: null, triggerOffset: 0 };

/**
 * Detects "@" typed in a contentEditable and tracks the query text after it.
 * Returns mention state + handlers to wire into the contentEditable.
 */
export function useAtMention(editableRef: React.RefObject<HTMLElement | null>) {
  const [mention, setMention] = useState<MentionState>(INITIAL);
  const mentionRef = useRef(mention);
  mentionRef.current = mention;

  const dismiss = useCallback(() => setMention(INITIAL), []);

  const checkForMention = useCallback(() => {
    const el = editableRef.current;
    if (!el) return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) { dismiss(); return; }

    const range = sel.getRangeAt(0);
    if (!range.collapsed) { dismiss(); return; }

    const node = range.startContainer;
    if (node.nodeType !== Node.TEXT_NODE || !el.contains(node)) { dismiss(); return; }

    const text = node.textContent || "";
    const offset = range.startOffset;

    // Walk backwards from cursor to find "@"
    let atIdx = -1;
    for (let i = offset - 1; i >= 0; i--) {
      const ch = text[i];
      if (ch === "@") { atIdx = i; break; }
      if (ch === " " || ch === "\n" || ch === "\u00A0") break;
    }

    if (atIdx === -1) { dismiss(); return; }

    const query = text.slice(atIdx + 1, offset);

    // Get cursor position for dropdown placement
    const tempRange = document.createRange();
    tempRange.setStart(node, atIdx);
    tempRange.setEnd(node, atIdx);
    const rect = tempRange.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    setMention({
      active: true,
      query,
      anchorRect: { top: rect.bottom - elRect.top, left: rect.left - elRect.left },
      triggerNode: node as Text,
      triggerOffset: atIdx,
    });
  }, [editableRef, dismiss]);

  /** Remove "@query" text from the DOM before inserting the chip */
  const consumeMention = useCallback(() => {
    const m = mentionRef.current;
    if (!m.active || !m.triggerNode) return null;

    const text = m.triggerNode.textContent || "";
    const sel = window.getSelection();
    const cursorOffset = sel?.rangeCount ? sel.getRangeAt(0).startOffset : m.triggerOffset + 1 + m.query.length;

    // Delete from @ to cursor
    const before = text.slice(0, m.triggerOffset);
    const after = text.slice(cursorOffset);
    m.triggerNode.textContent = before + after;

    // Set cursor at the splice point
    const range = document.createRange();
    range.setStart(m.triggerNode, before.length);
    range.collapse(true);

    dismiss();
    return range;
  }, [dismiss]);

  // Dismiss on escape
  useEffect(() => {
    if (!mention.active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mention.active, dismiss]);

  return { mention, checkForMention, consumeMention, dismissMention: dismiss };
}
