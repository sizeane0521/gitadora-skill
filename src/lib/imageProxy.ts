/**
 * Converts a raw image URL to a weserv.nl CDN-proxied thumbnail.
 * Returns empty string for falsy inputs.
 */
export function getCdnThumbnail(rawUrl: string | undefined | null, width = 150): string {
  if (!rawUrl || rawUrl.trim() === "") return "";
  // Skip if already a data URI (base64) or blob
  if (rawUrl.startsWith("data:") || rawUrl.startsWith("blob:")) return rawUrl;
  // Skip if already proxied
  if (rawUrl.includes("images.weserv.nl")) return rawUrl;
  return `https://images.weserv.nl/?url=${encodeURIComponent(rawUrl)}&w=${width}&fit=cover&q=80`;
}
