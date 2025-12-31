import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Apple({
            clientId: process.env.APPLE_ID,
            clientSecret: process.env.APPLE_SECRET,
        }),
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                console.log("Auth: Authorize called with:", credentials?.email);
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(5) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;

                    // Admin Bypass Logic (Environment Variables)
                    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
                        console.log("Auth: Admin bypass triggered for:", email);
                        return {
                            id: "admin-id",
                            email: process.env.ADMIN_EMAIL,
                            name: "Peeru Admin"
                        };
                    }

                    try {
                        console.log("Auth: Attempting DB lookup for:", email);
                        const user = await prisma.user.findUnique({ where: { email } });
                        if (!user) {
                            console.log("Auth: User not found:", email);
                            return null;
                        }

                        const passwordsMatch = await bcrypt.compare(password, user.password);
                        if (passwordsMatch) {
                            console.log("Auth: Password match success for:", email);
                            return user;
                        }

                        console.log("Auth: Password mismatch for:", email);
                    } catch (error) {
                        console.error("Auth: Database error during authorize:", error);
                        return null;
                    }
                } else {
                    console.log("Auth: Validation failed for credentials");
                }

                return null;
            },
        }),
    ],
    pages: {
        signIn: "/login",
    },
    session: { strategy: "jwt" },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            console.log("Auth: Session callback, token ID:", token.id);
            if (session.user && token.id) {
                session.user.id = token.id as string;
            }
            return session;
        }
    },
    debug: process.env.NODE_ENV === "development",
});
