"use client";

import Link from "next/link";
import { useEffect } from "react";
import QuietPage from "@/components/QuietPage";

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    // Only the digest is logged; the message/stack never reaches the UI.
    console.error("Route error", error.digest ?? error.name);
  }, [error]);

  return (
    <QuietPage bn="কিছু একটা ভুল হয়েছে" en="Something went wrong on our side. Please try again.">
      <button type="button" onClick={() => retry()} className="btn btn-solid">
        <span lang="bn">আবার চেষ্টা করুন</span>
        <span lang="en">Try again</span>
      </button>
      <Link href="/" className="btn btn-ghost">
        <span lang="en">Go home</span>
      </Link>
    </QuietPage>
  );
}
