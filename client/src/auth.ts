import { sendRequest } from "@/utils/api";
import {
  InactiveAccountError,
  InvalidEmailPasswordError,
} from "@/utils/errors";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        try {
          const response: any = await sendRequest({
            method: "POST",
            url: "http://localhost:5000/api/auth/login",
            body: {
              email: credentials.email,
              password: credentials.password,
            },
          });

          // console.log("API Response:", response);

          if (!response) {
            throw new Error("Invalid response from server");
          }

          if (response.statusCode === 201) {
            return {
              id: response.data.user._id, // Using 'id' as NextAuth expects
              name: response.data.user.name || "",
              email: response.data.user.email,
              accessToken: response.data.access_token, // Changed to camelCase
            };
          } else if (response.statusCode === 401) {
            throw new InvalidEmailPasswordError();
          } else if (response.statusCode === 400) {
            throw new InactiveAccountError();
          } else {
            throw new Error("Internal server error");
          }
        } catch (error) {
          console.error("Authorization error:", error);
          throw error;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({
      token,
      user,
      account,
    }: {
      token: any;
      user: any;
      account: any;
    }) {
      // console.log("JWT callback - token:", token);
      // console.log("JWT callback - user:", user);
      // console.log("JWT callback - account:", account);

      if (user && account) {
        return {
          ...token,
          _id: user.id,
          name: user.name,
          email: user.email,
          access_token: user.access_token,
        };
      }

      return token;
    },
    async session({ session, token }) {
      // console.log("Session callback - token:", token);
      // console.log("Session callback - session:", session);

      return {
        ...session,
        user: {
          ...session.user,
          _id: token._id,
          name: token.name,
          email: token.email,
        },
        access_token: token.access_token,
      };
    },
    async authorized({ auth }) {
      return !!auth;
    },
  },
});
