import { cookies } from "next/headers";

const COOKIE_NAME = "tipjen_admin_session";

export function isLoggedIn() {
  const store = cookies();
  return store.get(COOKIE_NAME)?.value === "logged_in";
}

export function setLoginCookie() {
  cookies().set(COOKIE_NAME, "logged_in", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearLoginCookie() {
  cookies().set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
