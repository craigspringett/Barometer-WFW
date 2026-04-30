import { isAuthed } from "@/lib/auth";
import { readDB } from "@/lib/db";
import { LoginForm } from "./LoginForm";
import { AdminDashboard } from "./AdminDashboard";
import { Logo } from "@/components/Logo";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPage() {
  const authed = isAuthed();
  if (!authed) {
    return (
      <main className="relative min-h-screen flex flex-col">
        <header className="max-w-7xl mx-auto w-full px-6 pt-8 flex items-center justify-between">
          <Logo />
          <Link href="/" className="text-xs uppercase tracking-[0.2em] text-brand-200/70 hover:text-white">
            ← Back to barometer
          </Link>
        </header>
        <div className="flex-1 flex items-center justify-center px-6">
          <LoginForm />
        </div>
      </main>
    );
  }

  const db = await readDB();
  return <AdminDashboard initialDb={db} />;
}
