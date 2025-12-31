"use server"

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const ResolutionSchema = z.object({
    title: z.string().min(1, "Title is required"),
    situation: z.string().min(1, "Situation is required"),
    task: z.string().min(1, "Task is required"),
    action: z.string().min(1, "Action is required"),
    result: z.string().default(""),
    frequency: z.enum(["DAILY", "WEEKLY"]),
    reminderTime: z.string().optional(),
});

export async function createResolution(formData: FormData) {
    console.log("Action: createResolution started");
    const session = await auth();
    if (!session?.user?.id) {
        console.error("Action: Unauthorized attempt to create resolution");
        throw new Error("Unauthorized");
    }

    const rawData = {
        title: formData.get("title"),
        situation: formData.get("situation"),
        task: formData.get("task"),
        action: formData.get("action"),
        result: formData.get("result") || "",
        frequency: formData.get("frequency") || "DAILY",
        reminderTime: formData.get("reminderTime"),
    };
    console.log("Action: Received raw data:", rawData);

    const validatedFields = ResolutionSchema.safeParse(rawData);

    if (!validatedFields.success) {
        console.error("Action: Validation failed:", validatedFields.error.flatten().fieldErrors);
        return { error: validatedFields.error.flatten().fieldErrors };
    }

    const data = {
        title: validatedFields.data.title,
        situation: validatedFields.data.situation,
        task: validatedFields.data.task,
        action: validatedFields.data.action,
        result: validatedFields.data.result,
        frequency: validatedFields.data.frequency,
        reminderTime: validatedFields.data.reminderTime || null,
    };

    try {
        if (session.user.id === "admin-id") {
            const { cookies } = await import("next/headers");
            (await cookies()).set("mock_resolution", JSON.stringify({ ...data, id: "mock-res-id" }), { maxAge: 3600 * 24 });
        } else {
            await prisma.resolution.create({
                data: {
                    ...data,
                    userId: session.user.id,
                },
            });
        }
    } catch (error) {
        console.error("Action: DB Error in createResolution:", error);
        return { error: "Database error" };
    }

    console.log("Action: Redirecting to /dashboard");
    revalidatePath("/dashboard");
    redirect("/dashboard");
}

export async function toggleCheckIn(resolutionId: string, date: Date, status: "DONE" | "MISSED") {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    try {
        if (session.user.id === "admin-id") {
            const { cookies } = await import("next/headers");
            const cookieStore = await cookies();
            const mock = cookieStore.get("mock_resolution");
            if (mock) {
                const data = JSON.parse(mock.value);
                const checkIns = data.checkIns || [];
                // Update or add today's check-in
                const filtered = checkIns.filter((c: any) => {
                    const d = new Date(c.date);
                    d.setUTCHours(0, 0, 0, 0);
                    return d.getTime() !== normalizedDate.getTime();
                });
                data.checkIns = [...filtered, { date: normalizedDate.toISOString(), status }];
                cookieStore.set("mock_resolution", JSON.stringify(data));
            }
            return { success: true };
        }

        await prisma.checkIn.upsert({
            where: {
                resolutionId_date: {
                    resolutionId,
                    date: normalizedDate
                }
            } as any,
            update: { status },
            create: {
                resolutionId,
                date: normalizedDate,
                status
            }
        });

    } catch (error) {
        console.error("Check-in Error:", error);
        return { error: "Failed to save check-in" };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/resolutions");
    return { success: true };
}

export async function updateResolution(id: string, formData: FormData) {
    console.log("Action: updateResolution started", id);
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const rawData = {
        title: formData.get("title"),
        situation: formData.get("situation"),
        task: formData.get("task"),
        action: formData.get("action"),
        result: formData.get("result") || "",
        frequency: formData.get("frequency") || "DAILY",
        reminderTime: formData.get("reminderTime"),
    };

    const validatedFields = ResolutionSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors };
    }

    const data = {
        title: validatedFields.data.title,
        situation: validatedFields.data.situation,
        task: validatedFields.data.task,
        action: validatedFields.data.action,
        result: validatedFields.data.result,
        frequency: validatedFields.data.frequency,
        reminderTime: validatedFields.data.reminderTime || null,
    };

    try {
        if (session.user.id === "admin-id") {
            const { cookies } = await import("next/headers");
            (await cookies()).set("mock_resolution", JSON.stringify({ ...data, id }), { maxAge: 3600 * 24 });
        } else {
            await prisma.resolution.update({
                where: { id, userId: session.user.id } as any,
                data,
            });
        }
    } catch (error) {
        console.error("Action: DB Error in updateResolution:", error);
        return { error: "Database error" };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/resolutions");
    redirect("/dashboard/resolutions");
}

export async function deleteResolution(formData: FormData) {
    console.log("Action: deleteResolution started");
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const id = formData.get("id") as string;
    if (!id) return;

    try {
        if (session.user.id === "admin-id") {
            const { cookies } = await import("next/headers");
            (await cookies()).delete("mock_resolution");
        } else {
            await prisma.resolution.delete({
                where: { id, userId: session.user.id },
            });
        }
    } catch (error) {
        console.error("Action: DB Error in deleteResolution:", error);
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/resolutions");
    redirect("/dashboard/new");
}

export async function updateProfile(formData: FormData) {
    console.log("Action: updateProfile started");
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const data = {
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        bio: formData.get("bio") as string,
    };

    try {
        if (session.user.id === "admin-id") {
            const { cookies } = await import("next/headers");
            (await cookies()).set("mock_profile", JSON.stringify(data), { maxAge: 3600 * 24 });
        } else {
            await prisma.user.update({
                where: { id: session.user.id },
                data,
            });
        }
    } catch (error) {
        console.error("Action: Error in updateProfile:", error);
        return { error: "Failed to update profile" };
    }

    revalidatePath("/dashboard/settings");
}
