CREATE TYPE public."BillingStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'CANCELED'
);
CREATE TYPE public."CardStatus" AS ENUM (
    'NOT_SEEN',
    'WRONG',
    'DIFFICULT',
    'GOOD'
);
CREATE TYPE public."IAQueueType" AS ENUM (
    'EXTRACT_ROLES',
    'GENERATE_PLAN',
    'GENERATE_FLASHCARDS',
    'ESTIMATE_CARDS'
);
CREATE TYPE public."LogLevel" AS ENUM (
    'INFO',
    'WARN',
    'ERROR'
);
CREATE TYPE public."QueueStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'FAILED'
);
CREATE TYPE public."UserPlan" AS ENUM (
    'FREE',
    'PRO',
    'PREMIUM'
);
CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);
CREATE TABLE public.billing (
    id text NOT NULL PRIMARY KEY,
    "userId" text NOT NULL,
    "stripeCustomerId" text,
    plan public."UserPlan" NOT NULL,
    status public."BillingStatus" DEFAULT 'ACTIVE'::public."BillingStatus" NOT NULL,
    "currentPeriodEnd" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
CREATE TABLE public.contests (
    id text NOT NULL PRIMARY KEY,
    name text NOT NULL,
    role text NOT NULL,
    "contestDate" timestamp(3) without time zone NOT NULL,
    "editalText" text,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
CREATE TABLE public.flashcards (
    id text NOT NULL PRIMARY KEY,
    question text NOT NULL,
    answer text NOT NULL,
    "importanceRank" double precision DEFAULT 0.5 NOT NULL,
    "subtopicId" text NOT NULL,
    "isApproved" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
CREATE TABLE public.ia_queue (
    id text NOT NULL PRIMARY KEY,
    "userId" text NOT NULL,
    type public."IAQueueType" NOT NULL,
    status public."QueueStatus" DEFAULT 'PENDING'::public."QueueStatus" NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    payload jsonb NOT NULL,
    result jsonb,
    error text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
CREATE TABLE public.logs (
    id text NOT NULL PRIMARY KEY,
    level public."LogLevel" NOT NULL,
    message text NOT NULL,
    details jsonb,
    "userId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE public.subjects (
    id text NOT NULL PRIMARY KEY,
    name text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "contestId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
CREATE TABLE public.subtopics (
    id text NOT NULL PRIMARY KEY,
    name text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "estimatedCount" integer DEFAULT 0 NOT NULL,
    "topicId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
CREATE TABLE public.topics (
    id text NOT NULL PRIMARY KEY,
    name text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "subjectId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
CREATE TABLE public.user_progress (
    id text NOT NULL PRIMARY KEY,
    "userId" text NOT NULL,
    "contestId" text NOT NULL,
    "flashcardId" text NOT NULL,
    status public."CardStatus" DEFAULT 'NOT_SEEN'::public."CardStatus" NOT NULL,
    repetitions integer DEFAULT 0 NOT NULL,
    "easeFactor" double precision DEFAULT 2.5 NOT NULL,
    "interval" integer DEFAULT 0 NOT NULL,
    "nextReviewDate" timestamp(3) without time zone,
    "lastReviewedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
CREATE TABLE public.users (
    id text NOT NULL PRIMARY KEY,
    email text NOT NULL UNIQUE,
    password text,
    name text,
    "isAdmin" boolean DEFAULT false NOT NULL,
    "isAnonymous" boolean DEFAULT false NOT NULL,
    plan public."UserPlan" DEFAULT 'FREE'::public."UserPlan" NOT NULL,
    "onboardingCompleted" boolean DEFAULT false NOT NULL,
    "onboardingCompletedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);

-- Create user_stats table for gamification
CREATE TABLE public.user_stats (
    id text NOT NULL PRIMARY KEY,
    "userId" text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    "totalPoints" integer DEFAULT 0 NOT NULL,
    "studyStreak" integer DEFAULT 0 NOT NULL,
    "longestStreak" integer DEFAULT 0 NOT NULL,
    "cardsReviewed" integer DEFAULT 0 NOT NULL,
    "correctAnswers" integer DEFAULT 0 NOT NULL,
    badges jsonb DEFAULT '[]'::jsonb NOT NULL,
    "lastStudyDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);

-- Create notifications table
CREATE TABLE public.notifications (
    id text NOT NULL PRIMARY KEY,
    "userId" text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'info' NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "actionUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create reports table
CREATE TABLE public.reports (
    id text NOT NULL PRIMARY KEY,
    "userId" text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    "contestId" text REFERENCES public.contests(id) ON DELETE CASCADE,
    title text NOT NULL,
    type text NOT NULL,
    "reportData" jsonb NOT NULL,
    "generatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Add foreign key constraints
ALTER TABLE public.billing ADD CONSTRAINT fk_billing_user FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.contests ADD CONSTRAINT fk_contests_user FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.flashcards ADD CONSTRAINT fk_flashcards_subtopic FOREIGN KEY ("subtopicId") REFERENCES public.subtopics(id) ON DELETE CASCADE;
ALTER TABLE public.ia_queue ADD CONSTRAINT fk_ia_queue_user FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.logs ADD CONSTRAINT fk_logs_user FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.subjects ADD CONSTRAINT fk_subjects_contest FOREIGN KEY ("contestId") REFERENCES public.contests(id) ON DELETE CASCADE;
ALTER TABLE public.subtopics ADD CONSTRAINT fk_subtopics_topic FOREIGN KEY ("topicId") REFERENCES public.topics(id) ON DELETE CASCADE;
ALTER TABLE public.topics ADD CONSTRAINT fk_topics_subject FOREIGN KEY ("subjectId") REFERENCES public.subjects(id) ON DELETE CASCADE;
ALTER TABLE public.user_progress ADD CONSTRAINT fk_user_progress_user FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.user_progress ADD CONSTRAINT fk_user_progress_contest FOREIGN KEY ("contestId") REFERENCES public.contests(id) ON DELETE CASCADE;
ALTER TABLE public.user_progress ADD CONSTRAINT fk_user_progress_flashcard FOREIGN KEY ("flashcardId") REFERENCES public.flashcards(id) ON DELETE CASCADE;

-- Add indexes for performance
CREATE INDEX idx_user_stats_user_id ON public.user_stats("userId");
CREATE INDEX idx_user_stats_total_points ON public.user_stats("totalPoints" DESC);
CREATE INDEX idx_notifications_user_id ON public.notifications("userId");
CREATE INDEX idx_notifications_unread ON public.notifications("userId", "isRead") WHERE "isRead" = false;
CREATE INDEX idx_reports_user_id ON public.reports("userId");
CREATE INDEX idx_reports_contest_id ON public.reports("contestId");
