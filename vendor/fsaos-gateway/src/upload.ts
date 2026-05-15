/**
 * @fsaos/gateway — File Upload
 *
 * Two exports:
 *   - uploadFile()    — imperative, returns a Promise. Use from Fractals, scripts,
 *                       non-React contexts, or anywhere you just need the result.
 *   - useFileUpload() — React hook wrapping uploadFile() with reactive state
 *                       (progress tracking, retry, cancel, uploads list).
 *
 * Both orchestrate the same three-step dance:
 *   1. gatewayCall('create', { file_source }) → VFS item + storage instruction
 *   2. PUT binary → storage worker (direct upload, no gateway proxy)
 *   3. POST /storage/upload-complete → gateway verifies + commits file_ref
 *
 * The consumer never sees storage_instruction, upload_token, or the
 * upload-complete endpoint. They call upload(file, opts) and get a result.
 */

import { useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { gatewayCall } from './client';
import { getAccessToken } from './session';
import { GATEWAY_URL } from './config';
import { vfsKeys } from './vfs-keys';

// ── Types ────────────────────────────────────────────────────────────────────

export interface FileRef {
  storage_key: string;
  provider: string;
  content_type: string;
  size_bytes: number;
  version: number;
  etag?: string;
}

export interface UploadOptions {
  /** VFS path where the file item will be created (required). */
  parentPath: string;
  /** Override the file name (defaults to File.name). */
  name?: string;
  /** Override item_type (defaults to 'file'). */
  itemType?: string;
  /** Additional type_data fields to merge onto the created item. */
  typeData?: Record<string, unknown>;
}

export interface UploadResult {
  itemId: string;
  itemPath: string;
  fileRef: FileRef;
}

export interface UploadItem {
  /** Client-generated tracking ID. */
  id: string;
  /** The original File object. */
  file: File;
  /** Current status in the three-step dance. */
  status: 'creating' | 'uploading' | 'confirming' | 'complete' | 'error';
  /** Upload progress 0–100 (only meaningful during 'uploading'). */
  progress: number;
  /** Error message if status is 'error'. */
  error: string | null;
  /** VFS item ID (available after 'creating' succeeds). */
  itemId: string | null;
  /** VFS item path. */
  itemPath: string | null;
  /** Completed file_ref (available when status is 'complete'). */
  fileRef: FileRef | null;
  /** The options that were passed to upload(). */
  options: UploadOptions;
}

export interface UseFileUploadReturn {
  /** Upload a single file. */
  upload: (file: File, options: UploadOptions) => void;
  /** Upload multiple files to the same destination. */
  uploadMultiple: (files: File[], options: UploadOptions) => void;
  /** Reactive list of all uploads (in-progress, completed, failed). */
  uploads: UploadItem[];
  /** Retry a failed upload from the step it failed at. */
  retryUpload: (uploadId: string) => void;
  /** Cancel an in-progress upload (aborts XHR if uploading). */
  cancelUpload: (uploadId: string) => void;
  /** Remove a completed or failed upload from the list. */
  removeUpload: (uploadId: string) => void;
  /** Remove all completed uploads from the list. */
  clearCompleted: () => void;
  /** True if any upload is currently in progress. */
  isUploading: boolean;
}

// ── Internal types for retry state ───────────────────────────────────────────

interface InternalUploadState extends UploadItem {
  /** Storage key from Step 1 (needed for Steps 2 and 3). */
  _storageKey: string | null;
  /** Upload token from Step 1 (needed for Step 2). */
  _uploadToken: string | null;
  /** Storage worker URL from Step 1 (needed for Step 2). */
  _storageWorkerUrl: string | null;
  /** XHR reference for cancel support. */
  _xhr: XMLHttpRequest | null;
  /** Which step failed — used by retry to resume from the right place. */
  _failedAt: 'create' | 'upload' | 'confirm' | null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

let _idCounter = 0;
function generateUploadId(): string {
  return `upload_${Date.now()}_${++_idCounter}`;
}

// ── uploadFile (imperative) ─────────────────────────────────────────────────

/**
 * Upload a file to the VFS. Handles the full three-step dance:
 * create → upload binary → confirm.
 *
 * @param file       The File or Blob to upload.
 * @param options    Where to put it and what to call it.
 * @param onProgress Optional callback for upload progress (0–100).
 * @param signal     Optional AbortSignal for cancellation.
 * @returns          The created item's ID, path, and committed file_ref.
 */
export async function uploadFile(
  file: File | Blob,
  options: UploadOptions,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal,
): Promise<UploadResult> {
  const fileName = options.name || (file instanceof File ? file.name : `file-${Date.now()}`);
  const contentType = file.type || 'application/octet-stream';
  const itemType = options.itemType || 'file';

  // ── Step 1: Create VFS item with file_source intent ──────────────────────

  const createResult = await gatewayCall('create', {
    parent_path: options.parentPath,
    item_type: itemType,
    name: fileName,
    type_data: {
      ...(options.typeData || {}),
      file_source: {
        type: 'upload',
        content_type: contentType,
      },
    },
  });

  const result = createResult as Record<string, any>;

  if (!result.id) {
    throw new Error(result.error || result.message || 'Failed to create file item');
  }

  const itemId = result.id as string;
  const itemPath = result.path as string;

  // If the gateway handled upload synchronously (inline/url source types),
  // file_ref is already committed — we're done.
  if (result.storage_completed && result.file_ref) {
    return { itemId, itemPath, fileRef: result.file_ref as FileRef };
  }

  // Extract storage instruction values for Steps 2 and 3.
  const storageKey = result.storage_key as string;
  const uploadToken = result.upload_token as string;
  const storageWorkerUrl = (result.storage_worker_url as string) || 'https://fsaos-storage.radns.workers.dev';

  if (!storageKey) {
    throw new Error('Gateway returned no storage_key — file_source may not be supported for this item type');
  }

  // ── Step 2: Upload binary directly to storage worker ─────────────────────

  await uploadBinaryXHR(storageWorkerUrl, storageKey, uploadToken, file, contentType, onProgress, signal);

  // ── Step 3: Confirm upload via gateway ───────────────────────────────────

  const fileRef = await confirmUpload(itemId, storageKey, contentType);

  return { itemId, itemPath, fileRef };
}

// ── Step 2 helper: XHR upload with progress ─────────────────────────────────

function uploadBinaryXHR(
  storageWorkerUrl: string,
  storageKey: string,
  uploadToken: string,
  body: File | Blob,
  contentType: string,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', `${storageWorkerUrl}/upload`);
    xhr.setRequestHeader('X-Storage-Key', storageKey);
    xhr.setRequestHeader('Content-Type', contentType);
    if (uploadToken) {
      xhr.setRequestHeader('X-Upload-Token', uploadToken);
    }

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Storage upload failed: HTTP ${xhr.status} — ${xhr.responseText?.slice(0, 300)}`));
      }
    };

    xhr.onerror = () => reject(new Error('Storage upload network error'));
    xhr.ontimeout = () => reject(new Error('Storage upload timed out'));

    // Cancellation support
    if (signal) {
      if (signal.aborted) {
        reject(new Error('Upload cancelled'));
        return;
      }
      signal.addEventListener('abort', () => {
        xhr.abort();
        reject(new Error('Upload cancelled'));
      });
    }

    xhr.send(body);
  });
}

// ── Step 3 helper: confirm upload ───────────────────────────────────────────

async function confirmUpload(
  itemId: string,
  storageKey: string,
  contentType: string,
): Promise<FileRef> {
  const token = await getAccessToken();

  const response = await fetch(`${GATEWAY_URL}/storage/upload-complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      item_id: itemId,
      storage_key: storageKey,
      content_type: contentType,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Upload confirmation failed: HTTP ${response.status} — ${text.slice(0, 300)}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || result.message || 'Upload confirmation rejected');
  }

  return result.file_ref as FileRef;
}

// ── useFileUpload (React hook) ──────────────────────────────────────────────

/**
 * React hook for file uploads. Wraps uploadFile() with reactive state:
 * tracks progress, supports retry from the failed step, cancel, and
 * manages a list of concurrent uploads.
 *
 * @example
 * ```tsx
 * const { upload, uploads, isUploading } = useFileUpload();
 *
 * const handleDrop = (files: File[]) => {
 *   for (const file of files) {
 *     upload(file, { parentPath: '/root/accounts/.../drive' });
 *   }
 * };
 *
 * return (
 *   <div onDrop={handleDrop}>
 *     {uploads.map(u => (
 *       <div key={u.id}>{u.file.name} — {u.status} — {u.progress}%</div>
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useFileUpload(): UseFileUploadReturn {
  const [uploads, setUploads] = useState<InternalUploadState[]>([]);
  const qc = useQueryClient();
  // Keep a ref to the latest uploads so callbacks can read fresh state
  const uploadsRef = useRef(uploads);
  uploadsRef.current = uploads;

  // ── State helpers ─────────────────────────────────────────────────────────

  const updateUpload = useCallback((id: string, patch: Partial<InternalUploadState>) => {
    setUploads(prev => prev.map(u => u.id === id ? { ...u, ...patch } : u));
  }, []);

  const addUpload = useCallback((item: InternalUploadState) => {
    setUploads(prev => [...prev, item]);
  }, []);

  // ── Core upload execution ─────────────────────────────────────────────────

  const executeUpload = useCallback(async (
    uploadId: string,
    file: File,
    options: UploadOptions,
    resumeFrom?: 'create' | 'upload' | 'confirm',
    existingState?: { storageKey: string; uploadToken: string; storageWorkerUrl: string; itemId: string; itemPath: string },
  ) => {
    const fileName = options.name || file.name;
    const contentType = file.type || 'application/octet-stream';
    const itemType = options.itemType || 'file';

    let itemId = existingState?.itemId || null;
    let itemPath = existingState?.itemPath || null;
    let storageKey = existingState?.storageKey || null;
    let uploadToken = existingState?.uploadToken || null;
    let storageWorkerUrl = existingState?.storageWorkerUrl || null;

    try {
      // ── Step 1: Create ──────────────────────────────────────────────────
      if (!resumeFrom || resumeFrom === 'create') {
        updateUpload(uploadId, { status: 'creating', error: null, _failedAt: null });

        const createResult = await gatewayCall('create', {
          parent_path: options.parentPath,
          item_type: itemType,
          name: fileName,
          type_data: {
            ...(options.typeData || {}),
            file_source: {
              type: 'upload',
              content_type: contentType,
            },
          },
        });

        const result = createResult as Record<string, any>;

        if (!result.id) {
          throw Object.assign(
            new Error(result.error || result.message || 'Failed to create file item'),
            { _step: 'create' as const },
          );
        }

        itemId = result.id;
        itemPath = result.path;

        updateUpload(uploadId, { itemId, itemPath });

        // Synchronous completion (inline/url file_source)
        if (result.storage_completed && result.file_ref) {
          updateUpload(uploadId, {
            status: 'complete',
            progress: 100,
            fileRef: result.file_ref,
          });
          qc.invalidateQueries({ queryKey: vfsKeys.children(options.parentPath) });
          return;
        }

        storageKey = result.storage_key;
        uploadToken = result.upload_token || '';
        storageWorkerUrl = result.storage_worker_url || 'https://fsaos-storage.radns.workers.dev';

        updateUpload(uploadId, {
          _storageKey: storageKey,
          _uploadToken: uploadToken,
          _storageWorkerUrl: storageWorkerUrl,
        });

        if (!storageKey) {
          throw Object.assign(
            new Error('Gateway returned no storage_key'),
            { _step: 'create' as const },
          );
        }
      }

      // ── Step 2: Upload binary ───────────────────────────────────────────
      if (!resumeFrom || resumeFrom === 'create' || resumeFrom === 'upload') {
        updateUpload(uploadId, { status: 'uploading', progress: 0, error: null, _failedAt: null });

        // Create XHR for cancel support
        const xhrPromise = new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          updateUpload(uploadId, { _xhr: xhr });

          xhr.open('PUT', `${storageWorkerUrl}/upload`);
          xhr.setRequestHeader('X-Storage-Key', storageKey!);
          xhr.setRequestHeader('Content-Type', contentType);
          if (uploadToken) {
            xhr.setRequestHeader('X-Upload-Token', uploadToken);
          }

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              updateUpload(uploadId, { progress: Math.round((e.loaded / e.total) * 100) });
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(Object.assign(
                new Error(`Storage upload failed: HTTP ${xhr.status}`),
                { _step: 'upload' as const },
              ));
            }
          };

          xhr.onerror = () => reject(Object.assign(
            new Error('Storage upload network error'),
            { _step: 'upload' as const },
          ));

          xhr.ontimeout = () => reject(Object.assign(
            new Error('Storage upload timed out'),
            { _step: 'upload' as const },
          ));

          xhr.send(file);
        });

        await xhrPromise;
        updateUpload(uploadId, { progress: 100, _xhr: null });
      }

      // ── Step 3: Confirm ─────────────────────────────────────────────────
      updateUpload(uploadId, { status: 'confirming', error: null, _failedAt: null });

      const fileRef = await confirmUpload(itemId!, storageKey!, contentType);

      updateUpload(uploadId, {
        status: 'complete',
        fileRef,
      });

      // Invalidate the parent's children so the new item appears in lists
      qc.invalidateQueries({ queryKey: vfsKeys.children(options.parentPath) });

    } catch (err: any) {
      const message = err?.message || String(err);
      const failedAt = err?._step || 'create';
      updateUpload(uploadId, {
        status: 'error',
        error: message,
        _failedAt: failedAt,
        _xhr: null,
      });
    }
  }, [updateUpload, qc]);

  // ── Public API ────────────────────────────────────────────────────────────

  const upload = useCallback((file: File, options: UploadOptions) => {
    const id = generateUploadId();
    const item: InternalUploadState = {
      id,
      file,
      status: 'creating',
      progress: 0,
      error: null,
      itemId: null,
      itemPath: null,
      fileRef: null,
      options,
      _storageKey: null,
      _uploadToken: null,
      _storageWorkerUrl: null,
      _xhr: null,
      _failedAt: null,
    };
    addUpload(item);
    executeUpload(id, file, options);
  }, [addUpload, executeUpload]);

  const uploadMultiple = useCallback((files: File[], options: UploadOptions) => {
    for (const file of files) {
      upload(file, options);
    }
  }, [upload]);

  const retryUpload = useCallback((uploadId: string) => {
    const item = uploadsRef.current.find(u => u.id === uploadId);
    if (!item || item.status !== 'error') return;

    const resumeFrom = item._failedAt || 'create';
    const existingState = (item._storageKey && item.itemId) ? {
      storageKey: item._storageKey,
      uploadToken: item._uploadToken || '',
      storageWorkerUrl: item._storageWorkerUrl || 'https://fsaos-storage.radns.workers.dev',
      itemId: item.itemId,
      itemPath: item.itemPath || '',
    } : undefined;

    executeUpload(uploadId, item.file, item.options, resumeFrom, existingState);
  }, [executeUpload]);

  const cancelUpload = useCallback((uploadId: string) => {
    const item = uploadsRef.current.find(u => u.id === uploadId);
    if (!item) return;
    // Abort XHR if in-flight
    if (item._xhr) {
      item._xhr.abort();
    }
    updateUpload(uploadId, {
      status: 'error',
      error: 'Cancelled',
      _xhr: null,
      _failedAt: null,
    });
  }, [updateUpload]);

  const removeUpload = useCallback((uploadId: string) => {
    setUploads(prev => prev.filter(u => u.id !== uploadId));
  }, []);

  const clearCompleted = useCallback(() => {
    setUploads(prev => prev.filter(u => u.status !== 'complete'));
  }, []);

  const isUploading = uploads.some(u =>
    u.status === 'creating' || u.status === 'uploading' || u.status === 'confirming'
  );

  // Strip internal fields from the public-facing uploads array
  const publicUploads: UploadItem[] = uploads.map(({ _storageKey, _uploadToken, _storageWorkerUrl, _xhr, _failedAt, ...rest }) => rest);

  return {
    upload,
    uploadMultiple,
    uploads: publicUploads,
    retryUpload,
    cancelUpload,
    removeUpload,
    clearCompleted,
    isUploading,
  };
}
