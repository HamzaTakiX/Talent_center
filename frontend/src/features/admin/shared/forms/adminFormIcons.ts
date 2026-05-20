import type { LucideIcon } from 'lucide-react';
import {
  AtSign,
  Building2,
  Calendar,
  FileText,
  GraduationCap,
  Hash,
  KeyRound,
  Layers,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Paperclip,
  Phone,
  Shield,
  ShieldCheck,
  ToggleLeft,
  User,
  Users,
  Briefcase,
  Clock,
  Globe,
  BookOpen,
  Activity,
} from 'lucide-react';

/** Clés de section formulaire — icône bleue accent dashboard. */
export type AdminFormSectionKey =
  | 'personal'
  | 'identity'
  | 'academic'
  | 'access'
  | 'permissions'
  | 'roles'
  | 'credentials'
  | 'content'
  | 'attachments'
  | 'offer'
  | 'description'
  | 'request'
  | 'file'
  | 'note'
  | 'review'
  | 'security'
  | 'activity'
  | 'profile'
  | 'bio'
  | 'overview';

export const ADMIN_FORM_SECTION_ICONS: Record<AdminFormSectionKey, LucideIcon> = {
  personal: User,
  identity: User,
  academic: GraduationCap,
  access: Shield,
  permissions: ShieldCheck,
  roles: Users,
  credentials: KeyRound,
  content: MessageSquare,
  attachments: Paperclip,
  offer: Briefcase,
  description: BookOpen,
  request: FileText,
  file: Paperclip,
  note: MessageSquare,
  review: ShieldCheck,
  security: Lock,
  activity: Activity,
  profile: User,
  bio: MessageSquare,
  overview: FileText,
};

/** Clés de champs — icône dans l’input (leading). */
export type AdminFormFieldKey =
  | 'email'
  | 'fullName'
  | 'firstName'
  | 'lastName'
  | 'phone'
  | 'studentNumber'
  | 'academicYear'
  | 'filiere'
  | 'class'
  | 'title'
  | 'company'
  | 'location'
  | 'deadline'
  | 'duration'
  | 'specialization'
  | 'maxStudents'
  | 'message'
  | 'eventDate'
  | 'offerTitle'
  | 'skills'
  | 'salary'
  | 'status'
  | 'note'
  | 'type'
  | 'student'
  | 'submittedAt';

export const ADMIN_FORM_FIELD_ICONS: Record<AdminFormFieldKey, LucideIcon> = {
  email: Mail,
  fullName: User,
  firstName: User,
  lastName: User,
  phone: Phone,
  studentNumber: Hash,
  academicYear: Calendar,
  filiere: Building2,
  class: Layers,
  title: FileText,
  company: Building2,
  location: MapPin,
  deadline: Calendar,
  duration: Clock,
  specialization: GraduationCap,
  maxStudents: Users,
  message: MessageSquare,
  eventDate: Calendar,
  offerTitle: Briefcase,
  skills: BookOpen,
  salary: AtSign,
  status: ToggleLeft,
  note: MessageSquare,
  type: FileText,
  student: User,
  submittedAt: Calendar,
};

/** Clés pour grilles détail (modales lecture seule). */
export type AdminDetailFieldKey =
  | AdminFormFieldKey
  | 'sso'
  | 'platformAccess'
  | 'active'
  | 'lastLogin'
  | 'createdAt'
  | 'onboarding'
  | 'roles'
  | 'permissions'
  | 'supervisedInternships';

export const ADMIN_DETAIL_FIELD_ICONS: Partial<Record<AdminDetailFieldKey, LucideIcon>> = {
  ...ADMIN_FORM_FIELD_ICONS,
  sso: Globe,
  platformAccess: ShieldCheck,
  active: Activity,
  lastLogin: Clock,
  createdAt: Calendar,
  onboarding: Activity,
  roles: Users,
  permissions: Shield,
  status: ToggleLeft,
};

export type AdminDetailSectionKey = AdminFormSectionKey;

export const ADMIN_DETAIL_SECTION_ICONS = ADMIN_FORM_SECTION_ICONS;
