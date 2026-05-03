"use client";

import { useTransition } from "react";
import { ShieldBan, ShieldCheck } from "lucide-react";
import { banUser, unbanUser } from "@/app/admin/actions";
import EditUserModal from "./EditUserModal";

interface UserProfile {
  user_id: string;
  full_name: string | null;
  company_name: string | null;
  country: string | null;
  role: string;
  is_verified: boolean;
  is_banned: boolean;
}

export default function UserActions({ user }: { user: UserProfile }) {
  const [isPending, startTransition] = useTransition();

  function handleBan() {
    startTransition(async () => {
      await banUser(user.user_id);
      window.location.reload();
    });
  }

  function handleUnban() {
    startTransition(async () => {
      await unbanUser(user.user_id);
      window.location.reload();
    });
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <EditUserModal user={user} />

      {!user.is_banned ? (
        <button
          onClick={handleBan}
          disabled={isPending}
          className="p-1.5 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
          title="Ban user"
        >
          <ShieldBan className="w-4 h-4 text-red-500" />
        </button>
      ) : (
        <button
          onClick={handleUnban}
          disabled={isPending}
          className="p-1.5 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
          title="Unban user"
        >
          <ShieldCheck className="w-4 h-4 text-green-600" />
        </button>
      )}
    </div>
  );
}
