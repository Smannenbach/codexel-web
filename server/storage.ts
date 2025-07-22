import { 
  users, projects, agents, messages, checklistItems, aiUsage,
  type User, type InsertUser, 
  type Project, type InsertProject,
  type Agent, type InsertAgent,
  type Message, type InsertMessage,
  type ChecklistItem, type InsertChecklistItem,
  type AiUsage, type InsertAiUsage
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project methods
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  
  // Agent methods
  getAgentsByProject(projectId: number): Promise<Agent[]>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  
  // Message methods
  getMessagesByProject(projectId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Checklist methods
  getChecklistItemsByProject(projectId: number): Promise<ChecklistItem[]>;
  createChecklistItem(item: InsertChecklistItem): Promise<ChecklistItem>;
  
  // AI Usage methods
  getAiUsageByUser(userId: number): Promise<AiUsage[]>;
  createAiUsage(usage: InsertAiUsage): Promise<AiUsage>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private projects: Map<number, Project> = new Map();
  private agents: Map<number, Agent> = new Map();
  private messages: Map<number, Message> = new Map();
  private checklistItems: Map<number, ChecklistItem> = new Map();
  private aiUsage: Map<number, AiUsage> = new Map();
  
  private currentUserId = 1;
  private currentProjectId = 1;
  private currentAgentId = 1;
  private currentMessageId = 1;
  private currentChecklistId = 1;
  private currentUsageId = 1;

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  // Project methods
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const project: Project = {
      ...insertProject,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.projects.set(id, project);
    return project;
  }

  // Agent methods
  async getAgentsByProject(projectId: number): Promise<Agent[]> {
    return Array.from(this.agents.values()).filter(agent => agent.projectId === projectId);
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const id = this.currentAgentId++;
    const agent: Agent = {
      ...insertAgent,
      id,
      status: 'idle',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.agents.set(id, agent);
    return agent;
  }

  // Message methods
  async getMessagesByProject(projectId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(message => message.projectId === projectId);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: new Date()
    };
    this.messages.set(id, message);
    return message;
  }

  // Checklist methods
  async getChecklistItemsByProject(projectId: number): Promise<ChecklistItem[]> {
    return Array.from(this.checklistItems.values()).filter(item => item.projectId === projectId);
  }

  async createChecklistItem(insertItem: InsertChecklistItem): Promise<ChecklistItem> {
    const id = this.currentChecklistId++;
    const item: ChecklistItem = {
      ...insertItem,
      id,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.checklistItems.set(id, item);
    return item;
  }

  // AI Usage methods
  async getAiUsageByUser(userId: number): Promise<AiUsage[]> {
    return Array.from(this.aiUsage.values()).filter(usage => usage.userId === userId);
  }

  async createAiUsage(insertUsage: InsertAiUsage): Promise<AiUsage> {
    const id = this.currentUsageId++;
    const usage: AiUsage = {
      ...insertUsage,
      id,
      createdAt: new Date()
    };
    this.aiUsage.set(id, usage);
    return usage;
  }
}

export const storage = new MemStorage();
