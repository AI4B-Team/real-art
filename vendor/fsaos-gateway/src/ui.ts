/**
 * @fsaos/ui — UI Primitives
 *
 * Lightweight layout and display components for edge-served FSAOS components.
 * These render real HTML/CSS using CSS custom properties from the scope's theme.
 *
 * Built as a separate IIFE bundle → window.__FSAOS_UI__
 * Components: Page, Stack, Grid, Sidebar, Card, Badge, Spinner, Button,
 *             Empty, DataView, Table, Form, Detail, Router, Link, Tabs,
 *             Breadcrumbs, Image, Video, FilePreview
 */

import { createElement } from 'react';

// ── Helpers ────────────────────────────────────────────────────────────────

function getEdgeBaseUrl(): string {
  const config = (typeof window !== 'undefined' && (window as any).__FSAOS_CONFIG__) || {};
  return config.edgeBaseUrl || '';
}

// ── Layout Components ──────────────────────────────────────────────────────

export function Page(props: { className?: string; children?: any }) {
  return createElement('div', {
    style: { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
    className: props.className || '',
  }, props.children);
}

export function Stack(props: {
  direction?: 'vertical' | 'horizontal';
  gap?: string;
  padding?: string;
  align?: string;
  justify?: string;
  flex?: string;
  className?: string;
  children?: any;
}) {
  const dir = props.direction || 'vertical';
  return createElement('div', {
    style: {
      display: 'flex',
      flexDirection: dir === 'horizontal' ? 'row' : 'column',
      gap: props.gap || '0.5rem',
      padding: props.padding || '0',
      alignItems: props.align || 'stretch',
      justifyContent: props.justify || 'flex-start',
      flex: props.flex || 'initial',
    },
    className: props.className || '',
  }, props.children);
}

export function Grid(props: {
  columns?: number;
  gap?: string;
  padding?: string;
  className?: string;
  children?: any;
}) {
  return createElement('div', {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(' + (props.columns || 3) + ', 1fr)',
      gap: props.gap || '1rem',
      padding: props.padding || '0',
    },
    className: props.className || '',
  }, props.children);
}

export function Sidebar(props: { className?: string; children?: any }) {
  return createElement('div', {
    style: { display: 'flex', flexDirection: 'row', minHeight: '100vh' },
    className: props.className || '',
  }, props.children);
}

// ── Display Components ─────────────────────────────────────────────────────

export function Card(props: {
  padding?: string;
  className?: string;
  onClick?: () => void;
  children?: any;
}) {
  return createElement('div', {
    style: {
      border: '1px solid var(--color-border, #e5e7eb)',
      borderRadius: 'var(--border-radius, 0.5rem)',
      padding: props.padding || '1rem',
      background: 'var(--color-surface, #fff)',
    },
    className: props.className || '',
    onClick: props.onClick,
  }, props.children);
}

export function Badge(props: {
  color?: string;
  textColor?: string;
  label?: string;
  className?: string;
  children?: any;
}) {
  return createElement('span', {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.125rem 0.5rem',
      fontSize: '0.75rem',
      fontWeight: '500',
      borderRadius: '9999px',
      background: props.color || '#e5e7eb',
      color: props.textColor || '#374151',
    },
    className: props.className || '',
  }, props.children || props.label);
}

export function Spinner(props: { size?: string }) {
  const size = props.size || '1.5rem';
  return createElement('div', {
    style: {
      width: size,
      height: size,
      border: '2px solid #e5e7eb',
      borderTopColor: 'var(--color-primary, #3b82f6)',
      borderRadius: '50%',
      animation: 'fsaos-spin 0.6s linear infinite',
    },
  });
}

export function Button(props: {
  variant?: 'default' | 'outline' | 'ghost';
  disabled?: boolean;
  label?: string;
  className?: string;
  onClick?: () => void;
  children?: any;
}) {
  return createElement('button', {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0.5rem 1rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      borderRadius: 'var(--border-radius, 0.375rem)',
      border: props.variant === 'outline' ? '1px solid var(--color-border, #d1d5db)' : 'none',
      background: props.variant === 'outline' || props.variant === 'ghost'
        ? 'transparent'
        : 'var(--color-primary, #3b82f6)',
      color: props.variant === 'outline' || props.variant === 'ghost'
        ? 'var(--color-text, #1a1a1a)'
        : '#fff',
      cursor: props.disabled ? 'not-allowed' : 'pointer',
      opacity: props.disabled ? '0.5' : '1',
      gap: '0.5rem',
    },
    className: props.className || '',
    onClick: props.onClick,
    disabled: props.disabled,
  }, props.children || props.label);
}

export function Empty(props: {
  icon?: string;
  title?: string;
  message?: string;
  description?: string;
  className?: string;
  children?: any;
}) {
  return createElement('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem',
      color: 'var(--color-text-secondary, #6b7280)',
      textAlign: 'center',
    },
  },
    props.icon
      ? createElement('div', { style: { fontSize: '2rem', marginBottom: '0.5rem' } }, props.icon)
      : null,
    createElement('div', { style: { fontWeight: 500, marginBottom: '0.25rem' } },
      props.title || props.message || props.children || 'No items',
    ),
    props.description
      ? createElement('div', { style: { fontSize: '0.875rem', opacity: 0.7 } }, props.description)
      : null,
  );
}

// ── Passthrough Components ─────────────────────────────────────────────────
// These render basic HTML elements. Components can style them via className.

export function DataView(props: { className?: string; children?: any }) {
  return createElement('div', { className: props.className || '' }, props.children);
}

export function Table(props: { className?: string; children?: any }) {
  return createElement('table', { className: props.className || '' }, props.children);
}

export function Form(props: { className?: string; onSubmit?: (e: any) => void; children?: any }) {
  return createElement('form', { className: props.className || '', onSubmit: props.onSubmit }, props.children);
}

export function Detail(props: { className?: string; children?: any }) {
  return createElement('div', { className: props.className || '' }, props.children);
}

export function Router(props: { children?: any }) {
  return createElement('div', null, props.children);
}

export function Link(props: {
  href?: string;
  to?: string;
  className?: string;
  onClick?: (e: any) => void;
  children?: any;
}) {
  return createElement('a', {
    href: props.href || props.to,
    className: props.className || '',
    onClick: props.onClick,
  }, props.children);
}

export function Tabs(props: { className?: string; children?: any }) {
  return createElement('div', { className: props.className || '' }, props.children);
}

export function Breadcrumbs(props: { className?: string; children?: any }) {
  return createElement('nav', { className: props.className || '' }, props.children);
}

// ── Media Components ───────────────────────────────────────────────────────

export function Image(props: {
  src?: string;
  path?: string;
  alt?: string;
  className?: string;
  style?: any;
}) {
  return createElement('img', {
    src: props.src || (props.path ? getEdgeBaseUrl() + props.path : ''),
    alt: props.alt || '',
    className: props.className || '',
    style: props.style,
  });
}

export function Video(props: {
  src?: string;
  path?: string;
  className?: string;
}) {
  return createElement('video', {
    src: props.src || (props.path ? getEdgeBaseUrl() + props.path : ''),
    controls: true,
    className: props.className || '',
  });
}

export function FilePreview(props: { className?: string; children?: any }) {
  return createElement('div', { className: props.className || '' }, props.children || 'File preview');
}
