import { redirect } from "next/navigation";

export default function RequestRedirectPage() {
  redirect("/app/orders/new");
}
