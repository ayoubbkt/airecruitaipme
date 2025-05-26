-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STANDARD', 'ADMIN', 'MEGA_ADMIN', 'EXTERNAL_RECRUITER');

-- CreateEnum
CREATE TYPE "CompanyMemberRole" AS ENUM ('RECRUITING_ADMIN', 'HIRING_MANAGER', 'REVIEWER');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP_PAID', 'INTERNSHIP_UNPAID', 'TEMPORARY', 'OTHER');

-- CreateEnum
CREATE TYPE "WorkType" AS ENUM ('ON_SITE', 'REMOTE', 'HYBRID');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'INTERNAL_ONLY', 'CONFIDENTIAL', 'ARCHIVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "FieldType" AS ENUM ('TEXT', 'TEXTAREA', 'EMAIL', 'PHONE', 'FILE', 'YES_NO', 'DROPDOWN', 'MULTIPLE_CHOICE', 'NUMBER', 'CUSTOM_QUESTION_REFERENCE');

-- CreateEnum
CREATE TYPE "ResponseType" AS ENUM ('SHORT_TEXT', 'PARAGRAPH_TEXT', 'YES_NO', 'DROPDOWN_LIST', 'MULTIPLE_CHOICE', 'NUMBER', 'FILE_UPLOAD');

-- CreateEnum
CREATE TYPE "ResponseVisibility" AS ENUM ('HIRING_TEAM', 'HIRING_MANAGERS_AND_ABOVE');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('ACTIVE', 'DISQUALIFIED', 'ARCHIVED', 'HIRED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "StageType" AS ENUM ('LEADS', 'APPLIED', 'AI_SCREENING', 'REVIEW', 'INTERVIEW', 'BACKGROUND_CHECK', 'OFFER', 'HIRED', 'DISQUALIFIED', 'ARCHIVED', 'OTHER');

-- CreateEnum
CREATE TYPE "RatingCardType" AS ENUM ('BASIC', 'CATEGORIZED');

-- CreateEnum
CREATE TYPE "CommentVisibility" AS ENUM ('PUBLIC', 'PRIVATE', 'CONFIDENTIAL');

-- CreateEnum
CREATE TYPE "MeetingType" AS ENUM ('PHONE_CALL', 'VIDEO_CALL', 'IN_PERSON', 'OTHER');

-- CreateEnum
CREATE TYPE "AttendeeStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'TENTATIVE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('NEW_CANDIDATE', 'CANDIDATE_STAGE_CHANGED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_REMINDER', 'RATING_CARD_DUE', 'TASK_ASSIGNED', 'COMMENT_MENTION', 'REPORT_READY', 'JOB_STATUS_UPDATED', 'SLA_WARNING', 'SLA_EXPIRED');

-- CreateEnum
CREATE TYPE "AITone" AS ENUM ('CASUAL_LAID_BACK', 'PROFESSIONAL_FORMAL', 'GAMESHOW_LAID_BACK', 'ROBOTIC_AI');

-- CreateEnum
CREATE TYPE "CalendarProvider" AS ENUM ('GOOGLE_WORKSPACE', 'MS_365_OUTLOOK');

-- CreateEnum
CREATE TYPE "TemplateType" AS ENUM ('EMAIL', 'IN_APP_MESSAGE', 'SMS');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "jobTitle" TEXT,
    "departmentName" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'STANDARD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "phoneNumber" TEXT,
    "description" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_members" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "CompanyMemberRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "employmentType" "EmploymentType" NOT NULL,
    "workType" "WorkType" NOT NULL,
    "salaryMin" DOUBLE PRECISION,
    "salaryMax" DOUBLE PRECISION,
    "currency" TEXT,
    "payPeriod" TEXT,
    "displaySalary" BOOLEAN NOT NULL DEFAULT true,
    "status" "JobStatus" NOT NULL DEFAULT 'DRAFT',
    "jobCode" TEXT,
    "companyId" TEXT NOT NULL,
    "departmentId" TEXT,
    "locationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_locations" (
    "id" TEXT NOT NULL,
    "address" TEXT,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "stateRegion" TEXT,
    "zipPostal" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_form_fields" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "fieldType" "FieldType" NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "isDisabled" BOOLEAN NOT NULL DEFAULT false,
    "customQuestionId" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "application_form_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_questions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "responseType" "ResponseType" NOT NULL,
    "options" JSONB,
    "visibility" "ResponseVisibility" NOT NULL DEFAULT 'HIRING_TEAM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidates" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "resumeUrl" TEXT,
    "coverLetterText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentStageId" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'ACTIVE',
    "disqualificationReason" TEXT,
    "archivedAt" TIMESTAMP(3),
    "hiredAt" TIMESTAMP(3),
    "source" TEXT,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_answers" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "customQuestionId" TEXT NOT NULL,
    "answerText" TEXT,
    "answerFileUrl" TEXT,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "candidateId" TEXT NOT NULL,

    CONSTRAINT "candidate_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_stage_templates" (
    "id" TEXT NOT NULL,
    "workflowTemplateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "StageType" NOT NULL,
    "order" INTEGER NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "canBeDeleted" BOOLEAN NOT NULL DEFAULT true,
    "settings" JSONB,
    "visibilityToReviewers" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "workflow_stage_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_workflows" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "workflowTemplateId" TEXT,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_workflow_stages" (
    "id" TEXT NOT NULL,
    "jobWorkflowId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "StageType" NOT NULL,
    "order" INTEGER NOT NULL,
    "settings" JSONB,

    CONSTRAINT "job_workflow_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_hiring_members" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "CompanyMemberRole" NOT NULL,
    "isExternalRecruiter" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_hiring_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rating_card_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "companyId" TEXT NOT NULL,
    "type" "RatingCardType" NOT NULL DEFAULT 'BASIC',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rating_card_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rating_categories" (
    "id" TEXT NOT NULL,
    "ratingCardTemplateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "rating_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_ratings" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "jobWorkflowStageId" TEXT NOT NULL,
    "raterId" TEXT NOT NULL,
    "ratingCardTemplateId" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "comments" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_scores" (
    "id" TEXT NOT NULL,
    "candidateRatingId" TEXT NOT NULL,
    "ratingCategoryId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "comments" TEXT,

    CONSTRAINT "category_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_threads" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isInternalNote" BOOLEAN NOT NULL DEFAULT false,
    "visibility" "CommentVisibility",
    "attachments" JSONB,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meetings" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "type" "MeetingType" NOT NULL,
    "location" TEXT,
    "videoCallLink" TEXT,
    "jobId" TEXT,
    "applicationId" TEXT,
    "organizerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "meetingTemplateId" TEXT,

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_attendees" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "userId" TEXT,
    "candidateId" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "status" "AttendeeStatus" NOT NULL DEFAULT 'PENDING',
    "isCandidate" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "meeting_attendees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_templates" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "meetingType" "MeetingType" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meeting_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "careers_page_settings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "logoUrl" TEXT,
    "primaryColor" TEXT DEFAULT '#007bff',
    "focusColor" TEXT DEFAULT '#007bff',
    "hyperlinkColor" TEXT DEFAULT '#007bff',
    "googleAnalyticsId" TEXT,
    "trackingPixelUrl" TEXT,
    "embedJobsCode" TEXT,
    "customCSS" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "careers_page_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_screening_configs" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "guidance" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_screening_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_scheduling_configs" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_scheduling_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_note_taking_configs" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "transcript" TEXT,
    "summary" TEXT,
    "actionItems" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_note_taking_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_interaction_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "inputType" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "output" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_interaction_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_business_preferences" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "businessOverview" TEXT,
    "businessCulture" TEXT,
    "businessValues" TEXT,
    "businessMission" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_business_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_communication_preferences" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "tone" "AITone" NOT NULL DEFAULT 'PROFESSIONAL_FORMAL',
    "blockedTeamTopics" JSONB,
    "blockedCandidateTopics" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_communication_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_integrations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "CalendarProvider" NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "scopes" TEXT,
    "calendarId" TEXT,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_board_integrations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "boardName" TEXT NOT NULL,
    "apiKey" TEXT,
    "config" JSONB,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_board_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_templates" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "type" "TemplateType" NOT NULL DEFAULT 'EMAIL',
    "stageTrigger" "StageType",
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_userId_key" ON "user_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "company_members_companyId_userId_key" ON "company_members"("companyId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "jobs_jobCode_key" ON "jobs"("jobCode");

-- CreateIndex
CREATE UNIQUE INDEX "departments_companyId_name_key" ON "departments"("companyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "candidates_email_key" ON "candidates"("email");

-- CreateIndex
CREATE UNIQUE INDEX "applications_jobId_candidateId_key" ON "applications"("jobId", "candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_templates_companyId_name_key" ON "workflow_templates"("companyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_stage_templates_workflowTemplateId_order_key" ON "workflow_stage_templates"("workflowTemplateId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_stage_templates_workflowTemplateId_name_key" ON "workflow_stage_templates"("workflowTemplateId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "job_workflows_jobId_key" ON "job_workflows"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "job_workflow_stages_jobWorkflowId_order_key" ON "job_workflow_stages"("jobWorkflowId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "job_workflow_stages_jobWorkflowId_name_key" ON "job_workflow_stages"("jobWorkflowId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "job_hiring_members_jobId_userId_key" ON "job_hiring_members"("jobId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "rating_card_templates_companyId_name_key" ON "rating_card_templates"("companyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "rating_categories_ratingCardTemplateId_name_key" ON "rating_categories"("ratingCardTemplateId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "category_scores_candidateRatingId_ratingCategoryId_key" ON "category_scores"("candidateRatingId", "ratingCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "message_threads_applicationId_key" ON "message_threads"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_attendees_meetingId_email_key" ON "meeting_attendees"("meetingId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_templates_companyId_name_key" ON "meeting_templates"("companyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "careers_page_settings_companyId_key" ON "careers_page_settings"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "ai_screening_configs_jobId_key" ON "ai_screening_configs"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "ai_scheduling_configs_jobId_key" ON "ai_scheduling_configs"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "ai_note_taking_configs_meetingId_key" ON "ai_note_taking_configs"("meetingId");

-- CreateIndex
CREATE UNIQUE INDEX "ai_business_preferences_companyId_key" ON "ai_business_preferences"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "ai_communication_preferences_companyId_key" ON "ai_communication_preferences"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "calendar_integrations_userId_key" ON "calendar_integrations"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "job_board_integrations_companyId_boardName_key" ON "job_board_integrations"("companyId", "boardName");

-- CreateIndex
CREATE UNIQUE INDEX "message_templates_companyId_name_key" ON "message_templates"("companyId", "name");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_members" ADD CONSTRAINT "company_members_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_members" ADD CONSTRAINT "company_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "job_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_locations" ADD CONSTRAINT "job_locations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_form_fields" ADD CONSTRAINT "application_form_fields_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_form_fields" ADD CONSTRAINT "application_form_fields_customQuestionId_fkey" FOREIGN KEY ("customQuestionId") REFERENCES "custom_questions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_answers" ADD CONSTRAINT "candidate_answers_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_answers" ADD CONSTRAINT "candidate_answers_customQuestionId_fkey" FOREIGN KEY ("customQuestionId") REFERENCES "custom_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_answers" ADD CONSTRAINT "candidate_answers_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_templates" ADD CONSTRAINT "workflow_templates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_stage_templates" ADD CONSTRAINT "workflow_stage_templates_workflowTemplateId_fkey" FOREIGN KEY ("workflowTemplateId") REFERENCES "workflow_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_workflows" ADD CONSTRAINT "job_workflows_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_workflows" ADD CONSTRAINT "job_workflows_workflowTemplateId_fkey" FOREIGN KEY ("workflowTemplateId") REFERENCES "workflow_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_workflow_stages" ADD CONSTRAINT "job_workflow_stages_jobWorkflowId_fkey" FOREIGN KEY ("jobWorkflowId") REFERENCES "job_workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_hiring_members" ADD CONSTRAINT "job_hiring_members_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_hiring_members" ADD CONSTRAINT "job_hiring_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rating_card_templates" ADD CONSTRAINT "rating_card_templates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rating_categories" ADD CONSTRAINT "rating_categories_ratingCardTemplateId_fkey" FOREIGN KEY ("ratingCardTemplateId") REFERENCES "rating_card_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_ratings" ADD CONSTRAINT "candidate_ratings_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_ratings" ADD CONSTRAINT "candidate_ratings_raterId_fkey" FOREIGN KEY ("raterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_ratings" ADD CONSTRAINT "candidate_ratings_ratingCardTemplateId_fkey" FOREIGN KEY ("ratingCardTemplateId") REFERENCES "rating_card_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_scores" ADD CONSTRAINT "category_scores_candidateRatingId_fkey" FOREIGN KEY ("candidateRatingId") REFERENCES "candidate_ratings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_scores" ADD CONSTRAINT "category_scores_ratingCategoryId_fkey" FOREIGN KEY ("ratingCategoryId") REFERENCES "rating_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_threads" ADD CONSTRAINT "message_threads_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "message_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_meetingTemplateId_fkey" FOREIGN KEY ("meetingTemplateId") REFERENCES "meeting_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_attendees" ADD CONSTRAINT "meeting_attendees_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_attendees" ADD CONSTRAINT "meeting_attendees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "careers_page_settings" ADD CONSTRAINT "careers_page_settings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_screening_configs" ADD CONSTRAINT "ai_screening_configs_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_scheduling_configs" ADD CONSTRAINT "ai_scheduling_configs_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_note_taking_configs" ADD CONSTRAINT "ai_note_taking_configs_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_interaction_logs" ADD CONSTRAINT "ai_interaction_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_integrations" ADD CONSTRAINT "calendar_integrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_board_integrations" ADD CONSTRAINT "job_board_integrations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
