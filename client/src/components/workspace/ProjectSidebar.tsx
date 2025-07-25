import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, FolderOpen, Loader2, Search, Globe, User, Store, Briefcase, 
  Home, TrendingUp, Hotel, ShoppingCart, Building2, Sparkles, 
  Banknote, Building, Stethoscope, Scale, GraduationCap, Car, Dumbbell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Project } from '@shared/schema';
import { projectTemplates, getCategories, getIndividualTemplates, getCompanyTemplates } from '@shared/templates';

interface ProjectSidebarProps {
  projects: Project[];
  selectedProjectId: number | null;
  onSelectProject: (id: number) => void;
  onCreateProject: (name: string, description: string) => Promise<void>;
  isLoading: boolean;
}

// Icon mapping for categories
const categoryIcons: Record<string, any> = {
  'Real Estate': Home,
  'Financial Services': TrendingUp,
  'Hospitality': Hotel,
  'Retail': ShoppingCart,
  'Construction': Building2,
  'Healthcare': Stethoscope,
  'Legal': Scale,
  'Education': GraduationCap,
  'Automotive': Car,
  'Fitness': Dumbbell
};

// Color mapping for categories
const categoryColors: Record<string, string> = {
  'Real Estate': 'bg-blue-500',
  'Financial Services': 'bg-green-500',
  'Hospitality': 'bg-purple-500',
  'Retail': 'bg-orange-500',
  'Construction': 'bg-yellow-500',
  'Healthcare': 'bg-red-500',
  'Legal': 'bg-indigo-500',
  'Education': 'bg-pink-500',
  'Automotive': 'bg-gray-500',
  'Fitness': 'bg-teal-500'
};

export function ProjectSidebar({
  projects,
  selectedProjectId,
  onSelectProject,
  onCreateProject,
  isLoading
}: ProjectSidebarProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    setIsCreating(true);
    try {
      await onCreateProject(newProjectName, newProjectDescription);
      setIsCreateDialogOpen(false);
      setNewProjectName('');
      setNewProjectDescription('');
      setSelectedTemplate(null);
    } finally {
      setIsCreating(false);
    }
  };

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template.id);
    setNewProjectName(template.name);
    setNewProjectDescription(template.description);
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-muted/50">
      <div className="p-4 border-b">
        <Button 
          className="w-full" 
          onClick={() => setIsCreateDialogOpen(true)}
          disabled={isLoading}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-8 px-4">
              <FolderOpen className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {searchTerm ? 'No projects match your search.' : 'No projects yet. Create your first one!'}
              </p>
            </div>
          ) : (
            filteredProjects.map((project) => (
              <button
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  selectedProjectId === project.id && "bg-accent text-accent-foreground"
                )}
              >
                <div className="font-medium text-sm">{project.name}</div>
                {project.description && (
                  <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {project.description}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground capitalize">
                    {project.status}
                  </span>
                  {project.progress > 0 && (
                    <span className="text-xs text-muted-foreground">
                      • {project.progress}%
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All Templates</TabsTrigger>
                <TabsTrigger value="company">For Companies</TabsTrigger>
                <TabsTrigger value="individual">For Individuals</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Choose a Template</Label>
                    <Badge variant="secondary">{projectTemplates.length} templates</Badge>
                  </div>
                  <ScrollArea className="h-[180px] pr-4">
                    <div className="grid grid-cols-2 gap-3">
                      {projectTemplates.slice(0, 10).map((template) => (
                        <Card
                          key={template.id}
                          className={cn(
                            "cursor-pointer transition-all hover:shadow-md",
                            selectedTemplate === template.id && "ring-2 ring-primary"
                          )}
                          onClick={() => handleTemplateSelect(template)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                              <div className={cn("p-2 rounded-md text-white", 
                                categoryColors[template.category] || 'bg-gray-500'
                              )}>
                                <span className="text-lg">{template.icon}</span>
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-sm">{template.name}</CardTitle>
                                <Badge variant="outline" className="text-xs mt-1">
                                  {template.category}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <CardDescription className="text-xs leading-relaxed line-clamp-2">
                              {template.description}
                            </CardDescription>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {template.difficulty}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {template.estimatedTime}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
              
              <TabsContent value="company" className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Company Templates</Label>
                    <Badge variant="secondary">{getCompanyTemplates().length} templates</Badge>
                  </div>
                  <ScrollArea className="h-[180px] pr-4">
                    <div className="grid grid-cols-2 gap-3">
                      {getCompanyTemplates().slice(0, 10).map((template) => (
                        <Card
                          key={template.id}
                          className={cn(
                            "cursor-pointer transition-all hover:shadow-md",
                            selectedTemplate === template.id && "ring-2 ring-primary"
                          )}
                          onClick={() => handleTemplateSelect(template)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                              <div className={cn("p-2 rounded-md text-white", 
                                categoryColors[template.category] || 'bg-gray-500'
                              )}>
                                <Building2 className="w-4 h-4" />
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-sm">{template.name}</CardTitle>
                                <Badge variant="outline" className="text-xs mt-1">
                                  {template.industry}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <CardDescription className="text-xs leading-relaxed line-clamp-2">
                              {template.description}
                            </CardDescription>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
              
              <TabsContent value="individual" className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Individual Professional Templates</Label>
                    <Badge variant="secondary">{getIndividualTemplates().length} templates</Badge>
                  </div>
                  <ScrollArea className="h-[180px] pr-4">
                    <div className="grid grid-cols-2 gap-3">
                      {getIndividualTemplates().slice(0, 10).map((template) => (
                        <Card
                          key={template.id}
                          className={cn(
                            "cursor-pointer transition-all hover:shadow-md",
                            selectedTemplate === template.id && "ring-2 ring-primary"
                          )}
                          onClick={() => handleTemplateSelect(template)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                              <div className={cn("p-2 rounded-md text-white", 
                                categoryColors[template.category] || 'bg-gray-500'
                              )}>
                                <User className="w-4 h-4" />
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-sm">{template.name}</CardTitle>
                                <Badge variant="outline" className="text-xs mt-1">
                                  {template.targetRole}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <CardDescription className="text-xs leading-relaxed line-clamp-2">
                              {template.description}
                            </CardDescription>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="My Awesome Project"
                disabled={isCreating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="A brief description of what you want to build..."
                rows={3}
                disabled={isCreating}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setSelectedTemplate(null);
                setNewProjectName('');
                setNewProjectDescription('');
              }}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={!newProjectName.trim() || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}