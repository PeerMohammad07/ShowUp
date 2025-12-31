import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
    Target,
    Plus,
    ChevronRight,
    Zap,
    Calendar,
    Star as StarIcon,
    Trash2,
    Pencil
} from "lucide-react";
import Link from "next/link";
import { deleteResolution } from "@/lib/actions";
import { CheckInButtons } from "@/components/check-in-buttons";

export default async function ResolutionsPage() {
    const session = await auth();
    if (!session?.user) return null;

    const userId = session.user.id;
    let resolutions: any[] = [];

    // Admin Bypass Logic (Check Cookie first, then default mock)
    if (userId === "admin-id") {
        const { cookies } = await import("next/headers");
        const mockCookie = (await cookies()).get("mock_resolution");

        if (mockCookie) {
            const resData = JSON.parse(mockCookie.value);
            resolutions = [
                {
                    ...resData,
                    progress: resData.progress || 85,
                    streak: resData.streak || 12,
                }
            ];
        } else {
            // Default mock if no cookie exists - and we can show nothing or the default one
            // Let's show nothing if they deleted it, or the default if it's the first visit.
            // Wait, if no cookie, maybe we show nothing or the default one? 
            // The user wants to see their "listed" resolutions.
        }
    } else {
        try {
            resolutions = await prisma.resolution.findMany({
                where: { userId } as any,
                include: {
                    checkIns: {
                        orderBy: { date: 'desc' },
                        take: 30
                    }
                }
            }) as any;
        } catch (error) {
            console.error("Database error in ResolutionsPage:", error);
        }
    }

    const activeResolutions = resolutions.filter(r => r.status === "ACTIVE" || !r.status);
    const archivedResolutions = resolutions.filter(r => r.status === "ARCHIVED");

    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-black dark:text-white mb-2">My Resolutions</h1>
                    <p className="text-neutral-500 text-sm font-medium">Manage and track your active STAR goals.</p>
                </div>
                <Link
                    href="/dashboard/new"
                    className="h-11 px-6 bg-[#00D261] text-white rounded-xl text-xs font-black flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-green-500/20"
                >
                    <Plus className="w-4 h-4" /> Create New Goal
                </Link>
            </div>

            {/* Resolutions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {activeResolutions.length > 0 ? (
                    activeResolutions.map((res) => {
                        const checkIns = res.checkIns || [];
                        const sortedCheckIns = [...checkIns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                        const isWeekly = res.frequency === "WEEKLY";
                        const getStartOfWeek = (d: Date) => {
                            const date = new Date(d);
                            const day = date.getUTCDay();
                            const diff = (day === 0 ? -6 : 1) - day;
                            date.setUTCDate(date.getUTCDate() + diff);
                            date.setUTCHours(0, 0, 0, 0);
                            return date;
                        };

                        const today = new Date();
                        today.setUTCHours(0, 0, 0, 0);
                        const currentWeekStart = getStartOfWeek(today);

                        let streak = 0;
                        if (isWeekly) {
                            let checkWeek = new Date(currentWeekStart);
                            while (true) {
                                const weekDone = checkIns.some((c: any) => {
                                    const d = new Date(c.date);
                                    const ws = getStartOfWeek(d);
                                    return ws.getTime() === checkWeek.getTime() && c.status === "DONE";
                                });
                                if (weekDone) {
                                    streak++;
                                    checkWeek.setUTCDate(checkWeek.getUTCDate() - 7);
                                } else {
                                    if (checkWeek.getTime() === currentWeekStart.getTime()) {
                                        checkWeek.setUTCDate(checkWeek.getUTCDate() - 7);
                                        continue;
                                    }
                                    break;
                                }
                            }
                        } else {
                            for (const ci of sortedCheckIns) {
                                if (ci.status === "DONE") streak++;
                                else break;
                            }
                        }

                        const doneCount = checkIns.filter((c: any) => c.status === "DONE").length;
                        let progress = 0;
                        if (isWeekly) {
                            const uniqueWeeks = new Set(checkIns.filter((c: any) => c.status === "DONE").map((c: any) => getStartOfWeek(new Date(c.date)).getTime())).size;
                            progress = Math.min(Math.round((uniqueWeeks / 4) * 100), 100);
                        } else {
                            progress = Math.min(Math.round((doneCount / 30) * 100), 100);
                        }

                        const todayCheckIn = checkIns.find((c: any) => {
                            const d = new Date(c.date);
                            if (isWeekly) return getStartOfWeek(d).getTime() === currentWeekStart.getTime();
                            return d.getTime() === today.getTime();
                        });

                        return (
                            <ResolutionLargeCard
                                key={res.id}
                                id={res.id}
                                title={res.title}
                                action={res.action}
                                progress={progress}
                                streak={streak}
                                nextDue={res.reminderTime || "6:00 PM"}
                                type={res.frequency || "Daily"}
                                todayStatus={todayCheckIn?.status}
                            />
                        );
                    })
                ) : (
                    <div className="lg:col-span-2 py-20 bg-neutral-50 dark:bg-[#0C0C0C] rounded-[2.5rem] border border-dashed border-neutral-200 dark:border-neutral-800 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-900 rounded-full flex items-center justify-center">
                            <Target className="w-8 h-8 text-neutral-300" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold dark:text-white">No active resolutions</h3>
                            <p className="text-sm text-neutral-500">Start your journey by creating your first goal.</p>
                        </div>
                        <Link href="/dashboard/new" className="text-[#00D261] text-sm font-bold hover:underline">+ Get Started</Link>
                    </div>
                )}
            </div>

            {/* Archived / Completed Section */}
            <section className="space-y-6 !mt-20">
                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest px-1">Completed & Archived</h3>
                <div className="space-y-4">
                    {archivedResolutions.length > 0 ? (
                        archivedResolutions.map(res => (
                            <ArchivedItem
                                key={res.id}
                                title={res.title}
                                completedDate={new Date(res.updatedAt || res.createdAt).toLocaleDateString()}
                                outcome={res.result || "Successfully reached milestone."}
                            />
                        ))
                    ) : (
                        <div className="p-10 bg-neutral-50 dark:bg-[#0C0C0C] rounded-[2rem] border border-dashed border-neutral-200 dark:border-neutral-800 text-center">
                            <p className="text-xs text-neutral-400 font-medium italic">No archived resolutions yet. Keep showing up!</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

function ResolutionLargeCard({ id, title, action, progress, streak, nextDue, type, todayStatus }: { id: string, title: string, action: string, progress: number, streak: number, nextDue: string, type: string, todayStatus?: any }) {
    return (
        <div className="bg-white dark:bg-[#0C0C0C] p-8 rounded-[2.5rem] border border-neutral-100 dark:border-neutral-900 shadow-xl shadow-neutral-200/50 dark:shadow-none space-y-8 group transition-all hover:border-[#00D26150]">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-neutral-50 dark:bg-neutral-900 rounded-2xl flex items-center justify-center border border-neutral-100 dark:border-neutral-800">
                        <Target className="w-6 h-6 text-[#00D261]" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black dark:text-white leading-tight">{title}</h3>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{type} Action</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <form action={deleteResolution}>
                        <input type="hidden" name="id" value={id} />
                        <button type="submit" className="p-2 text-neutral-300 hover:text-red-500 transition-colors">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </form>
                    <Link href={`/dashboard/resolutions/edit/${id}`} className="p-2 text-neutral-300 hover:text-neutral-500 transition-colors">
                        <Pencil className="w-5 h-5" />
                    </Link>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-3 bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                    <Zap className="w-4 h-4 text-[#00D261] fill-[#00D26120]" />
                    <span className="text-xs font-bold dark:text-white truncate">{action}</span>
                </div>

                <div className="space-y-2 px-1">
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">30-Day Progress</span>
                        <span className="text-[10px] font-black text-[#00D261]">{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden border border-neutral-50 dark:border-neutral-900">
                        <div className="h-full bg-[#00D261] rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-50 dark:border-neutral-900">
                <div className="flex gap-8">
                    <div>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Streak</p>
                        <p className="text-sm font-black dark:text-white">{streak} {type === "WEEKLY" ? "Weeks" : "Days"}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Reminder</p>
                        <p className="text-sm font-black dark:text-white">{nextDue}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <CheckInButtons
                        resolutionId={id}
                        initialStatus={todayStatus}
                        compact={true}
                        frequency={type as any}
                    />
                </div>
            </div>
        </div>
    )
}

function ArchivedItem({ title, completedDate, outcome }: { title: string, completedDate: string, outcome: string }) {
    return (
        <div className="bg-white/50 dark:bg-[#0C0C0C]/50 p-6 rounded-3xl border border-dotted border-neutral-200 dark:border-neutral-800 flex items-center justify-between group opacity-80 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-neutral-50 dark:bg-neutral-900 rounded-xl flex items-center justify-center border border-neutral-100 dark:border-neutral-800 text-neutral-300">
                    <StarIcon className="w-4 h-4 fill-neutral-100 dark:fill-neutral-900" />
                </div>
                <div>
                    <h4 className="text-sm font-bold dark:text-white mb-0.5">{title}</h4>
                    <p className="text-[10px] text-neutral-400 font-medium">Completed on {completedDate} • {outcome}</p>
                </div>
            </div>
            <button className="text-[10px] font-bold text-neutral-400 hover:text-[#00D261] transition-colors">Details →</button>
        </div>
    )
}
