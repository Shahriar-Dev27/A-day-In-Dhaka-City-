import type { Metadata } from "next";
import Link from "next/link";
import QuietPage from "@/components/QuietPage";

export const metadata: Metadata = { title: "Page not found · A Day in Dhaka" };

export default function NotFound() {
  return (
    <QuietPage code="404" bn="পৃষ্ঠাটি খুঁজে পাওয়া যায়নি" en="We couldn't find that page. It wandered off into the night.">
      <Link href="/" className="btn btn-solid">
        <span lang="bn">শুরুতে ফিরে যান</span>
        <span lang="en">Back to the start</span>
      </Link>
    </QuietPage>
  );
}
