// app/actions/theme.ts
"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function setTheme(theme: "light" | "dark") {
  const cookieStore = await cookies();
  cookieStore.set("theme", theme, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}
