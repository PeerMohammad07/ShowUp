import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
        return NextResponse.json([]);
    }

    try {
        const resolutions = await prisma.resolution.findMany({
            where: {
                userId: session.user.id as any,
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { action: { contains: query, mode: 'insensitive' } },
                    { situation: { contains: query, mode: 'insensitive' } },
                    { task: { contains: query, mode: 'insensitive' } },
                ],
            },
            take: 5,
            select: {
                id: true,
                title: true,
                action: true,
            }
        });

        return NextResponse.json(resolutions);
    } catch (error) {
        console.error("Search API error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
