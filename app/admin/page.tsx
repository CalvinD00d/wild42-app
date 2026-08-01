import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { readContent } from "@/lib/content-store";
import { AdminEditor } from "./admin-editor";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  return <AdminEditor initialContent={await readContent()} />;
}
