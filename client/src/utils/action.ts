"use server";

import { signIn } from "@/auth";

export async function authenticate(email: string, password: string) {
  try {
    return await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch (error: any) {
    if (error.name === "InvalidEmailPasswordError")
      return {
        error: error.type,
        code: 1,
      };
    else if (error.name === "InactiveAccountError")
      return {
        error: error.type,
        code: 2,
      };
    else
      return {
        error: "Internal server error",
        code: 0,
      };
  }
}
