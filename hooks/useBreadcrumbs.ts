"use client";

import { usePathname } from "next/navigation";

export function useBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const breadcrumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const name = decodeURIComponent(segment).replace(/-/g, " ");
    return { name, href };
  });

  return breadcrumbs;
}
