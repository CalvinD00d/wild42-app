import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { AdminLogin } from "../admin-login";

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return <AdminLogin />;
}
