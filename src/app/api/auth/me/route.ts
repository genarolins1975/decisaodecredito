import { handle, json } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/session";
import { listAccessibleClasses } from "@/lib/auth/guard";

export const GET = handle(async () => {
  const u = await getCurrentUser();
  if (!u) return json({ user: null }, 401);
  const classes = u.mustChangePassword ? [] : await listAccessibleClasses(u);
  return json({ user: { id: u.id, name: u.name, email: u.email, isStaff: u.isStaff, mustChangePassword: u.mustChangePassword },
    classes: classes.map((c) => ({ id: c.cls.id, code: c.cls.code, name: c.cls.name, year: c.edition.year, role: c.role, status: c.cls.status })) });
});
