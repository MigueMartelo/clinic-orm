"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getProfile, type UserRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const userRoleSchema = z.enum(["admin", "recepcion", "doctora"]);

const createUserSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  full_name: z.string().min(2, "El nombre es obligatorio"),
  role: userRoleSchema,
});

const updateRoleSchema = z.object({
  userId: z.string().uuid(),
  role: userRoleSchema,
});

export type ActionState = {
  error?: string;
  success?: string;
};

export async function createUserAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await getProfile();

  if (!profile || profile.role !== "admin") {
    return { error: "No autorizado" };
  }

  const parsed = createUserSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    full_name: formData.get("full_name"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true,
      user_metadata: {
        full_name: parsed.data.full_name,
      },
    });

    if (error || !data.user) {
      return { error: error?.message ?? "No se pudo crear el usuario" };
    }

    const { error: profileError } = await admin
      .from("profiles")
      .update({
        full_name: parsed.data.full_name,
        role: parsed.data.role,
      })
      .eq("id", data.user.id);

    if (profileError) {
      return { error: profileError.message };
    }

    revalidatePath("/usuarios");
    return { success: "Usuario creado correctamente" };
  } catch {
    return {
      error:
        "Falta SUPABASE_SECRET_KEY en el entorno del servidor",
    };
  }
}

export async function updateUserRoleAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await getProfile();

  if (!profile || profile.role !== "admin") {
    return { error: "No autorizado" };
  }

  const parsed = updateRoleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  if (
    parsed.data.userId === profile.id &&
    parsed.data.role !== "admin"
  ) {
    return {
      error: "No puedes cambiar tu propio rol y perder acceso de administrador",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role: parsed.data.role as UserRole })
    .eq("id", parsed.data.userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/usuarios");
  return { success: "Rol actualizado" };
}
