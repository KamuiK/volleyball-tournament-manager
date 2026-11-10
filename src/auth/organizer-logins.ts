const githubLoginPattern = /^[a-z\d]+(?:-[a-z\d]+)*$/i;

/** Returns a normalized allowlist, or null when configuration is absent or invalid. */
export function parseOrganizerGithubLogins(value: string | undefined): Set<string> | null {
  if (!value?.trim()) {
    return null;
  }

  const entries = value.split(",").map((entry) => entry.trim());
  if (
    entries.some(
      (entry) => entry.length < 1 || entry.length > 39 || !githubLoginPattern.test(entry),
    )
  ) {
    return null;
  }

  return new Set(entries.map((entry) => entry.toLowerCase()));
}

export function isOrganizerGithubLogin(
  githubLogin: string | undefined,
  configuredLogins: string | undefined,
): boolean {
  if (!githubLogin || githubLogin.length > 39 || !githubLoginPattern.test(githubLogin)) {
    return false;
  }

  return parseOrganizerGithubLogins(configuredLogins)?.has(githubLogin.toLowerCase()) ?? false;
}

export function hasOrganizerAuthConfiguration(environment: NodeJS.ProcessEnv): boolean {
  return Boolean(
    environment.AUTH_SECRET?.trim() &&
    environment.AUTH_GITHUB_ID?.trim() &&
    environment.AUTH_GITHUB_SECRET?.trim() &&
    parseOrganizerGithubLogins(environment.ORGANIZER_GITHUB_LOGINS),
  );
}
