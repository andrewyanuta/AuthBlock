// Check if OAuth providers are configured
export const isGoogleConfigured = () => {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
};

export const isFacebookConfigured = () => {
  return !!(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET);
};

export const isGitHubConfigured = () => {
  return !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
};

export const getOAuthProviders = () => {
  const providers = [];
  if (isGoogleConfigured()) providers.push('google');
  if (isFacebookConfigured()) providers.push('facebook');
  if (isGitHubConfigured()) providers.push('github');
  return providers;
};

