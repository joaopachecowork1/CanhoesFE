import { CANHOES_API_URL } from "@/lib/api/canhoesClient";

function normalizeMediaPath(path: string) {
  return path.trim().replaceAll("\\", "/");
}

function toUploadsProxyPath(pathname: string) {
  return pathname.startsWith("/api/uploads/")
    ? pathname
    : `/api${pathname}`;
}

export function absMediaUrl(path: string | null | undefined) {
  if (!path) return "";

  const normalizedPath = normalizeMediaPath(path);
  if (!normalizedPath) return "";

  const uploadsIndex = normalizedPath.toLowerCase().indexOf("/uploads/");
  if (uploadsIndex >= 0) {
    return toUploadsProxyPath(normalizedPath.slice(uploadsIndex));
  }

  if (
    normalizedPath.startsWith("http://") ||
    normalizedPath.startsWith("https://")
  ) {
    try {
      const parsedUrl = new URL(normalizedPath);
      if (parsedUrl.pathname.startsWith("/uploads/")) {
        return `${toUploadsProxyPath(parsedUrl.pathname)}${parsedUrl.search}${parsedUrl.hash}`;
      }
    } catch {
      return normalizedPath;
    }

    return normalizedPath;
  }

  if (normalizedPath.startsWith("uploads/")) {
    return toUploadsProxyPath(`/${normalizedPath}`);
  }

  if (normalizedPath.startsWith("/uploads/")) {
    return toUploadsProxyPath(normalizedPath);
  }

  if (normalizedPath.startsWith("/")) {
    return `${CANHOES_API_URL}${normalizedPath}`;
  }

  return `${CANHOES_API_URL}/${normalizedPath}`;
}
