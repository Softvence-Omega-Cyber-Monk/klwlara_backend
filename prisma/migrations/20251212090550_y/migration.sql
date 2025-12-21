-- CreateEnum
CREATE TYPE "Role" AS ENUM ('VIEWER', 'EMPLOYEE', 'SUPPORTER', 'MANAGER', 'ADMIN', 'CLIENT', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('ENGLISH');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'HALFYEARLY', 'YEARLY', 'TWOYEARLY', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "IndustryCategory" AS ENUM ('REALESTATE', 'FINANCE', 'RENEWABLE_ENERGY', 'TRAVEL_AGENCY', 'BEAUTY_AND_WELLNESS');

-- CreateEnum
CREATE TYPE "SupporterRole" AS ENUM ('CALLATTENDANCE', 'SUPPORTMANAGER', 'SALESOFFICER', 'SYSTEMENGINEER');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('HIGH', 'MEDIUM', 'LOW', 'NORMAL');

-- CreateEnum
CREATE TYPE "ProjectCycle" AS ENUM ('WEEKLY', 'BI_WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PENDING', 'LIVE', 'DRAFT', 'OVERDUE', 'PROBLEM', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('INPROGRESS', 'COMPLETED', 'OVERDUE', 'NOSTART');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'UNASSIGNED', 'IN_PROGRESS', 'SOLVED');

-- CreateEnum
CREATE TYPE "IssueType" AS ENUM ('LOGINFAILED', 'SYSTEMERROR', 'OTHERPROBLEM');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'BANNED', 'DELETED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ActivityActionType" AS ENUM ('ASSIGNEE_ADDED', 'ASSIGNEE_REMOVED', 'FILE_ADDED', 'FILE_REMOVED', 'LINK_ADDED', 'LINK_REMOVED', 'DUE_DATE_CHANGED', 'PROGRESS_CHANGED', 'SUBTASK_ADDED', 'SUBTASK_REMOVED', 'STATUS_CHANGED', 'PRIORITY_CHANGED', 'COMMENT_ADDED', 'PROJECT_CREATED', 'PROJECT_UPDATED', 'TASK_CREATED', 'TASK_COMPLETED', 'GENERAL');

-- CreateEnum
CREATE TYPE "SubmittedStatus" AS ENUM ('APPROVED', 'PENDING', 'REJECTED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('NEW_EMPLOYEE_ASSIGNED', 'NEW_MANAGER_ASSIGNED', 'SUBMISSION_UPDATED_STATUS', 'PROJECT_SUBMITTED', 'PROJECT_STATUS_UPDATE', 'PROJECT_CREATED', 'REMINDER', 'SHEET_UPDATE_REQUEST', 'FILE_CREATED', 'ACTIVITY_CREATED');

-- CreateTable
CREATE TABLE "otp_verifications" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "transactionId" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverIds" TEXT[],
    "projectId" TEXT,
    "context" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_provisions" (
    "userId" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,

    CONSTRAINT "notification_provisions_pkey" PRIMARY KEY ("userId","notificationId")
);

-- CreateTable
CREATE TABLE "notification_permissions_supporter" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignNewProject" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_permissions_supporter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_permissions_admin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storageLimit" BOOLEAN NOT NULL DEFAULT true,
    "receivedPayment" BOOLEAN NOT NULL DEFAULT true,
    "createClient" BOOLEAN NOT NULL DEFAULT true,
    "createTicket" BOOLEAN NOT NULL DEFAULT true,
    "paymentCycleChange" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_permissions_admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_permissions_super_admin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storageLimit" BOOLEAN NOT NULL DEFAULT true,
    "receivedPayment" BOOLEAN NOT NULL DEFAULT true,
    "createClient" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_permissions_super_admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "super_admins" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "clientLogo" TEXT,
    "favicon" TEXT,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "super_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supporters" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "supporterRole" "SupporterRole" NOT NULL,
    "skills" TEXT[],
    "workload" INTEGER,
    "workItems" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supporters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "supporterIds" TEXT[],
    "adminIds" TEXT[],
    "companyName" TEXT,
    "subject" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "Priority" NOT NULL,
    "issue" TEXT NOT NULL,
    "adminNote" TEXT,
    "attachFile" TEXT,
    "issueType" "IssueType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',
    "profileImage" TEXT,
    "language" "Language" NOT NULL DEFAULT 'ENGLISH',
    "timezone" TIMESTAMP(3),
    "verification2FA" BOOLEAN NOT NULL DEFAULT false,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "lastActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userStatus" "UserStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "otp_verifications_email_key" ON "otp_verifications"("email");

-- CreateIndex
CREATE UNIQUE INDEX "payments_transactionId_key" ON "payments"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_permissions_supporter_userId_key" ON "notification_permissions_supporter"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_permissions_admin_userId_key" ON "notification_permissions_admin"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_permissions_super_admin_userId_key" ON "notification_permissions_super_admin"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "super_admins_userId_key" ON "super_admins"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "supporters_userId_key" ON "supporters"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phoneNumber_key" ON "users"("phoneNumber");

-- AddForeignKey
ALTER TABLE "otp_verifications" ADD CONSTRAINT "otp_verifications_email_fkey" FOREIGN KEY ("email") REFERENCES "users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_provisions" ADD CONSTRAINT "notification_provisions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_provisions" ADD CONSTRAINT "notification_provisions_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_permissions_supporter" ADD CONSTRAINT "notification_permissions_supporter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_permissions_admin" ADD CONSTRAINT "notification_permissions_admin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_permissions_super_admin" ADD CONSTRAINT "notification_permissions_super_admin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "super_admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "super_admins" ADD CONSTRAINT "super_admins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supporters" ADD CONSTRAINT "supporters_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
