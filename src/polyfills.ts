// src/polyfills.ts
import { Buffer } from "buffer";

// Make Buffer available globally for browser libs like @solana/spl-token
if (!(window as any).Buffer) {
  (window as any).Buffer = Buffer;
}
