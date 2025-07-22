import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Share2, 
  Mail, 
  Phone,
  Users,
  TrendingUp,
  Clock,
  Eye,
  Edit,
  Trash,
  Calendar,
  BarChart,
  DollarSign,
  Activity,
  Target,
  Send,
  Hash
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { BlogPost, MarketingCampaign } from '@shared/schema';
import { format } from 'date-fns';

interface MarketingDashboardProps {
  projectId: number;
}

interface MarketingMetrics {
  totalPosts: number;
  publishedPosts: number;
  totalViews: number;
  avgReadTime: number;
  emailsSent: number;
  emailOpenRate: number;
  socialPosts: number;
  socialEngagement: number;
}

const mockMetrics: MarketingMetrics = {
  totalPosts: 5,
  publishedPosts: 3,
  totalViews: 1234,
  avgReadTime: 4.5,
  emailsSent: 856,
  emailOpenRate: 24.5,
  socialPosts: 28,
  socialEngagement: 342,
};

export default function MarketingDashboard({ projectId }: MarketingDashboardProps) {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('blog');

  // Fetch blog posts
  const { data: blogPosts = [], isLoading: blogLoading } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog/project', projectId],
    enabled: !!projectId,
  });

  // Fetch marketing campaigns
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery<MarketingCampaign[]>({
    queryKey: ['/api/marketing/campaigns/project', projectId],
    enabled: !!projectId,
  });

  // Generate new blog post
  const generateBlogMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/blog/generate', {
        projectId,
        practiceArea: 'Personal Injury',
        targetKeywords: ['personal injury lawyer', 'accident attorney'],
        tone: 'professional',
        length: 'medium',
        includeLocalSEO: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/project', projectId] });
      toast({
        title: 'Blog Post Generated',
        description: 'A new SEO-optimized article has been created.',
      });
    },
  });

  // Update blog post status
  const updateBlogStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return await apiRequest('PATCH', `/api/blog/${id}`, {
        status,
        publishedAt: status === 'published' ? new Date().toISOString() : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/project', projectId] });
    },
  });

  const metrics = [
    {
      label: 'Blog Posts',
      value: mockMetrics.totalPosts,
      subtext: `${mockMetrics.publishedPosts} published`,
      icon: FileText,
      color: 'text-blue-500',
    },
    {
      label: 'Total Views',
      value: mockMetrics.totalViews.toLocaleString(),
      subtext: `${mockMetrics.avgReadTime} min avg read`,
      icon: Eye,
      color: 'text-green-500',
    },
    {
      label: 'Email Campaigns',
      value: mockMetrics.emailsSent,
      subtext: `${mockMetrics.emailOpenRate}% open rate`,
      icon: Mail,
      color: 'text-purple-500',
    },
    {
      label: 'Social Media',
      value: mockMetrics.socialPosts,
      subtext: `${mockMetrics.socialEngagement} engagements`,
      icon: Share2,
      color: 'text-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.label}
                </CardTitle>
                <metric.icon className={cn("w-4 h-4", metric.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{metric.subtext}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Marketing Content</CardTitle>
              <CardDescription>
                AI-generated content for your law firm
              </CardDescription>
            </div>
            <Button 
              onClick={() => generateBlogMutation.mutate()}
              disabled={generateBlogMutation.isPending}
            >
              Generate New Content
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="blog">Blog Posts</TabsTrigger>
              <TabsTrigger value="social">Social Media</TabsTrigger>
              <TabsTrigger value="email">Email Campaigns</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Blog Posts Tab */}
            <TabsContent value="blog" className="space-y-4">
              {blogLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading blog posts...
                </div>
              ) : blogPosts.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No blog posts yet</p>
                  <Button 
                    className="mt-4"
                    onClick={() => generateBlogMutation.mutate()}
                  >
                    Generate Your First Post
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {blogPosts.map((post) => (
                    <Card key={post.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">{post.title}</CardTitle>
                            <CardDescription>{post.excerpt}</CardDescription>
                          </div>
                          <Badge 
                            variant={post.status === 'published' ? 'default' : 'secondary'}
                          >
                            {post.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {post.readTime} min read
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {post.createdAt ? format(new Date(post.createdAt), 'MMM d, yyyy') : 'Date not available'}
                          </div>
                          {post.keywords && (
                            <div className="flex items-center gap-1">
                              <Hash className="w-4 h-4" />
                              {post.keywords.length} keywords
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          {post.status === 'draft' && (
                            <Button 
                              size="sm"
                              onClick={() => updateBlogStatusMutation.mutate({
                                id: post.id,
                                status: 'published'
                              })}
                            >
                              <Send className="w-4 h-4 mr-1" />
                              Publish
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Social Media Tab */}
            <TabsContent value="social" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Facebook', 'LinkedIn', 'Instagram', 'Twitter'].map((platform) => (
                  <Card key={platform}>
                    <CardHeader>
                      <CardTitle className="text-base">{platform} Posts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm">
                            "Were you injured in an accident? You have rights. 
                            Contact our experienced personal injury attorneys for a free consultation."
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              #PersonalInjury
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              #LegalHelp
                            </Badge>
                          </div>
                        </div>
                        <Button size="sm" className="w-full">
                          Generate New Post
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Email Campaigns Tab */}
            <TabsContent value="email" className="space-y-4">
              <div className="space-y-4">
                {['Welcome Series', 'Monthly Newsletter', 'Case Updates'].map((campaign) => (
                  <Card key={campaign}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{campaign}</CardTitle>
                        <Badge variant="outline">Active</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Sent</p>
                          <p className="font-semibold">245</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Open Rate</p>
                          <p className="font-semibold">28%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Click Rate</p>
                          <p className="font-semibold">12%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Content Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Blog Engagement</span>
                        <span className="text-sm font-semibold">78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Email Performance</span>
                        <span className="text-sm font-semibold">65%</span>
                      </div>
                      <Progress value={65} className="h-2" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Social Reach</span>
                        <span className="text-sm font-semibold">92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Lead Generation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-primary" />
                          <span className="text-sm">Total Leads</span>
                        </div>
                        <span className="text-xl font-bold">342</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Conversion Rate</span>
                        </div>
                        <span className="text-xl font-bold">4.2%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm">ROI</span>
                        </div>
                        <span className="text-xl font-bold">312%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}