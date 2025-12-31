import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
    Trophy,
    Flame,
    Clock,
    Star,
    ChevronRight,
    CheckCircle2,
    TrendingUp,
    Target
} from "lucide-react";
import Link from "next/link";
import { CheckInButtons } from "@/components/check-in-buttons";

export default async function Dashboard() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    const userId = session.user.id;
    let resolution: any = null;

    // Admin Bypass Logic (Check Cookie first, then default mock)
    if (userId === "admin-id") {
        const { cookies } = await import("next/headers");
        const mockCookie = (await cookies()).get("mock_resolution");

        if (mockCookie) {
            resolution = JSON.parse(mockCookie.value);
            // Add some default check-ins if they don't exist
            if (!resolution.checkIns) {
                resolution.checkIns = [
                    { date: new Date().toISOString(), status: "DONE" },
                    { date: new Date(Date.now() - 86400000).toISOString(), status: "DONE" },
                ];
            }
        } else {
            // Default mock if no cookie exists
            resolution = {
                id: "mock-res-id",
                title: "Master the ShowUp App",
                action: "Clear all my daily dashboard tasks",
                reminderTime: "09:00 AM",
                checkIns: [
                    { date: new Date().toISOString(), status: "DONE" },
                    { date: new Date(Date.now() - 86400000).toISOString(), status: "DONE" },
                ]
            };
        }
    } else {
        try {
            resolution = await prisma.resolution.findFirst({
                where: {
                    userId: userId,
                    status: "ACTIVE"
                } as any,
                include: {
                    checkIns: {
                        orderBy: { date: 'desc' },
                        take: 30
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }) as any;
        } catch (error) {
            console.error("Database error in Dashboard:", error);
        }
    }

    if (!resolution) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center space-y-8">
                <div className="w-24 h-24 bg-[#00D26115] rounded-full flex items-center justify-center mb-4">
                    <Target className="w-10 h-10 text-[#00D261]" />
                </div>
                <div className="max-w-md space-y-3">
                    <h1 className="text-4xl font-black dark:text-white tracking-tight">Focus on what matters.</h1>
                    <p className="text-neutral-500 font-medium">Welcome to ShowUp. It's time to transform your vague intentions into concrete reality using behavioral science.</p>
                </div>
                <Link
                    href="/dashboard/new"
                    className="h-14 px-10 bg-[#00D261] text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-green-500/20 flex items-center gap-3"
                >
                    Create Your First Resolution <ChevronRight className="w-5 h-5" />
                </Link>
            </div>
        );
    }

    const checkIns = resolution.checkIns as any[] || [];
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const isWeekly = resolution.frequency === "WEEKLY";

    // Get start of current week (Monday)
    const getStartOfWeek = (d: Date) => {
        const date = new Date(d);
        const day = date.getUTCDay();
        const diff = (day === 0 ? -6 : 1) - day; // Adjust for Monday start
        date.setUTCDate(date.getUTCDate() + diff);
        date.setUTCHours(0, 0, 0, 0);
        return date;
    };

    const currentWeekStart = getStartOfWeek(today);

    let streak = 0;
    const sortedCheckIns = [...checkIns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (isWeekly) {
        // Weekly Streak Logic: How many consecutive weeks have at least one DONE check-in
        let checkWeek = new Date(currentWeekStart);
        while (true) {
            const weekDone = checkIns.some(c => {
                const d = new Date(c.date);
                const ws = getStartOfWeek(d);
                return ws.getTime() === checkWeek.getTime() && c.status === "DONE";
            });
            if (weekDone) {
                streak++;
                checkWeek.setUTCDate(checkWeek.getUTCDate() - 7);
            } else {
                // Special case: if it's the current week and we haven't done it yet, 
                // don't break the streak unless the week is over.
                if (checkWeek.getTime() === currentWeekStart.getTime()) {
                    checkWeek.setUTCDate(checkWeek.getUTCDate() - 7);
                    continue;
                }
                break;
            }
        }
    } else {
        // Daily Streak Logic
        for (const checkIn of sortedCheckIns) {
            if (checkIn.status === "DONE") {
                streak++;
            } else {
                break;
            }
        }
    }

    const doneCount = checkIns.filter((c: any) => c.status === "DONE").length;

    // Progress Calculation
    let progressPercent = 0;
    if (isWeekly) {
        // For weekly, progress is (weeks with check-ins / total weeks in 30 days ~4)
        const uniqueWeeks = new Set(checkIns.filter((c: any) => c.status === "DONE").map(c => getStartOfWeek(new Date(c.date)).getTime())).size;
        progressPercent = Math.min(Math.round((uniqueWeeks / 4) * 100), 100);
    } else {
        progressPercent = Math.min(Math.round((doneCount / 30) * 100), 100);
    }

    const todayCheckIn = checkIns.find((c: any) => {
        const d = new Date(c.date);
        if (isWeekly) {
            return getStartOfWeek(d).getTime() === currentWeekStart.getTime();
        }
        return d.getTime() === today.getTime();
    });

    const hour = (new Date()).getHours();
    const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

                {/* Main Content Area (8 columns) */}
                <div className="lg:col-span-8 space-y-10">
                    <header>
                        <h1 className="text-2xl lg:text-3xl font-black dark:text-white mb-2">{greeting}, {session.user.name?.split(' ')[0] || "User"}!</h1>
                        <p className="text-neutral-500 text-sm font-medium">Keep up the momentum. You're on a <span className="text-orange-500 font-bold">{streak}-day streak.</span></p>
                    </header>

                    {/* Daily Micro-Action Card */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Daily Micro-Action</h3>
                            <span className="px-3 py-1 bg-[#00D26115] text-[#00D261] text-[10px] font-bold rounded-full uppercase tracking-widest">High Priority</span>
                        </div>

                        <div className="aspect-[16/8] relative rounded-[2.5rem] overflow-hidden shadow-2xl group border-none">
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-10 flex flex-col justify-between">
                                <div>
                                    <div className="px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 inline-flex items-center gap-2 text-white">
                                        <Clock className="w-3.5 h-3.5 text-[#00D261]" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Reminder: {resolution.reminderTime || "06:00 PM"}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest mb-1 opacity-80">Today's Focus</p>
                                        <h4 className="text-3xl lg:text-4xl font-black text-white leading-tight">{resolution.action}</h4>
                                    </div>

                                    <div className="flex shrink-0">
                                        <CheckInButtons
                                            resolutionId={resolution.id}
                                            initialStatus={todayCheckIn?.status as any}
                                            frequency={resolution.frequency}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Stats Grid */}
                    <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatSmall icon={Flame} color="text-orange-500" label="Streak" value={`${streak} ${isWeekly ? 'Weeks' : 'Days'}`} />
                        <StatSmall icon={CheckCircle2} color="text-blue-500" label="Done" value={`${doneCount} ${isWeekly ? 'Weeks' : 'Days'}`} />
                        <StatSmall icon={Star} color="text-yellow-500" label="Actions" value={`${doneCount}`} />
                        <StatSmall icon={TrendingUp} color="text-[#00D261]" label="Progress" value={`${progressPercent}%`} />
                    </section>

                    {/* Up Next Section */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Upcoming</h3>
                            <Link href="/dashboard/calendar" className="text-[#00D261] text-xs font-bold hover:underline">View Calendar</Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ScheduleItem
                                date={new Date(Date.now() + 86400000).getDate().toString()}
                                month="Tomorrow"
                                title={resolution.title}
                                details={`${resolution.frequency} • ${resolution.reminderTime || "Scheduled"}`}
                            />
                            <ScheduleItem
                                date={new Date(Date.now() + 172800000).getDate().toString()}
                                month={new Date(Date.now() + 172800000).toLocaleDateString('en-US', { weekday: 'short' })}
                                title={resolution.title}
                                details="Keep the momentum"
                            />
                        </div>
                    </section>
                </div>

                {/* Right Sidebar Area (4 columns) */}
                <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-28 self-start">
                    {/* Progress Overview Card */}
                    <div className="bg-white dark:bg-[#0C0C0C] p-8 rounded-[2.5rem] border border-neutral-100 dark:border-neutral-900 shadow-xl shadow-neutral-200/50 dark:shadow-none">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Main Goal</h3>
                            <div className="w-8 h-8 bg-neutral-50 dark:bg-neutral-900 rounded-xl flex items-center justify-center border border-neutral-100 dark:border-neutral-800">
                                <Target className="w-4 h-4 text-[#00D261]" />
                            </div>
                        </div>

                        <div className="flex flex-col items-center py-6">
                            <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="96"
                                        cy="96"
                                        r="80"
                                        fill="transparent"
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        className="text-neutral-100 dark:text-neutral-900"
                                    />
                                    <circle
                                        cx="96"
                                        cy="96"
                                        r="80"
                                        fill="transparent"
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        strokeDasharray={502.4}
                                        strokeDashoffset={502.4 - (502.4 * progressPercent) / 100}
                                        strokeLinecap="round"
                                        className="text-[#00D261] transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-black dark:text-white leading-none">{progressPercent}%</span>
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Complete</span>
                                </div>
                            </div>
                            <h4 className="text-xl font-black dark:text-white text-center mb-2">{resolution.title}</h4>
                            <p className="text-xs text-neutral-400 font-medium text-center px-4">Consistency is king. You're doing better than 85% of users!</p>
                        </div>

                        <div className="mt-8 pt-8 border-t border-neutral-50 dark:border-neutral-900 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">STAR Method Status</span>
                                <span className="text-[10px] font-bold text-[#00D261] uppercase tracking-widest">Active</span>
                            </div>
                            <div className="flex gap-2">
                                {['S', 'T', 'A', 'R'].map(letter => (
                                    <div key={letter} className="flex-1 h-8 bg-neutral-50 dark:bg-neutral-900 rounded-lg flex items-center justify-center border border-neutral-100 dark:border-neutral-800 text-[10px] font-black text-neutral-300">
                                        {letter}
                                    </div>
                                ))}
                            </div>
                            <button className="w-full py-3 bg-neutral-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 text-[10px] font-bold uppercase tracking-widest rounded-xl border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all">
                                View Full Details
                            </button>
                        </div>
                    </div>

                    {/* New Year, New You Promotion */}
                    <div className="bg-gradient-to-br from-[#00D261] to-[#00A64D] p-8 rounded-[2.5rem] text-white shadow-xl shadow-green-500/30 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-120" />
                        <h3 className="text-xl font-black mb-2 relative z-10">New Year, New You?</h3>
                        <p className="text-xs text-white/80 font-medium mb-6 leading-relaxed relative z-10">Start tracking a new resolution using the STAR method today.</p>
                        <Link
                            href="/dashboard/new"
                            className="w-full h-12 bg-white text-[#00D261] text-xs font-black rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg relative z-10"
                        >
                            + Create Resolution
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatSmall({ icon: Icon, color, label, value }: { icon: any, color: string, label: string, value: string }) {
    return (
        <div className="bg-white dark:bg-[#0C0C0C] p-5 rounded-3xl border border-neutral-100 dark:border-neutral-900 shadow-sm flex flex-col items-center lg:items-start">
            <div className={`w-8 h-8 rounded-xl bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center mb-3 border border-neutral-100 dark:border-neutral-800`}>
                <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-lg font-black dark:text-white leading-none">{value}</p>
        </div>
    );
}

function ScheduleItem({ date, month, title, details }: { date: string, month: string, title: string, details: string }) {
    return (
        <div className="bg-white dark:bg-[#0C0C0C] p-4 rounded-3xl border border-neutral-100 dark:border-neutral-900 flex items-center gap-4 hover:border-[#00D26150] transition-all cursor-pointer group shadow-sm">
            <div className="flex flex-col items-center justify-center w-12 h-12 bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 transition-colors group-hover:bg-[#00D26110]">
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-tighter">{month}</span>
                <span className="text-lg font-black dark:text-white leading-none">{date}</span>
            </div>
            <div className="flex-1 overflow-hidden">
                <h4 className="font-bold dark:text-white text-sm truncate group-hover:text-[#00D261] transition-colors">{title}</h4>
                <p className="text-[10px] text-neutral-400 font-medium truncate">{details}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-200 group-hover:text-neutral-400 transition-colors shrink-0" />
        </div>
    );
}
