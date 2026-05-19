export interface PostAuthor {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
  isAnonymous?: boolean;
}

export interface MyPost {
  id: string;
  body: string;
  authorAccountId: string;
  attachedArticleId: string | null;
  likeCount: number;
  dislikeCount: number;
  createdAt: string;
  updatedAt: string;
  author: PostAuthor;
  attachedArticle?: {
    id: string;
    title: string;
    slug: string;
  } | null;
}