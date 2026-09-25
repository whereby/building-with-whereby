/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** The account's Whereby subdomain, e.g. "funtimes". Public; used to rebuild
   *  room URLs from name-only invite links. */
  readonly VITE_WHEREBY_SUBDOMAIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
