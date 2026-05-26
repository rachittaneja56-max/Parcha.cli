"use server";

import { cookies } from "next/headers";

export async function setSessionCookie(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === "production";

  cookieStore.set("parcha_session", `${accessToken}:::${refreshToken}`, {
    httpOnly: true,
    secure: isProd,
    path: "/",
    maxAge: 604800, 
    sameSite: "lax",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("parcha_session");
}
