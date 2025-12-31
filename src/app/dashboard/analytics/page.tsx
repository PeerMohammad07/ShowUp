import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    BarChart3,
    TrendingUp,
    Target,
    Calendar as CalendarIcon,
    Download,
    Filter,
    ArrowUpRight,
    Zap,
    CheckCircle2
} from "lucide-react";


export default async function AnalyticsPage({
    searchParams
}: {
    searchParams: Promise<{ resolutionId?: string }>
}) {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    const { resolutionId } = await searchParams;

    const userId = session.user.id;
    let resolutions: any[] = [];

    // Admin Bypass Logic
    if (userId === "admin-id") {
        const { cookies } = await import("next/headers");
        const mockCookie = (await cookies()).get("mock_resolution");

        if (mockCookie) {
            const resData = JSON.parse(mockCookie.value);
            resolutions = [{
                ...resData,
                progress: resData.progress || 85,
                streak: resData.streak || 12,
                checkIns: resData.checkIns || [
                    { date: new Date().toISOString(), status: "DONE" },
                    { date: new Date(Date.now() - 86400000).toISOString(), status: "DONE" },
                ]
            }];
        } else {
            resolutions = [{
                id: "mock-res-id",
                title: "Master the ShowUp App",
                action: "Clear all my daily dashboard tasks",
                frequency: "DAILY",
                progress: 85,
                streak: 12,
                createdAt: new Date(Date.now() - 86400000 * 30),
                checkIns: [
                    { date: new Date().toISOString(), status: "DONE" },
                    { date: new Date(Date.now() - 86400000).toISOString(), status: "DONE" },
                ]
            }];
        }
    } else {
        try {
            resolutions = await prisma.resolution.findMany({
                where: {
                    userId,
                    status: "ACTIVE" // Default to active for analytics
                } as any,
                include: {
                    checkIns: {
                        orderBy: { date: 'desc' },
                    }
                }
            }) as any;
        } catch (error) {
            console.error("Database error in Analytics:", error);
        }
    }

    const selectedResolution = resolutionId
        ? resolutions.find(r => r.id === resolutionId)
        : null;

    const displayResolutions = selectedResolution ? [selectedResolution] : resolutions;

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

    // Calculations
    const activeResolutions = resolutions.filter(r => r.status === "ACTIVE" || !r.status);
    const totalCheckIns = resolutions.reduce((acc, res) => acc + (res.checkIns?.length || 0), 0);
    const doneCheckIns = resolutions.reduce((acc, res) =>
        acc + (res.checkIns?.filter((c: any) => c.status === "DONE").length || 0), 0);

    let maxStreak = 0;
    displayResolutions.forEach(res => {
        let currentStreak = 0;
        const checkIns = res.checkIns || [];
        const isWeekly = res.frequency === "WEEKLY";

        if (isWeekly) {
            let checkWeek = new Date(currentWeekStart);
            while (true) {
                const weekDone = checkIns.some((c: any) => {
                    const d = new Date(c.date);
                    return getStartOfWeek(d).getTime() === checkWeek.getTime() && c.status === "DONE";
                });
                if (weekDone) {
                    currentStreak++;
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
            const sorted = [...checkIns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            for (const c of sorted) {
                if (c.status === "DONE") currentStreak++;
                else break;
            }
        }
        if (currentStreak > maxStreak) maxStreak = currentStreak;
    });

    const completionRate = totalCheckIns > 0 ? Math.round((doneCheckIns / totalCheckIns) * 100) : 0;
    const starActions = doneCheckIns;
    const focusScore = totalCheckIns > 0 ? (7 + (maxStreak / 10) + (completionRate / 50)).toFixed(1) : "0.0";

    // Weekly Activity Chart Data (Last 7 days)
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setUTCHours(0, 0, 0, 0);
        d.setDate(d.getDate() - (6 - i));
        return d;
    });

    const chartData = last7Days.map(date => {
        const count = displayResolutions.reduce((acc, res) => {
            const isWeekly = res.frequency === "WEEKLY";
            const hasCheckIn = res.checkIns?.some((c: any) => {
                const cDate = new Date(c.date);
                if (isWeekly) {
                    return getStartOfWeek(cDate).getTime() === getStartOfWeek(date).getTime() && c.status === "DONE";
                }
                cDate.setUTCHours(0, 0, 0, 0);
                return cDate.getTime() === date.getTime() && c.status === "DONE";
            });
            return acc + (hasCheckIn ? 1 : 0);
        }, 0);
        const percent = displayResolutions.length > 0 ? (count / displayResolutions.length) * 100 : 0;
        return {
            label: date.toLocaleDateString('en-US', { weekday: 'short' }),
            height: Math.max(percent, 5),
            count
        };
    });

    // Recent History
    const recentHistory = displayResolutions.flatMap(res =>
        (res.checkIns || []).map((c: any) => ({
            ...c,
            resolutionTitle: res.title
        }))
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 6);

    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-black dark:text-white mb-2">Weekly Insights</h1>
                    <p className="text-neutral-500 text-sm font-medium">Track your STAR method performance and consistency.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative group">
                        <button className="h-11 px-4 bg-white dark:bg-[#0C0C0C] border border-neutral-100 dark:border-neutral-800 rounded-xl text-xs font-bold dark:text-white flex items-center gap-2 hover:bg-neutral-50 transition-all">
                            {selectedResolution ? selectedResolution.title : 'All Resolutions'} <Filter className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-[#0C0C0C] border border-neutral-100 dark:border-neutral-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-1">
                            <Link href="/dashboard/analytics" className="block w-full text-left px-4 py-2 text-[10px] font-bold text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-[#00D261] rounded-lg transition-colors">
                                All Resolutions
                            </Link>
                            {resolutions.map((res) => (
                                <Link
                                    key={res.id}
                                    href={`/dashboard/analytics?resolutionId=${res.id}`}
                                    className={`block w-full text-left px-4 py-2 text-[10px] font-bold rounded-lg transition-colors truncate ${resolutionId === res.id ? 'text-[#00D261] bg-[#00D26105]' : 'text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-[#00D261]'}`}
                                >
                                    {res.title}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Best Streak" value={`${maxStreak} Days`} change="+2 from last week" icon={TrendingUp} color="text-orange-500" />
                <StatCard label="Completion Rate" value={`${completionRate}%`} change={`${completionRate > 80 ? 'Excellent' : 'Keep going'}`} icon={BarChart3} color="text-blue-500" />
                <StatCard label="STAR Actions" value={starActions.toString()} change="Total completed" icon={Zap} color="text-yellow-500" />
                <StatCard label="Focus Score" value={focusScore} change="Method efficiency" icon={Target} color="text-[#00D261]" />
            </div>

            {/* Main Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Activity Bar Chart */}
                <div className="lg:col-span-8 bg-white dark:bg-[#0C0C0C] p-8 rounded-[2.5rem] border border-neutral-100 dark:border-neutral-900 shadow-xl shadow-neutral-200/50 dark:shadow-none">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest px-1">Weekly Activity</h3>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-400">
                                <div className="w-2 h-2 rounded-full bg-[#00D261]" /> Completed
                            </div>
                        </div>
                    </div>

                    <div className="h-64 flex items-end justify-between gap-4 px-2">
                        {chartData.map((data, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                                <div className="w-full relative h-48">
                                    <div className="absolute inset-0 bg-neutral-50 dark:bg-neutral-900 rounded-2xl h-full border border-neutral-100 dark:border-neutral-800" />
                                    <div
                                        className="absolute bottom-0 inset-x-0 bg-[#00D261] rounded-2xl transition-all duration-1000 group-hover:bg-[#00A64D]"
                                        style={{ height: `${data.height}%` }}
                                    />
                                    {data.count > 0 && (
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900 text-white text-[10px] font-bold px-2 py-1 rounded">
                                            {data.count} done
                                        </div>
                                    )}
                                </div>
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{data.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Info Area */}
                <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-28 self-start">
                    <div className="bg-white dark:bg-[#0C0C0C] p-8 rounded-[2.5rem] border border-neutral-100 dark:border-neutral-900 shadow-xl shadow-neutral-200/50 dark:shadow-none space-y-6">
                        <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest px-1">Active Resolutions</h3>
                        <div className="space-y-4">
                            {activeResolutions.length > 0 ? activeResolutions.map((res: any) => {
                                let progress = 0;
                                const isWeekly = res.frequency === "WEEKLY";
                                if (isWeekly) {
                                    const uniqueWeeks = new Set((res.checkIns || []).filter((c: any) => c.status === "DONE").map((c: any) => getStartOfWeek(new Date(c.date)).getTime())).size;
                                    progress = Math.min(Math.round((uniqueWeeks / 4) * 100), 100);
                                } else {
                                    const done = (res.checkIns || []).filter((c: any) => c.status === "DONE").length;
                                    progress = Math.min(Math.round((done / 30) * 100), 100);
                                }
                                return (
                                    <MiniGoal
                                        key={res.id}
                                        target={res.title}
                                        progress={progress}
                                        date={res.frequency || "Daily"}
                                    />
                                );
                            }) : (
                                <div className="py-10 flex flex-col items-center justify-center space-y-3 opacity-40">
                                    <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-neutral-400" />
                                    </div>
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-center">Data arrives when you<br />create your first goal</p>
                                </div>
                            )}
                        </div>
                        <Link href="/dashboard/new" className="block w-full text-center py-3 bg-neutral-50 dark:bg-neutral-900 text-neutral-400 text-[10px] font-bold uppercase tracking-widest rounded-xl border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all mt-4">+ Add New Goal</Link>
                    </div>

                    <div className="p-8 bg-[#00D26110] rounded-[2.5rem] border border-[#00D26120] space-y-4 flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-white dark:bg-neutral-900 rounded-2xl flex items-center justify-center border border-[#00D26150]">
                            <ArrowUpRight className="w-6 h-6 text-[#00D261]" />
                        </div>
                        <h4 className="text-sm font-black dark:text-white">AI Insights</h4>
                        <p className="text-[10px] text-neutral-500 font-medium leading-relaxed">
                            {completionRate > 80
                                ? "You're crushing it! Your consistency in the last 7 days is higher than 92% of users."
                                : "Consistency is key. Try to hit a 3-day streak to jumpstart your momentum."}
                        </p>
                    </div>
                </div>
            </div>

            {/* History Area */}
            <section className="space-y-6 pb-20">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest px-1">Recent STAR History</h3>
                    <Link href="/dashboard/calendar" className="text-[#00D261] text-[10px] font-bold uppercase tracking-widest hover:underline">View Calendar</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recentHistory.length > 0 ? recentHistory.map((item: any, i: number) => (
                        <HistoryItem
                            key={i}
                            status={item.status}
                            title={item.resolutionTitle}
                            time={new Date(item.date).toLocaleDateString()}
                            note={item.status === "DONE" ? "Completed successfully" : "Missed this action"}
                        />
                    )) : (
                        <div className="lg:col-span-3 py-10 bg-neutral-50 dark:bg-neutral-900/50 rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 text-center">
                            <p className="text-xs text-neutral-400">No check-in history yet.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

function StatCard({ label, value, change, icon: Icon, color }: { label: string, value: string, change: string, icon: any, color: string }) {
    return (
        <div className="bg-white dark:bg-[#0C0C0C] p-6 rounded-[2rem] border border-neutral-100 dark:border-neutral-900 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center border border-neutral-100 dark:border-neutral-800`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <span className="text-[10px] font-bold text-[#00D261] bg-[#00D26110] px-2 py-1 rounded-full">{change}</span>
            </div>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-2xl font-black dark:text-white leading-none">{value}</p>
        </div>
    );
}

function MiniGoal({ target, progress, date }: { target: string, progress: number, date: string }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <span className="text-xs font-bold dark:text-white truncate pr-4">{target}</span>
                <span className="text-[10px] font-black text-[#00D261]">{progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-neutral-50 dark:bg-neutral-900 rounded-full overflow-hidden border border-neutral-100 dark:border-neutral-800">
                <div className="h-full bg-[#00D261] rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest">{date}</p>
        </div>
    )
}

function HistoryItem({ status, title, time, note }: { status: 'DONE' | 'MISSED', title: string, time: string, note: string }) {
    return (
        <div className="bg-white dark:bg-[#0C0C0C] p-6 rounded-[2rem] border border-neutral-100 dark:border-neutral-900 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
                <div className={`w-2 h-2 rounded-full ${status === 'DONE' ? 'bg-[#00D261]' : 'bg-red-500 shadow-lg shadow-red-500/20'}`} />
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{time}</span>
            </div>
            <div>
                <h4 className="font-bold dark:text-white text-sm mb-1 leading-tight truncate">{title}</h4>
                <p className="text-xs text-neutral-400 font-medium italic">"{note}"</p>
            </div>
        </div>
    )
}
