export function safeInternalRedirect(value: unknown, fallback = "/organizer"): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return fallback;
  }

  try {
    const target = new URL(value, "http://localhost");
    return target.origin === "http://localhost"
      ? `${target.pathname}${target.search}${target.hash}`
      : fallback;
  } catch {
    return fallback;
  }
}
