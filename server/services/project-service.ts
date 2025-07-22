import { db } from '../db';
import { projects, agents, messages, projectAgents, type Project } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

export class ProjectService {
  async createProject(name: string, description: string, userId: string): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values({
        name,
        description,
        userId,
        config: {
          primaryModel: 'gpt-4',
          maxBudget: 25,
          autoApprove: false
        }
      })
      .returning();
    
    // Create default agents for the project
    await this.createDefaultAgents(project.id);
    
    return project;
  }

  async createDefaultAgents(projectId: number): Promise<void> {
    const defaultAgents = [
      {
        name: 'Planning & Strategy Agent',
        role: 'planner',
        model: 'gpt-4-turbo',
        description: 'Analyzes requirements and creates development roadmaps',
        color: 'blue'
      },
      {
        name: 'System Architect',
        role: 'architect',
        model: 'claude-3.5-sonnet',
        description: 'Designs system architecture and data models',
        color: 'purple'
      },
      {
        name: 'Frontend Developer',
        role: 'frontend',
        model: 'moonshot-kimi',
        description: 'Builds responsive React components and UI',
        color: 'green'
      },
      {
        name: 'Backend Developer',
        role: 'backend',
        model: 'qwen-2.5-max',
        description: 'Implements APIs and database logic',
        color: 'orange'
      },
      {
        name: 'UI/UX Designer',
        role: 'designer',
        model: 'gemini-ultra',
        description: 'Creates beautiful and intuitive interfaces',
        color: 'pink'
      },
      {
        name: 'Testing & QA Agent',
        role: 'tester',
        model: 'grok-2',
        description: 'Writes tests and ensures code quality',
        color: 'red'
      }
    ];

    for (const agentData of defaultAgents) {
      const [agent] = await db
        .insert(agents)
        .values(agentData)
        .returning();
      
      await db.insert(projectAgents).values({
        projectId,
        agentId: agent.id
      });
    }
  }

  async getProjectWithAgents(projectId: number) {
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
      with: {
        projectAgents: {
          with: {
            agent: true
          }
        }
      }
    });
    
    return project;
  }

  async updateProjectStatus(projectId: number, status: 'active' | 'paused' | 'completed') {
    await db
      .update(projects)
      .set({ status })
      .where(eq(projects.id, projectId));
  }

  async getProjectMessages(projectId: number, limit = 50) {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.projectId, projectId))
      .orderBy(desc(messages.createdAt))
      .limit(limit);
  }

  async trackProjectCost(projectId: number, cost: number) {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId));
    
    if (project) {
      await db
        .update(projects)
        .set({ 
          totalCost: (project.totalCost || 0) + cost 
        })
        .where(eq(projects.id, projectId));
    }
  }
}

export const projectService = new ProjectService();