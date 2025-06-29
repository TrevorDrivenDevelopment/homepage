export const getAssetPath = (path: string): string => {
  // In development, assets are served from root
  // In production, they're served from the build output
  const publicUrl = (import.meta.env?.PUBLIC_URL as string) || '';
  
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${publicUrl}${normalizedPath}`;
}; 
