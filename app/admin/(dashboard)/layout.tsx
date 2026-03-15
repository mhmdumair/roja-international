import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyAdminToken } from "@/lib/adminAuth";
import AdminNav from "./AdminNav";

export const metadata = { title: { default: "Admin | Roja International", template: "%s | Admin" } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const store = cookies() as ReturnType<typeof cookies>;
  const token = store.get("admin_token")?.value;
  if (!token || !(await verifyAdminToken(token))) redirect("/admin/login");
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      <AdminNav />
      <div className="flex-1 min-w-0 md:ml-56 flex flex-col">
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
