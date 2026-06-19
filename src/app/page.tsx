"use client";

/** Landing redirect — resume the persisted last view, defaulting to /dashboard. */
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    let target = "/dashboard";
    try {
      const last = localStorage.getItem("bs_view");
      if (last && last.startsWith("/")) target = last;
    } catch {
      /* ignore */
    }
    router.replace(target);
  }, [router]);
  return null;
}
