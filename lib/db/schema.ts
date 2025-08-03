import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  date,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// -- CORE USER AND AUTHENTICATION --
// Simplified from the original template. We only need to manage a few users.
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// -- NEW: THE ANCHOR CORE TABLES --

// Defines the three energy levels that will drive the UI
export const energyLevelEnum = pgEnum('energy_level', ['low', 'medium', 'high']);

// This table will store a record for each day, tracking the user's state.
export const dailyLogs = pgTable('daily_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  logDate: date('log_date').notNull().unique(), // Ensures one log per day
  energyLevel: energyLevelEnum('energy_level').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// A master list of the non-negotiable "Anchor Tasks"
export const anchorTasks = pgTable('anchor_tasks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  taskName: varchar('task_name', { length: 255 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(), // To toggle tasks on/off
});

// This table tracks the completion status of each anchor task for a specific daily log.
export const dailyAnchorTaskStatus = pgTable('daily_anchor_task_status', {
  id: serial('id').primaryKey(),
  dailyLogId: integer('daily_log_id').notNull().references(() => dailyLogs.id),
  anchorTaskId: integer('anchor_task_id').notNull().references(() => anchorTasks.id),
  isCompleted: boolean('is_completed').default(false).notNull(),
});


// -- NEW: NOODLES MANAGEMENT TABLES --

// Logs specific care and training activities for Noodles.
export const noodlesLogs = pgTable('noodles_logs', {
  id: serial('id').primaryKey(),
  logDate: date('log_date').notNull(),
  activityType: varchar('activity_type', { length: 100 }).notNull(), // e.g., 'Training', 'Walk', 'BCS Check'
  durationMinutes: integer('duration_minutes'), // For walks or training
  notes: text('notes'), // For training details or BCS score
  createdAt: timestamp('created_at').notNull().defaultNow(),
});


// -- NEW: PLAYBOOK & RESOURCE TABLES --

// Defines the types of playbook items (e.g., Meal, Comfort Activity)
export const playbookItemTypeEnum = pgEnum('playbook_item_type', ['meal', 'comfort_media', 'comfort_activity', 'sensory_aid']);

// Stores all items from the Dopamine Menu and Energy-Based Meal Guide.
export const playbookItems = pgTable('playbook_items', {
    id: serial('id').primaryKey(),
    itemType: playbookItemTypeEnum('item_type').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    energyLevelRequired: integer('energy_level_required'), // 0 for takeout, 1 for assembly, etc.
});

// -- NEW: GOALS AND IDEAS HUB --

export const futureGoals = pgTable('future_goals', {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    status: varchar('status', { length: 50 }).default('active').notNull(), // e.g., 'active', 'completed', 'on_hold'
    nextPhysicalStep: text('next_physical_step'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});


// -- RELATIONSHIPS --

export const usersRelations = relations(users, ({ many }) => ({
  dailyLogs: many(dailyLogs),
  anchorTasks: many(anchorTasks),
}));

export const dailyLogsRelations = relations(dailyLogs, ({ one, many }) => ({
  user: one(users, {
    fields: [dailyLogs.userId],
    references: [users.id],
  }),
  taskStatuses: many(dailyAnchorTaskStatus),
}));

export const anchorTasksRelations = relations(anchorTasks, ({ one }) => ({
    user: one(users, {
        fields: [anchorTasks.userId],
        references: [users.id],
    }),
}));

export const dailyAnchorTaskStatusRelations = relations(dailyAnchorTaskStatus, ({ one }) => ({
  dailyLog: one(dailyLogs, {
    fields: [dailyAnchorTaskStatus.dailyLogId],
    references: [dailyLogs.id],
  }),
  anchorTask: one(anchorTasks, {
    fields: [dailyAnchorTaskStatus.anchorTaskId],
    references: [anchorTasks.id],
  }),
}));

// -- TYPE DEFINITIONS FOR USE IN THE APP --
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
// ... add other types as needed
