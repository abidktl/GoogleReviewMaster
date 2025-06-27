import { Card, CardContent } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/use-reviews";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatsCards() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-lg" />
              </div>
              <Skeleton className="h-4 w-24 mt-4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statItems = [
    {
      title: "Total Reviews",
      value: stats.totalReviews,
      growth: `+${stats.monthlyGrowth.reviews}%`,
      growthLabel: "from last month",
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ),
      bgColor: "bg-blue-50"
    },
    {
      title: "Pending Responses",
      value: stats.pendingResponses,
      growth: "+3",
      growthLabel: "since yesterday",
      icon: (
        <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z"/>
        </svg>
      ),
      bgColor: "bg-orange-50",
      growthColor: "text-red-600"
    },
    {
      title: "Avg Rating",
      value: stats.averageRating,
      growth: `+${stats.monthlyGrowth.rating}`,
      growthLabel: "from last month",
      icon: (
        <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23 12l-2.44-2.78.34-3.68-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.81.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.54 1.89-3.18 3.61-.82-.34-3.68L23 12zm-10 5l-4-4 1.41-1.41L13 14.17l6.59-6.59L21 9l-8 8z"/>
        </svg>
      ),
      bgColor: "bg-green-50"
    },
    {
      title: "Response Rate",
      value: `${stats.responseRate}%`,
      growth: `+${stats.monthlyGrowth.responses}%`,
      growthLabel: "from last month",
      icon: (
        <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/>
        </svg>
      ),
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((stat, index) => (
        <Card key={index} className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                {stat.icon}
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className={stat.growthColor || "text-green-600"}>{stat.growth}</span>
              <span className="text-slate-600 ml-2">{stat.growthLabel}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
