import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart,
  LineChart,
  TrendingUp,
  TrendingDown,
  Clock,
  MessageSquare,
  Brain,
  Zap,
  Target,
  Award,
  ChevronRight,
  Lightbulb,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface ProductivityStats {
  totalActiveTime: number;
  totalMessages: number;
  totalAiInteractions: number;
  averageSessionTime: number;
  messagesPerHour: number;
  peakProductivityHour: number;
  sessionCount: number;
}

interface LayoutRecommendation {
  id: number;
  projectType: string;
  recommendedLayout: any;
  recommendedPanelSizes: number[];
  reason: string;
  confidenceScore: number;
  productivityImprovement?: number;
  accepted: boolean;
}

interface AnalyticsDashboardProps {
  projectId: number;
  userId: number;
  onApplyRecommendation: (recommendation: LayoutRecommendation) => void;
}

export default function AnalyticsDashboard({ 
  projectId, 
  userId,
  onApplyRecommendation 
}: AnalyticsDashboardProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const { toast } = useToast();

  // Fetch productivity stats
  const { data: stats, isLoading: statsLoading } = useQuery<ProductivityStats>({
    queryKey: [`/api/analytics/stats/${projectId}`],
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch layout recommendations
  const { data: recommendations, isLoading: recsLoading } = useQuery<LayoutRecommendation[]>({
    queryKey: [`/api/analytics/recommendations/${userId}`],
  });

  // Accept recommendation mutation
  const acceptRecommendation = useMutation({
    mutationFn: async (recommendation: LayoutRecommendation) => {
      await apiRequest('POST', `/api/analytics/recommendations/${recommendation.id}/accept`);
      return recommendation;
    },
    onSuccess: (recommendation) => {
      queryClient.invalidateQueries({ queryKey: [`/api/analytics/recommendations/${userId}`] });
      onApplyRecommendation(recommendation);
      toast({
        title: "Layout Applied",
        description: "The recommended layout has been applied to your workspace.",
      });
    },
  });

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const getProductivityTrend = () => {
    if (!stats || stats.sessionCount < 2) return null;
    const avgTime = stats.averageSessionTime;
    const currentTime = stats.totalActiveTime / stats.sessionCount;
    const improvement = ((currentTime - avgTime) / avgTime) * 100;
    return {
      value: Math.abs(improvement),
      isPositive: improvement > 0,
    };
  };

  const trend = getProductivityTrend();

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 border-purple-600/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Active Time</p>
                <p className="text-2xl font-bold text-white">
                  {formatTime(stats?.totalActiveTime || 0)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-600/10 to-cyan-600/10 border-blue-600/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Messages Sent</p>
                <p className="text-2xl font-bold text-white">
                  {stats?.totalMessages || 0}
                </p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-600/10 to-emerald-600/10 border-green-600/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">AI Interactions</p>
                <p className="text-2xl font-bold text-white">
                  {stats?.totalAiInteractions || 0}
                </p>
              </div>
              <Brain className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-600/10 to-red-600/10 border-orange-600/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Messages/Hour</p>
                <p className="text-2xl font-bold text-white">
                  {stats?.messagesPerHour?.toFixed(1) || '0'}
                </p>
              </div>
              <Zap className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Productivity Insights */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Productivity Insights</span>
            {trend && (
              <Badge variant={trend.isPositive ? "default" : "secondary"} className="flex items-center gap-1">
                {trend.isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {trend.value.toFixed(1)}%
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Peak Productivity Hour</span>
              <span className="text-white font-medium">
                {stats?.peakProductivityHour !== undefined 
                  ? `${stats.peakProductivityHour}:00 - ${stats.peakProductivityHour + 1}:00`
                  : 'Not enough data'}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Average Session Time</span>
              <span className="text-white font-medium">
                {formatTime(stats?.averageSessionTime || 0)}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total Sessions</span>
              <span className="text-white font-medium">{stats?.sessionCount || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layout Recommendations */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            AI Layout Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : recommendations && recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border ${
                    rec.accepted 
                      ? 'bg-green-900/20 border-green-600/30' 
                      : 'bg-gray-800/50 border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {rec.projectType}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(rec.confidenceScore * 100)}% confidence
                        </Badge>
                        {rec.productivityImprovement && (
                          <Badge variant="default" className="text-xs bg-green-600">
                            +{rec.productivityImprovement}% productivity
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-300 mb-3">{rec.reason}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Recommended panel sizes:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{rec.recommendedPanelSizes[0]}%</span>
                          <span>|</span>
                          <span className="font-mono">{rec.recommendedPanelSizes[1]}%</span>
                          <span>|</span>
                          <span className="font-mono">{rec.recommendedPanelSizes[2]}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      {rec.accepted ? (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Applied
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => acceptRecommendation.mutate(rec)}
                          disabled={acceptRecommendation.isPending}
                          className="bg-gradient-to-r from-purple-600 to-pink-600"
                        >
                          Apply
                          <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">
                Keep using the workspace to generate personalized layout recommendations.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                We need at least 5 sessions to analyze your productivity patterns.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}