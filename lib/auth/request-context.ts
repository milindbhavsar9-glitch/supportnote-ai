import { getCurrentProfile } from "@/lib/auth/profile";
import type { AuthProfile } from "@/lib/auth/roles";

export type RequestContext =
  | {
      mode: "auth";
      profile: AuthProfile;
      sessionId: "";
    }
  | {
      mode: "demo";
      profile: null;
      sessionId: string;
    };

export async function getRequestContext(request: Request): Promise<RequestContext | null> {
  const profile = await getCurrentProfile();
  if (profile) return { mode: "auth", profile, sessionId: "" };

  const sessionId = request.headers.get("x-supportnote-session")?.trim() ?? "";
  if (sessionId) return { mode: "demo", profile: null, sessionId };

  return null;
}
