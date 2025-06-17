
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle, FileText, Copy, Trash2 } from 'lucide-react';

interface AnalysisStats {
  totalLines: number;
  completeMatches: number;
  missingUpvf: number;
  missingUpvc: number;
  missingBoth: number;
  orphanFiles: number;
  duplicateLines: number;
  blankLines: number;
  malformedEntries: number;
}

interface StatsOverviewProps {
  stats: AnalysisStats;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  const completionRate = stats.totalLines > 0 ? (stats.completeMatches / stats.totalLines * 100).toFixed(1) : '0';

  const statCards = [
    {
      title: 'Total Lines',
      value: stats.totalLines,
      icon: FileText,
      color: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    {
      title: 'Complete Matches',
      value: stats.completeMatches,
      icon: CheckCircle2,
      color: 'bg-green-100 text-green-800 border-green-200',
      subtitle: `${completionRate}% completion rate`,
    },
    {
      title: 'Missing Files',
      value: stats.missingUpvf + stats.missingUpvc + stats.missingBoth,
      icon: XCircle,
      color: 'bg-red-100 text-red-800 border-red-200',
    },
    {
      title: 'Orphan Files',
      value: stats.orphanFiles,
      icon: AlertCircle,
      color: 'bg-orange-100 text-orange-800 border-orange-200',
    },
  ];

  const detailStats = [
    { label: 'Missing UPVF only', value: stats.missingUpvf },
    { label: 'Missing UPVC only', value: stats.missingUpvc },
    { label: 'Missing both files', value: stats.missingBoth },
    { label: 'Duplicate line numbers', value: stats.duplicateLines },
    { label: 'Blank lines skipped', value: stats.blankLines },
    { label: 'Malformed entries', value: stats.malformedEntries },
  ];

  return (
    <div className="space-y-4">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${stat.color.replace('text-', 'text-').replace('border-', '')}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  {stat.subtitle && (
                    <p className="text-xs text-gray-500">{stat.subtitle}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {detailStats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-lg font-semibold">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsOverview;
