export interface User {
  _id: string;
  username: string;
  email: string;
  roles: string[];
  status: string;
  profile?: {
    full_name?: string;
    avatar?: string;
    phone?: string;
    identity?: string;
  };
  created_at?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  type: string;
  description?: string;
  parent_id?: string;
  ancestors?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Article {
  _id: string;
  title: string;
  slug: string;
  content: string;
  thumbnail?: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
  };
  category: string | Category;
  tags: string[];
  status: string;
  stats?: {
    views: number;
    likes: number;
    comments: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ForumThread {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
  };
  category?: string | {
    _id: string;
    name: string;
    slug?: string;
  };
  tags: string[];
  is_pinned: boolean;
  is_locked: boolean;
  stats?: {
    views_count: number;
    replies_count: number;
  };
  last_reply_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Comment {
  _id: string;
  content: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  target_model: string;
  target_id: string;
  parent_id?: string;
  replies?: Comment[];
  likes?: number;
  isLiked?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Scholarship {
  _id: string;
  name: string;
  description?: string;
  budget?: number;
  quantity?: number;
  amount?: number; // Legacy field
  deadline?: string; // Legacy field
  end_date?: string;
  start_date?: string;
  criteria?: Array<{
    key: string;
    name: string;
    weight: number;
    description?: string;
  }>;
  requirements?: string[];
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  pagination?: Pagination;
}

