"use server"

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const RegisterSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function register(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const validated = RegisterSchema.safeParse({ email, password });
    if (!validated.success) {
        return { error: validated.error.flatten().fieldErrors };
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return { error: "Email already registered" };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            },
        });

        return { success: true };
    } catch (error) {
        console.error("Register Error:", error);
        return { error: "Failed to create account" };
    }
}
