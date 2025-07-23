import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal, varchar, real, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("planning"), // planning, development, testing, completed
  progress: integer("progress").notNull().default(0),
  totalCost: real("total_cost").default(0),
  config: jsonb("config"), // Project configuration and settings
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  description: text("description"),
  status: text("status").notNull().default("idle"), // idle, active, working, completed
  model: text("model").notNull(),
  color: text("color").notNull(),
  icon: text("icon"),
  config: jsonb("config"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projectAgents = pgTable("project_agents", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  agentId: integer("agent_id").notNull().references(() => agents.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  content: text("content").notNull(),
  role: text("role").notNull(), // user, assistant
  agentId: integer("agent_id"),
  model: text("model"),
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),
  cost: integer("cost_cents"), // Cost in cents
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const checklistItems = pgTable("checklist_items", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  agentId: integer("agent_id"),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"),
  assignedAgent: text("assigned_agent"),
  status: text("status").notNull().default("pending"), // pending, in-progress, completed
  priority: text("priority").notNull().default("medium"), // low, medium, high
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiUsage = pgTable("ai_usage", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  projectId: integer("project_id"),
  model: text("model").notNull(),
  inputTokens: integer("input_tokens").notNull().default(0),
  outputTokens: integer("output_tokens").notNull().default(0),
  cost: integer("cost_cents").notNull().default(0), // Cost in cents
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  progress: true,
  totalCost: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  projectId: true,
  content: true,
  role: true,
  agentId: true,
  model: true,
  metadata: true,
});

export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
});

export const insertChecklistItemSchema = createInsertSchema(checklistItems).pick({
  projectId: true,
  agentId: true,
  title: true,
  description: true,
  category: true,
  assignedAgent: true,
  priority: true,
  order: true,
});

export const insertAiUsageSchema = createInsertSchema(aiUsage).pick({
  userId: true,
  projectId: true,
  model: true,
  inputTokens: true,
  outputTokens: true,
  cost: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type ChecklistItem = typeof checklistItems.$inferSelect;
export type InsertChecklistItem = z.infer<typeof insertChecklistItemSchema>;

export type AiUsage = typeof aiUsage.$inferSelect;
export type InsertAiUsage = z.infer<typeof insertAiUsageSchema>;

// Deployments table
export const deployments = pgTable("deployments", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  userId: integer("user_id").notNull().references(() => users.id),
  environment: varchar("environment", { length: 50 }).notNull().default('production'),
  status: varchar("status", { length: 50 }).notNull().default('pending'),
  url: varchar("url", { length: 255 }),
  logs: text("logs"),
  deployedAt: timestamp("deployed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Deployment = typeof deployments.$inferSelect;
export type InsertDeployment = typeof deployments.$inferInsert;

// Memory tables for hive mind functionality
export const memories = pgTable('memories', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  projectId: integer('project_id').references(() => projects.id),
  agentId: integer('agent_id').references(() => agents.id),
  type: varchar('type', { length: 50 }).notNull(),
  content: jsonb('content').notNull(),
  embedding: jsonb('embedding').notNull().$type<number[]>(),
  timestamp: timestamp('timestamp').defaultNow(),
  metadata: jsonb('metadata').default({}),
}, (table) => [
  index('memories_user_idx').on(table.userId),
  index('memories_project_idx').on(table.projectId),
  index('memories_timestamp_idx').on(table.timestamp),
]);

export const hiveMindEntries = pgTable('hive_mind_entries', {
  id: serial('id').primaryKey(),
  type: varchar('type', { length: 50 }).notNull(),
  content: jsonb('content').notNull(),
  embedding: jsonb('embedding').notNull().$type<number[]>(),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('hive_mind_type_idx').on(table.type),
  index('hive_mind_created_idx').on(table.createdAt),
]);

// Queue system for preventing user interruption
export const promptQueue = pgTable('prompt_queue', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  projectId: integer('project_id').references(() => projects.id),
  prompt: text('prompt').notNull(),
  priority: integer('priority').default(0),
  status: varchar('status', { length: 20 }).default('queued'),
  queuedAt: timestamp('queued_at').defaultNow(),
  processedAt: timestamp('processed_at'),
}, (table) => [
  index('queue_user_status_idx').on(table.userId, table.status),
  index('queue_priority_idx').on(table.priority),
]);

export type Memory = typeof memories.$inferSelect;
export type InsertMemory = typeof memories.$inferInsert;
export type HiveMindEntry = typeof hiveMindEntries.$inferSelect;
export type InsertHiveMindEntry = typeof hiveMindEntries.$inferInsert;
export type QueuedPrompt = typeof promptQueue.$inferSelect;
export type InsertQueuedPrompt = typeof promptQueue.$inferInsert;

// Blog posts table for auto-generated content
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  category: varchar("category", { length: 100 }),
  keywords: text("keywords").array(),
  metaDescription: text("meta_description"),
  publishedAt: timestamp("published_at"),
  status: varchar("status", { length: 50 }).default("draft"),
  readTime: integer("read_time"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

// Marketing campaigns table
export const marketingCampaigns = pgTable("marketing_campaigns", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // email, social, blog, ad
  status: varchar("status", { length: 50 }).default("active"),
  config: jsonb("config"), // Campaign configuration
  metrics: jsonb("metrics"), // Performance metrics
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type MarketingCampaign = typeof marketingCampaigns.$inferSelect;
export type InsertMarketingCampaign = typeof marketingCampaigns.$inferInsert;
