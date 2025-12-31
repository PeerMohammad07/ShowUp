import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Filter,
    Calendar as CalendarIcon,
    Star as StarIcon
} from "lucide-react";
import Link from "next/link";

export default async function CalendarPage({
    searchParams
}: {
    searchParams: Promise<{ month?: string; year?: string }>
}) {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    const params = await searchParams;
    const now = new Date();
    const currentMonth = params.month ? parseInt(params.month) : now.getUTCMonth();
    const currentYear = params.year ? parseInt(params.year) : now.getUTCFullYear();

    const userId = session.user.id;
    let resolutions: any[] = [];

    // Data Fetching logic (consistent with Analytics/Dashboard)
    if (userId === "admin-id") {
        const { cookies } = await import("next/headers");
        const mockCookie = (await cookies()).get("mock_resolution");
        if (mockCookie) {
            resolutions = [JSON.parse(mockCookie.value)];
        } else {
            resolutions = [{
                id: "mock-res-id",
                title: "Master the ShowUp App",
                frequency: "DAILY",
                checkIns: [
                    { date: new Date().toISOString(), status: "DONE" },
                    { date: new Date(Date.now() - 86400000).toISOString(), status: "DONE" },
                ]
            }];
        }
    } else {
        try {
            resolutions = await prisma.resolution.findMany({
                where: { userId } as any,
                include: { checkIns: true }
            }) as any;
        } catch (e) {
            console.error("DB Error in Calendar:", e);
        }
    }

    const getStartOfWeek = (d: Date) => {
        const date = new Date(d);
        const day = date.getUTCDay();
        const diff = (day === 0 ? -6 : 1) - day;
        date.setUTCDate(date.getUTCDate() + diff);
        date.setUTCHours(0, 0, 0, 0);
        return date;
    };

    const getRelativeDay = (offset: number) => {
        const d = new Date(now);
        d.setDate(d.getDate() + offset);
        if (offset === 0) return "Today";
        if (offset === 1) return "Tomorrow";
        return d.toLocaleDateString('en-US', { weekday: 'long' });
    };

    // Calendar Calculations
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

    // Map resolutions to days
    const calendarDays = [];
    // Padding from prev month
    for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push({ day: null });

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = new Date(Date.UTC(currentYear, currentMonth, d)).toISOString().split('T')[0];
        const dayCheckIns = resolutions.flatMap(res => {
            const isWeekly = res.frequency === "WEEKLY";
            return (res.checkIns || [])
                .filter((c: any) => {
                    const cDate = new Date(c.date);
                    if (isWeekly) return getStartOfWeek(cDate).getTime() === getStartOfWeek(new Date(Date.UTC(currentYear, currentMonth, d))).getTime();
                    return c.date.startsWith(dateStr);
                })
                .map((c: any) => ({ ...c, title: res.title }));
        });
        calendarDays.push({
            day: d,
            dateStr,
            checkIns: dayCheckIns,
            isToday: now.getUTCDate() === d && now.getUTCMonth() === currentMonth && now.getUTCFullYear() === currentYear
        });
    }

    // Padding for end of grid
    while (calendarDays.length % 7 !== 0) calendarDays.push({ day: null });

    // Summary Stats
    const activeResolutions = resolutions.filter(r => r.status === "ACTIVE" || !r.status);
    let completedMonthCount = 0;

    activeResolutions.forEach(res => {
        const isWeekly = res.frequency === "WEEKLY";
        const resCheckIns = (res.checkIns || []).filter((c: any) => {
            const d = new Date(c.date);
            return d.getUTCMonth() === currentMonth && d.getUTCFullYear() === currentYear;
        });

        if (isWeekly) {
            const weeks = new Set(resCheckIns.filter((c: any) => c.status === "DONE").map((c: any) => getStartOfWeek(new Date(c.date)).getTime())).size;
            completedMonthCount += weeks;
        } else {
            completedMonthCount += resCheckIns.filter((c: any) => c.status === "DONE").length;
        }
    });

    const totalPossible = activeResolutions.length * (daysInMonth / (activeResolutions.some(r => r.frequency === "WEEKLY") ? 7 : 1)); // Simplified consistency
    const consistency = activeResolutions.length > 0 ? Math.round((completedMonthCount / (activeResolutions.length * (daysInMonth / 7 + daysInMonth % 7))) * 100) : 0; // Rough consistency
    const completedMonth = completedMonthCount;

    // Upcoming This Week (Next 3 days for demo/utility)
    const upcoming = resolutions.map(res => ({
        title: res.title,
        frequency: res.frequency
    })).slice(0, 3);

    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-black dark:text-white mb-2">Calendar</h1>
                    <p className="text-neutral-500 text-sm font-medium">Plan and review your habit consistency patterns.</p>
                </div>
                <CalendarViewToggle />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Calendar Grid (8 columns) */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white dark:bg-[#0C0C0C] p-8 rounded-[2.5rem] border border-neutral-100 dark:border-neutral-900 shadow-xl shadow-neutral-200/50 dark:shadow-none">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-black dark:text-white">{months[currentMonth]} {currentYear}</h3>
                            <div className="flex gap-2">
                                <Link
                                    href={`/dashboard/calendar?month=${prevMonth}&year=${prevYear}`}
                                    className="p-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Link>
                                <Link
                                    href={`/dashboard/calendar?month=${nextMonth}&year=${nextYear}`}
                                    className="p-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-px bg-neutral-50 dark:bg-neutral-900 border border-neutral-50 dark:border-neutral-900 rounded-3xl overflow-hidden">
                            {days.map(day => (
                                <div key={day} className="bg-white dark:bg-[#0C0C0C] py-4 text-center text-[10px] font-black text-neutral-400 uppercase tracking-widest">{day}</div>
                            ))}
                            {calendarDays.map((dateObj, i) => {
                                const { day, isToday, checkIns } = dateObj;
                                const hasDone = checkIns?.some(c => c.status === "DONE");
                                const hasMissed = checkIns?.some(c => c.status === "MISSED");

                                return (
                                    <div key={i} className={`bg-white dark:bg-[#0C0C0C] min-h-[100px] p-4 border-[0.5px] border-neutral-50 dark:border-neutral-900 relative transition-all group cursor-pointer ${!day ? 'opacity-30' : 'hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50'}`}>
                                        <span className={`text-xs font-bold ${isToday ? 'text-[#00D261]' : 'text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300'}`}>{day || ''}</span>
                                        <div className="mt-2 space-y-1">
                                            {hasDone && <div className="h-1.5 w-full bg-[#00D261] rounded-full shadow-sm shadow-green-500/10" />}
                                            {hasMissed && <div className="h-1.5 w-[60%] bg-red-500/80 rounded-full" />}
                                        </div>
                                        {isToday && <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-[#00D261] rounded-full" />}

                                        {/* Hover Tooltip for check-ins */}
                                        {day && checkIns && checkIns.length > 0 && (
                                            <div className="absolute inset-x-0 bottom-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm z-10 pointer-events-none">
                                                {checkIns.map((c, idx) => (
                                                    <p key={idx} className="text-[8px] font-bold truncate dark:text-white">
                                                        {c.status === "DONE" ? "✓" : "✗"} {c.title}
                                                    </p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center gap-8 px-6">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#00D261] rounded-full" />
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Action Completed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-400 rounded-full" />
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Missed Opportunity</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full" />
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Upcoming</span>
                        </div>
                    </div>
                </div>

                {/* Schedule / Summary (4 columns) */}
                <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-28 self-start">
                    <div className="bg-white dark:bg-[#0C0C0C] p-8 rounded-[2.5rem] border border-neutral-100 dark:border-neutral-900 shadow-xl shadow-neutral-200/50 dark:shadow-none space-y-6">
                        <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest px-1">Upcoming This Week</h3>
                        <div className="space-y-4">
                            {activeResolutions.length > 0 ? (
                                <>
                                    <UpcomingDay day={getRelativeDay(0)} actions={[activeResolutions[0].title]} />
                                    {activeResolutions[1] && <UpcomingDay day={getRelativeDay(1)} actions={[activeResolutions[1].title]} />}
                                    {activeResolutions[2] && <UpcomingDay day={getRelativeDay(2)} actions={[activeResolutions[2].title]} />}
                                </>
                            ) : (
                                <p className="text-xs text-neutral-400 text-center py-4">No scheduled actions.</p>
                            )}
                        </div>
                        <Link href="/dashboard/new" className="block w-full py-4 bg-[#00D261] text-center text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-green-500/20 hover:scale-[1.02] active:scale-95 transition-all mt-4">+ Log Action Early</Link>
                    </div>

                    <div className="bg-[#0C0C0C] dark:bg-white p-8 rounded-[2.5rem] text-white dark:text-black space-y-4">
                        <h4 className="text-sm font-black flex items-center gap-2"><StarIcon className="w-4 h-4 text-[#00D261] fill-[#00D261]" /> Monthly Summary</h4>
                        <div className="space-y-3 pt-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="opacity-60">Consistency</span>
                                <span className="font-bold">{consistency}%</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="opacity-60">Total Done</span>
                                <span className="font-bold">{completedMonth} Actions</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CalendarViewToggle() {
    return (
        <div className="flex gap-2 bg-white dark:bg-[#0C0C0C] p-1 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
            {['Month', 'Week', 'Day'].map((v) => (
                <button
                    key={v}
                    className={`px-4 py-2 text-[10px] font-bold rounded-lg transition-all ${v === 'Month'
                        ? "bg-neutral-50 dark:bg-neutral-900 dark:text-white shadow-sm border border-neutral-100 dark:border-neutral-800"
                        : "text-neutral-400 hover:text-neutral-500"}`}
                >
                    {v}
                </button>
            ))}
        </div>
    );
}

function UpcomingDay({ day, actions }: { day: string, actions: string[] }) {
    return (
        <div className="p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl space-y-2">
            <h4 className="text-[10px] font-black text-[#00D261] uppercase tracking-widest">{day}</h4>
            <div className="space-y-1">
                {actions.map((act, i) => (
                    <div key={act} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full" />
                        <span className="text-xs font-bold dark:text-white truncate">{act}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
