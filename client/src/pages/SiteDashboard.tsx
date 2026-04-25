import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Globe, TrendingUp, Users, Plus, ExternalLink, Trash2, Settings, FileCode, Sparkles } from 'lucide-react';

interface Site {
  id: number;
  domain: string;
  name: string;
  status: 'draft' | 'building' | 'live' | 'paused' | 'error';
  leadCount: number;
  seoScore: number;
  monthlyVisitors: number;
  category: string;
  createdAt: string;
  config?: any;
}

interface SiteStats {
  total: number;
  live: number;
  totalLeads: number;
  totalVisitors: number;
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  building: 'bg-yellow-100 text-yellow-700',
  live: 'bg-green-100 text-green-700',
  paused: 'bg-orange-100 text-orange-700',
  error: 'bg-red-100 text-red-700',
};

async function apiFetch(path: string, options?: RequestInit) {
  const token = localStorage.getItem('accessToken');
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function SiteDashboard() {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [newSite, setNewSite] = useState({ domain: '', name: '', category: 'mortgage' });

  const { data: stats } = useQuery<SiteStats>({
    queryKey: ['site-stats'],
    queryFn: () => apiFetch('/api/sites/stats/overview'),
  });

  const { data: sitesRaw, isLoading } = useQuery<Site[]>({
    queryKey: ['sites'],
    queryFn: () => apiFetch('/api/sites'),
  });
  const siteList = sitesRaw ?? [];

  const createMutation = useMutation({
    mutationFn: (data: typeof newSite) =>
      apiFetch('/api/sites', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      queryClient.invalidateQueries({ queryKey: ['site-stats'] });
      setAddOpen(false);
      setNewSite({ domain: '', name: '', category: 'mortgage' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/sites/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      queryClient.invalidateQueries({ queryKey: ['site-stats'] });
    },
  });

  const generateContentMutation = useMutation({
    mutationFn: (siteId: number) => 
      apiFetch('/api/factory/generate-content', { method: 'POST', body: JSON.stringify({ siteId }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
    },
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Site Factory
            </h1>
            <p className="text-gray-400 mt-1">Manage all your deployed domains and sites</p>
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" /> Add Site
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>Add New Site</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Domain</label>
                  <Input
                    placeholder="e.g., dscr-loans-arizona.com"
                    className="bg-gray-800 border-gray-600"
                    value={newSite.domain}
                    onChange={e => setNewSite(s => ({ ...s, domain: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Site Name</label>
                  <Input
                    placeholder="e.g., Arizona DSCR Loans"
                    className="bg-gray-800 border-gray-600"
                    value={newSite.name}
                    onChange={e => setNewSite(s => ({ ...s, name: e.target.value }))}
                  />
                </div>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => createMutation.mutate(newSite)}
                  disabled={!newSite.domain || !newSite.name || createMutation.isPending}
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Site'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Sites', value: stats?.total ?? 0, icon: Globe, color: 'text-blue-400' },
            { label: 'Live Sites', value: stats?.live ?? 0, icon: TrendingUp, color: 'text-green-400' },
            { label: 'Total Leads', value: stats?.totalLeads ?? 0, icon: Users, color: 'text-purple-400' },
            { label: 'Monthly Visitors', value: (stats?.totalVisitors ?? 0).toLocaleString(), icon: TrendingUp, color: 'text-orange-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="bg-gray-900 border-gray-800">
              <CardContent className="p-4 flex items-center gap-3">
                <Icon className={`w-8 h-8 ${color}`} />
                <div>
                  <div className="text-2xl font-bold">{value}</div>
                  <div className="text-xs text-gray-400">{label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sites Table */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg">Your Sites</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center text-gray-400 py-8">Loading sites...</div>
            ) : siteList.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No sites yet. Add your first domain to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400">
                      <th className="text-left py-3 px-4">Domain</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Leads</th>
                      <th className="text-left py-3 px-4">SEO</th>
                      <th className="text-left py-3 px-4">Visitors/mo</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {siteList.map(site => (
                      <tr key={site.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-medium">{site.name}</div>
                          <div className="text-gray-400 text-xs">{site.domain}</div>
                          {site.config?.customContent?.pages && (
                             <div className="mt-2 flex items-center gap-2">
                               <div className="w-24 h-1 bg-gray-800 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-green-500" 
                                    style={{ 
                                      width: `${(site.config.customContent.pages.filter((p:any) => p.fullContentGenerated).length / site.config.customContent.pages.length) * 100}%` 
                                    }} 
                                  />
                               </div>
                               <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">
                                 {site.config.customContent.pages.filter((p:any) => p.fullContentGenerated).length}/{site.config.customContent.pages.length} Pages
                               </span>
                             </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[site.status] ?? STATUS_COLORS.draft}`}>
                            {site.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-green-400 font-medium">{site.leadCount}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-gray-700 rounded-full">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${site.seoScore}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-400">{site.seoScore}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{(site.monthlyVisitors || 0).toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            {site.status === 'live' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-gray-400 hover:text-white"
                                onClick={() => window.open(`https://${site.domain}`, '_blank')}
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-7 w-7 p-0 text-blue-400 hover:text-white"
                              title="Edit Code"
                              onClick={() => navigate(`/ide/${site.id}`)}
                            >
                              <FileCode className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-7 w-7 p-0 text-yellow-400 hover:text-white"
                              title="Generate Full Content"
                              onClick={() => generateContentMutation.mutate(site.id)}
                              disabled={generateContentMutation.isPending}
                            >
                              <Sparkles className={`w-3.5 h-3.5 ${generateContentMutation.isPending ? 'animate-pulse' : ''}`} />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-gray-400 hover:text-white">
                              <Settings className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-red-400 hover:text-red-300"
                              onClick={() => deleteMutation.mutate(site.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
