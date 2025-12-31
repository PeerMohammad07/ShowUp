"use server"

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function authenticate(formData: FormData) {
    console.log("Action: authenticate started for:", formData.get("email"));
    try {
        const data = Object.fromEntries(formData);
        await signIn("credentials", {
            ...data,
            redirectTo: "/dashboard",
        });
        console.log("Action: signIn finished");
    } catch (error) {
        if (error instanceof AuthError) {
            console.log("Action: AuthError caught:", error.type);
            switch (error.type) {
                case "CredentialsSignin":
                    return "Invalid credentials.";
                default:
                    return "Something went wrong.";
            }
        }
        console.log("Action: Rethrowing error (potentially redirect):", error);
        throw error;
    }
}
