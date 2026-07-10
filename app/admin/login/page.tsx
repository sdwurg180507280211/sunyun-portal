import {redirect} from "next/navigation";
import {LoginForm} from "@/components/admin/login-form";
import {getCurrentAdmin} from "@/lib/auth/current-user";

export const metadata = {title: "后台登录"};

export default async function AdminLoginPage() {
  if (await getCurrentAdmin()) redirect("/admin");
  return (
    <main className="site-shell flex min-h-screen items-center justify-center py-16">
      <LoginForm />
    </main>
  );
}
