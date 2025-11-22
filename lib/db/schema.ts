// lib/db/schema.ts
import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  date,
  doublePrecision,
  unique,
  index,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- 1. MindMaps Table ---
export const mindMaps = pgTable(
  'mind_maps',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(), // 對應 Supabase auth.users.id
    date: date('date').notNull(), // 哪一天的輸出 (YYYY-MM-DD)

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    // 複合唯一約束：每個使用者每天只能有一張 MindMap
    unq: unique().on(t.userId, t.date),
    // 索引：加速查詢
    userIdDateIdx: index('idx_mind_maps_user_date').on(t.userId, t.date),
  })
);

// --- 2. Topics Table ---
export const topics = pgTable(
  'topics',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    name: text('name').notNull(),
    color: text('color').default('#3B82F6').notNull(), // Default Blue
    parentTopicId: uuid('parent_topic_id'), // 自引用：父 Topic
    isPinned: boolean('is_pinned').default(false).notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    userIdIdx: index('idx_topics_user').on(t.userId),
    parentTopicIdx: index('idx_topics_parent').on(t.parentTopicId),
  })
);

// --- 3. Nodes Table ---
export const nodes = pgTable(
  'nodes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    mindMapId: uuid('mind_map_id')
      .notNull()
      .references(() => mindMaps.id, { onDelete: 'cascade' }),
    parentId: uuid('parent_id'), // 自引用：父節點

    content: text('content').notNull(),
    positionX: doublePrecision('position_x').notNull(), // 使用 double 儲存座標
    positionY: doublePrecision('position_y').notNull(),

    // Topic 相關
    isTopic: boolean('is_topic').default(false).notNull(),
    topicId: uuid('topic_id').references(() => topics.id, {
      onDelete: 'set null',
    }),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    mindMapIdx: index('idx_nodes_mind_map').on(t.mindMapId),
    parentIdx: index('idx_nodes_parent').on(t.parentId),
    topicIdx: index('idx_nodes_topic').on(t.topicId),
  })
);

// --- 4. Tags Table ---
export const tags = pgTable(
  'tags',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    name: text('name').notNull(),
    color: text('color').default('#6B7280'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    // 每個使用者的 Tag 名稱不可重複
    unq: unique().on(t.userId, t.name),
  })
);

// --- 5. NodeTags (Many-to-Many) ---
export const nodeTags = pgTable(
  'node_tags',
  {
    nodeId: uuid('node_id')
      .notNull()
      .references(() => nodes.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.nodeId, t.tagId] }),
  })
);

// --- 6. Drizzle Relations (應用層關聯定義) ---
// 這部分不影響資料庫結構，但能讓你在寫程式時可以用 .query.findFirst({ with: { nodes: true } })

export const mindMapsRelations = relations(mindMaps, ({ many }) => ({
  nodes: many(nodes),
}));

export const nodesRelations = relations(nodes, ({ one, many }) => ({
  mindMap: one(mindMaps, {
    fields: [nodes.mindMapId],
    references: [mindMaps.id],
  }),
  parent: one(nodes, {
    fields: [nodes.parentId],
    references: [nodes.id],
    relationName: 'node_hierarchy',
  }),
  children: many(nodes, {
    relationName: 'node_hierarchy',
  }),
  topic: one(topics, {
    fields: [nodes.topicId],
    references: [topics.id],
  }),
  tags: many(nodeTags),
}));

export const topicsRelations = relations(topics, ({ one, many }) => ({
  parent: one(topics, {
    fields: [topics.parentTopicId],
    references: [topics.id],
    relationName: 'topic_hierarchy',
  }),
  children: many(topics, {
    relationName: 'topic_hierarchy',
  }),
  nodes: many(nodes), // 反向查詢：這個 Topic 下有哪些 Nodes
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  nodes: many(nodeTags),
}));

export const nodeTagsRelations = relations(nodeTags, ({ one }) => ({
  node: one(nodes, {
    fields: [nodeTags.nodeId],
    references: [nodes.id],
  }),
  tag: one(tags, {
    fields: [nodeTags.tagId],
    references: [tags.id],
  }),
}));
