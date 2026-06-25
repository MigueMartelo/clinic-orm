"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import {
  updateUserRoleAction,
  type ActionState,
} from "@/app/(app)/usuarios/actions";
import { roleLabels, userRoles, type Profile } from "@/lib/auth-types";

type RoleSelectProps = {
  profile: Profile;
  currentUserId: string;
};

const initialState: ActionState = {};
const roles = userRoles;

export function RoleSelect({ profile, currentUserId }: RoleSelectProps) {
  const [state, formAction, isPending] = useActionState(
    updateUserRoleAction,
    initialState,
  );

  const isSelf = profile.id === currentUserId;

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
    }

    if (state.error) {
      toast.error(state.error);
    }
  }, [state.error, state.success]);

  return (
    <form action={formAction}>
      <input type="hidden" name="userId" value={profile.id} />
      <select
        name="role"
        defaultValue={profile.role}
        disabled={isSelf || isPending}
        title={
          isSelf ? "No puedes cambiar tu propio rol desde aquí" : undefined
        }
        className="flex h-8 w-[140px] rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
        onChange={(event) => {
          event.currentTarget.form?.requestSubmit();
        }}
      >
        {roles.map((role) => (
          <option key={role} value={role}>
            {roleLabels[role]}
          </option>
        ))}
      </select>
    </form>
  );
}
