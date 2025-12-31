import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import SettingsForm from "./settings-form";

export default async function SettingsPage() {
    const session = await auth();
    if (!session?.user?.id) return null;

    let user: any = null;

    if (session.user.id === "admin-id") {
        const { cookies } = await import("next/headers");
        const mockProfile = (await cookies()).get("mock_profile");

        if (mockProfile) {
            user = JSON.parse(mockProfile.value);
            user.email = session.user.email;
        } else {
            user = {
                firstName: "Peer",
                lastName: "Mohammad",
                bio: "Just a guy building cool stuff.",
                email: session.user.email,
            };
        }
    } else {
        try {
            user = await prisma.user.findUnique({
                where: { id: session.user.id } as any,
                select: {
                    email: true,
                    firstName: true,
                    lastName: true,
                    bio: true,
                } as any
            });
        } catch (error) {
            console.error("Error fetching user for settings:", error);
        }
    }

    return <SettingsForm user={user} />;
}
