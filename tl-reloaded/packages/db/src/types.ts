// Types-only export for frontend use
// These are compile-time only and won't increase bundle size
export type {
  User,
  Prisma,
} from './generated/client';

// Enums need to be exported as values (not types) for runtime use (e.g., class-validator)
export {
  UserRole,
  PreferredTitle,
  ProfileVisibility,
  SchoolStatus,
  SchoolType,
  AustrianState,
  PaymentMethod,
  PaymentStatus,
  ClassTeacherRole,
  CourseStatus,
  DifficultyLevel,
  LessonStatus,
  FileType,
  QuestionType,
  ProjectStatus,
  ProjectVisibility,
  AssetType,
  OrganizerType,
  RegionType,
  ChallengeStatus,
  SubmissionStatus,
  CertificateType,
  AwardType,
  TransactionType,
  SourceType,
  ShopItemType,
  ConversationType,
  MessageType,
  NotificationType,
  RelatedType,
} from './generated/client';
