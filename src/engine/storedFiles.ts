/**
 * Largest file accepted by the scanner (5 MB). Covers lockfiles and long logs;
 * the files persist in IndexedDB, whose quota is far larger than localStorage.
 */
export const MAX_FILE_BYTES = 5 * 1024 * 1024;

export interface StoredFile {
  id: string;
  filename: string;
  content: string;
}

const DB_NAME = 'config-audit';
const DB_VERSION = 1;
const STORE = 'scanner';
/** The whole file list is one record, so a save replaces it atomically. */
const FILES_RECORD = 'files';

/** Accepts only well-formed entries so a corrupted stored value cannot crash the scanner. */
export function sanitizeStoredFiles(value: unknown): StoredFile[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (entry): entry is StoredFile =>
        typeof entry === 'object' &&
        entry !== null &&
        typeof entry.id === 'string' &&
        typeof entry.filename === 'string' &&
        typeof entry.content === 'string' &&
        entry.content.length <= MAX_FILE_BYTES,
    )
    .map(({ id, filename, content }) => ({ id, filename, content }));
}

/** Parses the JSON format earlier builds kept in localStorage. */
export function parseStoredFiles(raw: string | null): StoredFile[] {
  if (!raw) return [];
  try {
    return sanitizeStoredFiles(JSON.parse(raw));
  } catch {
    return [];
  }
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  dbPromise ??= new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('IndexedDB upgrade blocked'));
  }).catch((error: unknown) => {
    // Allow a later retry instead of caching the failure forever.
    dbPromise = null;
    throw error;
  });
  return dbPromise;
}

function run(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest): Promise<unknown> {
  return openDb().then(
    (db) =>
      new Promise<unknown>((resolve, reject) => {
        const transaction = db.transaction(STORE, mode);
        const request = action(transaction.objectStore(STORE));
        transaction.oncomplete = () => resolve(request.result);
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction aborted'));
      }),
  );
}

export async function loadFilesFromDb(): Promise<StoredFile[]> {
  return sanitizeStoredFiles(await run('readonly', (store) => store.get(FILES_RECORD)));
}

/** Transactions on the same store run in creation order, so the latest save always wins. */
export async function saveFilesToDb(files: StoredFile[]): Promise<void> {
  await run('readwrite', (store) =>
    files.length === 0 ? store.delete(FILES_RECORD) : store.put(files, FILES_RECORD),
  );
}
