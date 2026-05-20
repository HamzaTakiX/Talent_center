import {
  Briefcase,
  Calendar,
  GraduationCap,
  Megaphone,
  Trophy,
  User,
  type LucideIcon,
} from 'lucide-react';
import type { AnnouncementTag } from '../types';

export const announcementCategoryIconMap: Record<AnnouncementTag, LucideIcon> = {
  Interview: User,
  Event: Calendar,
  Competition: Trophy,
  Internship: Briefcase,
  Seminar: GraduationCap,
  Announcement: Megaphone,
};
