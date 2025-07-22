import { aiService } from './ai-service';
import { projectService } from './project-service';
import { db } from '../db';
import { messages, type Agent } from '@shared/schema';
import { eq } from 'drizzle-orm';

interface TaskDefinition {
  type: string;
  description: string;
  dependencies?: string[];
  requiredAgents: string[];
  estimatedTokens?: number;
}

interface WorkflowStep {
  agentRole: string;
  task: string;
  context: any;
  dependencies: string[];
}

export class AgentOrchestrator {
  private activeWorkflows: Map<number, WorkflowStep[]> = new Map();

  async processUserRequest(
    projectId: number,
    userMessage: string,
    selectedModel: string
  ): Promise<string> {
    // Step 1: Analyze the request with planning agent
    const analysis = await this.analyzeRequest(projectId, userMessage);
    
    // Step 2: Create workflow based on analysis
    const workflow = await this.createWorkflow(projectId, analysis);
    
    // Step 3: Execute workflow steps
    const results = await this.executeWorkflow(projectId, workflow);
    
    // Step 4: Synthesize results
    return await this.synthesizeResults(projectId, results, selectedModel);
  }

  private async analyzeRequest(projectId: number, userMessage: string) {
    const plannerAgent = await this.getAgentByRole(projectId, 'planner');
    
    const systemPrompt = `You are a planning agent for an AI development platform.
    Analyze the user's request and break it down into specific tasks.
    Identify which specialist agents should handle each part.
    
    Available agents and their specialties:
    - architect: System design, database schemas, API design
    - frontend: React components, UI implementation, user interactions
    - backend: Server logic, API endpoints, database operations
    - designer: UI/UX design, styling, visual elements
    - tester: Testing strategies, test cases, quality assurance
    
    Respond with a JSON structure like:
    {
      "summary": "Brief summary of the request",
      "tasks": [
        {
          "id": "task1",
          "type": "design",
          "description": "Design the user interface",
          "agent": "designer",
          "dependencies": []
        }
      ],
      "estimatedComplexity": "low|medium|high"
    }`;

    const response = await aiService.sendMessage(
      systemPrompt,
      userMessage,
      plannerAgent?.model || 'gpt-4-turbo'
    );

    try {
      return JSON.parse(response);
    } catch {
      return {
        summary: userMessage,
        tasks: [{
          id: 'general',
          type: 'general',
          description: userMessage,
          agent: 'architect',
          dependencies: []
        }],
        estimatedComplexity: 'medium'
      };
    }
  }

  private async createWorkflow(projectId: number, analysis: any): Promise<WorkflowStep[]> {
    const workflow: WorkflowStep[] = [];
    
    for (const task of analysis.tasks) {
      workflow.push({
        agentRole: task.agent,
        task: task.description,
        context: {
          projectId,
          taskId: task.id,
          type: task.type
        },
        dependencies: task.dependencies || []
      });
    }
    
    // Store workflow for tracking
    this.activeWorkflows.set(projectId, workflow);
    
    return workflow;
  }

  private async executeWorkflow(
    projectId: number, 
    workflow: WorkflowStep[]
  ): Promise<Map<string, any>> {
    const results = new Map<string, any>();
    const completed = new Set<string>();
    
    // Execute tasks respecting dependencies
    while (completed.size < workflow.length) {
      for (const step of workflow) {
        const taskId = step.context.taskId;
        
        // Skip if already completed
        if (completed.has(taskId)) continue;
        
        // Check if dependencies are satisfied
        const dependenciesSatisfied = step.dependencies.every(dep => 
          completed.has(dep)
        );
        
        if (!dependenciesSatisfied) continue;
        
        // Execute the task
        const agent = await this.getAgentByRole(projectId, step.agentRole);
        if (!agent) continue;
        
        const context = this.buildContextFromResults(step.dependencies, results);
        const result = await this.executeAgentTask(
          agent,
          step.task,
          context
        );
        
        results.set(taskId, {
          agent: agent.name,
          task: step.task,
          result
        });
        
        completed.add(taskId);
        
        // Save progress
        await this.saveAgentMessage(projectId, agent.id, step.task, result);
      }
    }
    
    return results;
  }

  private buildContextFromResults(
    dependencies: string[],
    results: Map<string, any>
  ): string {
    if (dependencies.length === 0) return '';
    
    let context = 'Previous work completed:\n\n';
    
    for (const dep of dependencies) {
      const result = results.get(dep);
      if (result) {
        context += `${result.agent}: ${result.task}\n`;
        context += `Result: ${result.result}\n\n`;
      }
    }
    
    return context;
  }

  private async executeAgentTask(
    agent: Agent,
    task: string,
    context: string
  ): Promise<string> {
    const systemPrompt = this.getAgentSystemPrompt(agent.role);
    const fullPrompt = context ? `${context}\n\nNew task: ${task}` : task;
    
    return await aiService.sendMessage(
      systemPrompt,
      fullPrompt,
      agent.model as any
    );
  }

  private getAgentSystemPrompt(role: string): string {
    const prompts: Record<string, string> = {
      planner: 'You are a strategic planning agent. Break down complex requirements into actionable tasks.',
      architect: 'You are a system architect. Design robust, scalable architectures and data models.',
      frontend: 'You are a frontend developer. Create React components with TypeScript and Tailwind CSS.',
      backend: 'You are a backend developer. Implement secure, efficient API endpoints and database logic.',
      designer: 'You are a UI/UX designer. Create beautiful, intuitive interfaces following modern design principles.',
      tester: 'You are a QA engineer. Write comprehensive tests and ensure code quality.'
    };
    
    return prompts[role] || 'You are a helpful AI assistant.';
  }

  private async synthesizeResults(
    projectId: number,
    results: Map<string, any>,
    selectedModel: string
  ): Promise<string> {
    if (results.size === 0) {
      return 'I understand your request. Let me help you with that.';
    }
    
    if (results.size === 1) {
      return Array.from(results.values())[0].result;
    }
    
    // Multiple agents worked on this - synthesize their outputs
    let synthesis = 'Here\'s what the team accomplished:\n\n';
    
    for (const [taskId, data] of Array.from(results)) {
      synthesis += `**${data.agent}**: ${data.task}\n`;
      synthesis += `${data.result.substring(0, 200)}...\n\n`;
    }
    
    return synthesis;
  }

  private async getAgentByRole(projectId: number, role: string): Promise<Agent | null> {
    const projectData = await projectService.getProjectWithAgents(projectId);
    
    if (!projectData) return null;
    
    const projectAgent = projectData.projectAgents?.find(
      (pa: any) => pa.agent.role === role
    );
    
    return projectAgent?.agent || null;
  }

  private async saveAgentMessage(
    projectId: number,
    agentId: number,
    task: string,
    result: string
  ) {
    await db.insert(messages).values({
      projectId,
      agentId,
      role: 'assistant',
      content: result,
      metadata: { task }
    });
  }

  getActiveWorkflow(projectId: number): WorkflowStep[] | undefined {
    return this.activeWorkflows.get(projectId);
  }

  clearWorkflow(projectId: number): void {
    this.activeWorkflows.delete(projectId);
  }
}

export const agentOrchestrator = new AgentOrchestrator();