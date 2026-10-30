// Shapes mirror the backend's Mongoose models / controller responses.

export type Role = "platform_admin" | "client_admin" | "user";

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface Paginated<T> extends ApiResponse<T[]> {
  pagination: { perPage: number; pageNo: number; total: number; totalPages: number };
}

export interface SessionUser {
  _id: string;
  name: string;
  email: string;
  role: Role;
  companyId?: string | null;
  mustChangePassword?: boolean;
}

export interface LoginResponse extends ApiResponse<SessionUser> {
  token: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  companyId?: string | null;
  department?: string;
  jobTitle?: string;
  isActive: boolean;
  avatarUrl?: string | null;
  lastLoginAt?: string | null;
  mustChangePassword?: boolean;
  is_verified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Company {
  _id: string;
  name: string;
  industry?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  city?: string;
  state?: string;
  isActive: boolean;
  paymentMethods?: string;
  branding?: { logoUrl?: string; primaryColor?: string; accentColor?: string };
  notificationPreferences?: Record<string, boolean>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanyDashboard {
  courses: { total: number; draft: number; published: number };
  forms: { total: number; draft: number; published: number };
  employees: { total: number };
  enrollments: { total: number; assigned: number; inProgress: number; completed: number; overdue: number };
  certificates: { total: number };
}

export type CourseStatus = "draft" | "published" | "archived";

export interface CourseModule {
  _id: string;
  title: string;
  description?: string;
  sortOrder: number;
}

export interface Course {
  _id: string;
  companyId?: string | null;
  title: string;
  description?: string;
  category?: string;
  status: CourseStatus;
  durationMinutes?: string;
  certificateTitle?: string;
  coverImageUrl?: string | null;
  passScore?: string;
  isDemo?: boolean;
  issuesCertificate?: boolean;
  sourceLibraryCourseId?: string | null;
  modules: CourseModule[];
  lessonCount?: number;
  enrollmentCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LessonBlock {
  _id: string;
  type: string;
  title?: string;
  data?: unknown;
  sortOrder: number;
}

export interface Lesson {
  _id: string;
  courseId: string;
  moduleId?: string;
  title: string;
  durationMinutes?: string;
  isRequired: boolean;
  sortOrder: number;
  blocks: LessonBlock[];
}

export interface CourseDetail extends Course {
  lessons: Lesson[];
}

export interface FormField {
  _id: string;
  type?: string;
  label?: string;
  helpText?: string;
  required?: boolean;
  options?: string[];
}

export interface FormItem {
  _id: string;
  kind?: "table" | "section" | "instruction";
  title?: string;
  body?: string;
  fields: FormField[];
  columns: { _id: string; label?: string }[];
}

export interface FormPage {
  _id: string;
  title?: string;
  sortOrder: number;
  items: FormItem[];
}

export interface Form {
  _id: string;
  companyId?: string | null;
  title: string;
  description?: string;
  status: "draft" | "published";
  ownerId?: string | null;
  ownerName?: string | null;
  ownerEmail?: string | null;
  pages?: FormPage[];
}

export interface FormResponse {
  _id: string;
  formId: string;
  companyId?: string;
  submittedBy?: string;
  submittedAt?: string;
  answers: { fieldId: string; value: unknown; flagged: boolean }[];
  tableRows: { pageItemId: string; sortOrder: number; cells: { columnId: string; value: unknown }[] }[];
}

export type EnrollmentStatus = "assigned" | "in_progress" | "completed" | "overdue" | "waived";

export interface Enrollment {
  _id: string;
  courseId: string;
  courseTitle: string | null;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  companyId: string;
  status: EnrollmentStatus;
  progressPct: number;
  dueDate: string | null;
  completionAt: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface MyCourse {
  enrollmentId: string;
  courseID: string;
  title: string;
  category?: string;
  progress: number;
  status: string;
  lastActive?: string;
  estimated?: string;
  completedOn?: string;
}

export interface Certificate {
  _id: string;
  userId: string;
  courseId?: string;
  enrollmentId?: string;
  companyId: string;
  certificateTitle: string;
  certificateNumber: string;
  score: number;
  issuedAt: string | null;
  expiresAt: string | null;
  pdfUrl: string | null;
}

export interface Upload {
  _id: string;
  companyId: string | null;
  uploadedBy?: string;
  folder: string;
  storageKey: string;
  url: string;
  resourceType?: string;
  filename?: string;
  mimeType?: string;
  sizeBytes?: number;
  createdAt?: string;
}

/* ── Billing (Stripe-backed; Stripe is the source of truth, webhooks keep these in sync) ── */

export interface Plan {
  _id: string;
  name: string;
  description?: string;
  stripeProductId: string;
  monthlyPriceId?: string;
  annualPriceId?: string;
  perSeatPriceId?: string;
  seatLimit: number | null; // null = unlimited
  features: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "incomplete" | "incomplete_expired" | "unpaid";

export interface TenantBilling {
  _id: string;
  // Populated by the API: list → { name, contactEmail }; detail → same.
  companyId: { _id: string; name: string; contactEmail?: string } | null;
  // List populates { name } only; detail populates the whole Plan.
  planId: (Partial<Plan> & { _id: string; name: string }) | null;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  status: SubscriptionStatus;
  seatLimit: number | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd: boolean;
  collectionMethod?: "card" | "ach" | "invoice";
  poReference?: string;
  billingContact?: { name?: string; email?: string };
  gracePeriodUntil: string | null;
  updatedAt?: string;
}

export interface Invoice {
  _id: string;
  stripeInvoiceId: string;
  number?: string;
  amountDue?: number; // smallest currency unit (cents)
  amountPaid?: number;
  currency: string;
  status: "draft" | "open" | "paid" | "payment_failed" | "void" | "uncollectible";
  dueDate?: string | null;
  paidAt?: string | null;
  hostedInvoiceUrl?: string;
  pdfUrl?: string;
  createdAt?: string;
}

export interface PaymentMethod {
  _id: string;
  type: "card" | "bank_account";
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  bankName?: string;
  accountType?: string;
  isDefault: boolean;
}

export interface TenantBillingDetail {
  billing: TenantBilling;
  invoices: Invoice[];
  paymentMethods: PaymentMethod[];
}

export interface AppNotification {
  notificationID: string;
  createdAt: string;
  title: string;
  isNew: boolean;
  type: "default" | "course" | "form" | "success" | "warning";
  buttonText?: string | null;
  redirectTo?: "course" | "form" | "certificate" | null;
  redirectId?: string | null;
}
