import { Suspense } from "react";
import { RequestChat } from "./request-chat";

export default function RequestPage() {
  return (
    <Suspense
      fallback={
        <div className="text-cocoa">Loading request workspace…</div>
      }
    >
      <RequestChat />
    </Suspense>
  );
}
