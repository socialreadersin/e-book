/**
 * Social Readers - Domain Models & Types
 * READ FOR CHANGE
 */

export type UserRole = 'USER' | 'ADMIN';

export interface User {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  memberSince?: string;
  libraryCount?: number;
  totalContributed?: number;
}

export type ContentType = 'ebook' | 'audiobook' | 'both';

export type ContentStatus = 'draft' | 'published' | 'archived';

export interface AudioChapter {
  chapterId: string;
  title: string;
  storagePath: string; // e.g. audiobooks/{audiobookId}/chapter-01.mp3
  audioUrl?: string; // Secure signed URL or preview URL
  duration: string; // e.g. "45 mins" or "12:30"
  order: number;
}

export interface BilingualText {
  en: string;
  ta?: string;
}

export interface BaseContent {
  id: string;
  type: ContentType;
  title: BilingualText | string;
  subtitle?: BilingualText | string;
  author: BilingualText | string;
  description: BilingualText | string;
  category: string;
  language: string; // e.g. 'en', 'ta', 'bilingual'
  price: number;
  currency: 'INR' | 'USD';
  coverImageUrl: string;
  coverUrl?: string; // alias for backward compatibility
  status: ContentStatus;
  isFeatured?: boolean;
  isBestseller?: boolean;
  rating?: number;
  reviewsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface EbookContent extends BaseContent {
  type: 'ebook';
  pdfStoragePath?: string; // e.g. ebooks/{bookId}/book.pdf
  pdfFileName?: string;
  pdfUrl?: string;
  fileSize?: number; // bytes
  priceEbook?: number;
}

export interface AudiobookContent extends BaseContent {
  type: 'audiobook';
  narrator?: string;
  totalDuration?: string;
  audioDuration?: string; // alias
  audioUrl?: string; // preview audio
  chapters: AudioChapter[];
  priceAudiobook?: number;
}

export interface BundleContent extends BaseContent {
  type: 'both';
  pdfStoragePath?: string;
  pdfFileName?: string;
  pdfUrl?: string;
  fileSize?: number;
  priceEbook?: number;
  narrator?: string;
  totalDuration?: string;
  audioDuration?: string;
  audioUrl?: string;
  chapters?: AudioChapter[];
  priceAudiobook?: number;
}

export type ContentItem = EbookContent | AudiobookContent | BundleContent;
export type Book = ContentItem;

export type PaymentStatus = 
  | 'PENDING'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface OrderItem {
  contentId: string;
  title: string;
  author?: string;
  format: 'ebook' | 'audiobook' | 'both';
  price: number;
  coverImageUrl?: string;
}

export interface Order {
  orderId: string;
  userId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  buyerName?: string;
  buyerEmail?: string;
  bookId?: string; // legacy single-item
  bookTitle?: string;
  format?: 'ebook' | 'audiobook' | 'both';
  items?: OrderItem[];
  subtotal?: number;
  total?: number;
  amount: number;
  causeShare: number;
  currency: 'INR' | 'USD';
  paymentStatus: PaymentStatus;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentGateway: 'cashfree' | 'cashfree-test' | 'razorpay-deprecated';
  gatewayOrderId?: string;
  cashfreeOrderId?: string;
  paymentSessionId?: string;
  paymentId?: string;
  environment?: 'sandbox' | 'production';
  createdAt: string;
  paidAt?: string;
  updatedAt?: string;
}

export interface LibraryItem {
  contentId: string;
  contentType: ContentType;
  orderId: string;
  purchasedAt: string;
  accessStatus: 'active' | 'revoked' | 'expired';
  downloadCount: number;
  lastDownloadedAt?: string;
  lastAccessedAt?: string;
  // Audiobook playback progress tracking
  lastPosition?: number; // seconds
  lastChapterId?: string;
  lastPlayedAt?: string;
  // Denormalized metadata for fast offline rendering
  title?: string;
  author?: string;
  coverImageUrl?: string;
  storagePath?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: BilingualText | string;
  description: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt?: string;
}

export interface StoreSettings {
  cloudinaryCloudName: string;
  cloudinaryUploadPreset: string;
  causePercentage: number;
  educationSplit: number;
  sportsSplit: number;
  supportEmail: string;
  cashfreeAppId?: string;
  cashfreeEnvironment?: 'sandbox' | 'production';
}
