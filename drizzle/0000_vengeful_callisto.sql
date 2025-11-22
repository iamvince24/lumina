CREATE TABLE "mind_maps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "mind_maps_user_id_date_unique" UNIQUE("user_id","date")
);
--> statement-breakpoint
CREATE TABLE "node_tags" (
	"node_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "node_tags_node_id_tag_id_pk" PRIMARY KEY("node_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "nodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mind_map_id" uuid NOT NULL,
	"parent_id" uuid,
	"content" text NOT NULL,
	"position_x" double precision NOT NULL,
	"position_y" double precision NOT NULL,
	"is_topic" boolean DEFAULT false NOT NULL,
	"topic_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"color" text DEFAULT '#6B7280',
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tags_user_id_name_unique" UNIQUE("user_id","name")
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"color" text DEFAULT '#3B82F6' NOT NULL,
	"parent_topic_id" uuid,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "node_tags" ADD CONSTRAINT "node_tags_node_id_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "node_tags" ADD CONSTRAINT "node_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nodes" ADD CONSTRAINT "nodes_mind_map_id_mind_maps_id_fk" FOREIGN KEY ("mind_map_id") REFERENCES "public"."mind_maps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nodes" ADD CONSTRAINT "nodes_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_mind_maps_user_date" ON "mind_maps" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "idx_nodes_mind_map" ON "nodes" USING btree ("mind_map_id");--> statement-breakpoint
CREATE INDEX "idx_nodes_parent" ON "nodes" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "idx_nodes_topic" ON "nodes" USING btree ("topic_id");--> statement-breakpoint
CREATE INDEX "idx_topics_user" ON "topics" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_topics_parent" ON "topics" USING btree ("parent_topic_id");