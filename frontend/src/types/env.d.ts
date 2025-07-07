/// <reference types="@rsbuild/core/types" />

interface ImportMetaEnv {
  readonly APP_API_URL?: string;
  readonly RSBUILD_API_URL?: string;
  readonly PUBLIC_URL?: string;
  readonly NODE_ENV?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
