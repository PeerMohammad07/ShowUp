import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Daily Reminder Cron
 * This endpoint should be triggered by a Vercel Cron or similar service.
 * It sends a nudge to all users with active resolutions.
 */
export async function GET(request: Request) {
    // 1. Security check for Cron (optional but recommended)
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (process.env.CRON_SECRET && key !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        console.log("Starting daily reminder cron...");

        // 2. Fetch all resolutions with user info, filtered for ACTIVE status
        const resolutions = await prisma.resolution.findMany({
            where: { status: "ACTIVE" } as any,
            include: {
                user: true,
                checkIns: {
                    orderBy: { date: 'desc' },
                    take: 10 // Need recent ones to check status
                }
            }
        });

        if (!resolutions.length) {
            return NextResponse.json({ message: "No resolutions found. Skipping reminders." });
        }

        // 3. Group resolutions by user to send a single digest email
        const userDigests = new Map<string, { email: string, name: string, goals: string[] }>();

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const getStartOfWeek = (d: Date) => {
            const date = new Date(d);
            const day = date.getUTCDay();
            const diff = (day === 0 ? -6 : 1) - day;
            date.setUTCDate(date.getUTCDate() + diff);
            date.setUTCHours(0, 0, 0, 0);
            return date;
        };
        const currentWeekStart = getStartOfWeek(today);

        resolutions.forEach(res => {
            const checkIns = res.checkIns || [];
            const isWeekly = res.frequency === "WEEKLY";

            // Check if already done for this period
            const alreadyDone = checkIns.some((c: any) => {
                const cDate = new Date(c.date);
                if (isWeekly) {
                    return getStartOfWeek(cDate).getTime() === currentWeekStart.getTime() && c.status === "DONE";
                }
                cDate.setUTCHours(0, 0, 0, 0);
                return cDate.getTime() === today.getTime() && c.status === "DONE";
            });

            if (alreadyDone) return; // Skip if they already showed up!

            if (!userDigests.has(res.userId)) {
                const user = res.user as any;
                userDigests.set(res.userId, {
                    email: user.email,
                    name: user.firstName || "Achiever",
                    goals: []
                });
            }
            userDigests.get(res.userId)?.goals.push(res.title);
        });

        // 4. Send emails using Resend
        const results = [];

        for (const [userId, data] of userDigests.entries()) {
            try {
                const userData = data as any;
                // Only send if we have a valid key, otherwise log the attempt for development
                if (process.env.RESEND_API_KEY) {
                    const emailResponse = await resend.emails.send({
                        from: 'ShowUp <reminders@showup.app>',
                        to: userData.email,
                        subject: 'Time to ShowUp! your Daily Nudge 🚀',
                        html: `
                            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                                <h1 style="color: #00D261;">Hey ${userData.name},</h1>
                                <p style="font-size: 16px; color: #333;">It's time to take action on your 2026 resolutions! Consistency is the secret sauce of the STAR method.</p>
                                <p style="font-size: 14px; font-weight: bold; color: #666; text-transform: uppercase; letter-spacing: 1px;">Today's Focus:</p>
                                <ul style="list-style: none; padding: 0;">
                                    ${userData.goals.map((g: string) => `
                                        <li style="background: #f9f9f9; padding: 15px; margin-bottom: 10px; border-radius: 8px; border-left: 4px solid #00D261;">
                                            <strong style="display: block;">${g}</strong>
                                            <span style="font-size: 12px; color: #888;">Log your action now to keep your streak alive.</span>
                                        </li>
                                    `).join('')}
                                </ul>
                                <div style="margin-top: 30px; text-align: center;">
                                    <a href="${process.env.NEXTAUTH_URL || 'https://showup-app.vercel.app'}/dashboard" 
                                       style="background: #00D261; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                                       Go to Dashboard
                                    </a>
                                </div>
                                <hr style="margin-top: 40px; border: 0; border-top: 1px solid #eee;"/>
                                <p style="font-size: 12px; color: #aaa; text-align: center;">© 2026 ShowUp App • Built for focus</p>
                            </div>
                        `
                    });
                    results.push({ userId, status: emailResponse.error ? 'error' : 'sent', id: emailResponse.data?.id });
                } else {
                    console.log(`[MOCK] Sending email to ${userData.email} with goals: ${userData.goals.join(', ')}`);
                    results.push({ userId, status: 'mock_sent' });
                }
            } catch (err: any) {
                console.error(`Failed to send email:`, err);
                results.push({ userId, status: 'failed', error: err.message });
            }
        }

        return NextResponse.json({
            success: true,
            message: `Processed reminders for ${userDigests.size} users.`,
            results
        });

    } catch (error: any) {
        console.error("Critical error in Cron job:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
