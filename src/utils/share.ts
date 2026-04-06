import LZString from "lz-string";

export function encodeCodeToURL(code: string): string {
  const encoded = LZString.compressToEncodedURIComponent(code);
  const newUrl = window.location.origin + window.location.pathname + "?code=" + encoded;
  return newUrl;
}

export function decodeCodeFromURL(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const codeParam = params.get("code");
  if (!codeParam) return null;
  
  try {
    const decoded = LZString.decompressFromEncodedURIComponent(codeParam);
    return decoded;
  } catch (error) {
    console.error("Failed to decode shared code URL", error);
    return null;
  }
}
