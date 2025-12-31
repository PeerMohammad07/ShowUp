import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ChevronLeft, Zap, Loader2, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditResolutionForm } from "./edit-form";

export default async function EditResolutionPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user?.id) return null;

    const { id } = await params;
    let resolution: any = null;

    if (session.user.id === "admin-id") {
        const { cookies } = await import("next/headers");
        const mockCookie = (await cookies()).get("mock_resolution");
        if (mockCookie) {
            resolution = JSON.parse(mockCookie.value);
            if (resolution.id !== id) {
                // For simplicity in mock mode, if ID doesn't match, we still allow editing the cookie-based one if that's all we have
                // but let's be strict if the ID is different from the mock one the user clicked.
            }
        } else {
            // Default mock if no cookie exists
            resolution = {
                id: "mock-res-id",
                title: "Master the ShowUp App",
                situation: "I've been skipping my dashboard tasks.",
                task: "Need to build a habit of checking in.",
                action: "Clear all my daily dashboard tasks",
                reminderTime: "09:00",
                frequency: "DAILY",
            };
        }
    } else {
        try {
            resolution = await prisma.resolution.findUnique({
                where: { id, userId: session.user.id } as any,
            });
        } catch (error) {
            console.error("Error fetching resolution for edit:", error);
        }
    }

    if (!resolution) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0A0A0A] pb-20">
            {/* Header */}
            <header className="h-16 flex items-center px-6 sticky top-0 bg-[#F8F9FA]/80 dark:bg-[#0A0A0A]/80 backdrop-blur-lg z-50">
                <Link href="/dashboard/resolutions" className="p-2 -ml-2 text-neutral-500 dark:text-neutral-400">
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <h1 className="flex-1 text-center font-bold dark:text-white mr-8 text-sm">Edit Resolution</h1>
            </header>

            <main className="px-6 space-y-8 pt-6 max-w-xl mx-auto">
                <EditResolutionForm resolution={resolution} />
            </main>
        </div>
    );
}
