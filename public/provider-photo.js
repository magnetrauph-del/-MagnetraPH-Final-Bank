// Existing conservative Google-provider policy, shared by Dashboard and Account.
// A provider photo is not a custom upload/storage mechanism.
export function providerPhoto(current) {
  const provider = current?.providerData?.find((p) => p.providerId === "google.com" && p.email === current.email);
  const value = current?.photoURL;
  if (!provider || typeof value !== "string" || value !== provider.photoURL || value.length > 1024) return null;
  try {
    const u = new URL(value);
    return u.protocol === "https:" && u.hostname === "lh3.googleusercontent.com" && !u.port && !u.username && !u.password && !u.search && !u.hash
      && /^\/(?:a|a-)\/[A-Za-z0-9_-]+(?:=[A-Za-z0-9_-]+)?$/.test(u.pathname) ? u.href : null;
  } catch { return null; }
}
