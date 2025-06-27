import { 
  users, reviews, templates, responses,
  type User, type InsertUser, 
  type Review, type InsertReview, type ReviewWithResponse,
  type Template, type InsertTemplate,
  type Response, type InsertResponse,
  type DashboardStats
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Review operations
  getReviews(filters?: {
    rating?: number;
    status?: string;
    dateRange?: string;
    search?: string;
  }): Promise<ReviewWithResponse[]>;
  getReview(id: number): Promise<ReviewWithResponse | undefined>;
  getReviewByGMBId(gmbId?: string): Promise<ReviewWithResponse | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  updateReviewResponse(id: number, response: string, status: string): Promise<Review | undefined>;

  // Template operations
  getTemplates(): Promise<Template[]>;
  getTemplate(id: number): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: number, template: Partial<InsertTemplate>): Promise<Template | undefined>;
  deleteTemplate(id: number): Promise<boolean>;

  // Response operations
  createResponse(response: InsertResponse): Promise<Response>;
  getResponsesByReview(reviewId: number): Promise<Response[]>;

  // Dashboard operations
  getDashboardStats(): Promise<DashboardStats>;

  // GMB Integration operations
  saveGMBTokens(userId: number, tokens: any): Promise<void>;
  getGMBTokens(userId: number): Promise<any>;
  saveGMBAccount(userId: number, accountData: any): Promise<void>;
  getGMBAccount(userId: number): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private reviews: Map<number, Review>;
  private templates: Map<number, Template>;
  private responses: Map<number, Response>;
  private gmbTokens: Map<number, any>;
  private gmbAccounts: Map<number, any>;
  private currentUserId: number;
  private currentReviewId: number;
  private currentTemplateId: number;
  private currentResponseId: number;

  constructor() {
    this.users = new Map();
    this.reviews = new Map();
    this.templates = new Map();
    this.responses = new Map();
    this.gmbTokens = new Map();
    this.gmbAccounts = new Map();
    this.currentUserId = 1;
    this.currentReviewId = 1;
    this.currentTemplateId = 1;
    this.currentResponseId = 1;

    // Initialize with sample templates
    this.initializeTemplates();
    // Initialize with sample reviews
    this.initializeReviews();
  }

  private initializeTemplates() {
    const defaultTemplates: Omit<Template, 'id'>[] = [
      {
        name: "Thank You Response",
        content: "Thank you so much for your wonderful review! We're thrilled that you had such a positive experience with us. Your feedback means the world to our team, and we look forward to serving you again soon!",
        category: "positive",
        isDefault: true,
      },
      {
        name: "Service Improvement",
        content: "Thank you for taking the time to share your feedback. We appreciate your constructive comments and are actively working to improve in the areas you mentioned. We'd love the opportunity to provide you with a better experience in the future.",
        category: "neutral",
        isDefault: true,
      },
      {
        name: "Apology Response",
        content: "We sincerely apologize for not meeting your expectations. Your experience doesn't reflect our usual standards, and we take your feedback very seriously. Please contact us directly so we can make this right and ensure it doesn't happen again.",
        category: "negative",
        isDefault: true,
      },
      {
        name: "Anniversary/Special Occasion",
        content: "Thank you for choosing us for your special celebration! We're absolutely delighted that we could be part of your memorable moment. It means the world to us that you had such a wonderful experience.",
        category: "special",
        isDefault: true,
      },
    ];

    defaultTemplates.forEach(template => {
      const id = this.currentTemplateId++;
      this.templates.set(id, { ...template, id });
    });
  }

  private initializeReviews() {
    const sampleReviews: Omit<Review, 'id'>[] = [
      {
        customerName: "Sarah Miller",
        customerInitials: "SM",
        rating: 5,
        content: "Excellent service! The food was delicious and the staff was incredibly friendly. Will definitely be back!",
        datePosted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        responseStatus: "responded",
        response: "Thank you so much for the kind words, Sarah! We're thrilled you enjoyed your experience. Looking forward to welcoming you back soon!",
        responseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        category: "positive",
      },
      {
        customerName: "John Davis",
        customerInitials: "JD",
        rating: 4,
        content: "Great atmosphere and good food. Service was a bit slow during peak hours but overall a pleasant experience.",
        datePosted: new Date(Date.now() - 4 * 60 * 60 * 1000),
        responseStatus: "pending",
        response: null,
        responseDate: null,
        category: "neutral",
      },
      {
        customerName: "Mike Johnson",
        customerInitials: "MJ",
        rating: 2,
        content: "Food was cold when it arrived and the order was wrong. Had to wait 20 minutes for them to fix it. Not impressed with the service.",
        datePosted: new Date(Date.now() - 6 * 60 * 60 * 1000),
        responseStatus: "priority",
        response: null,
        responseDate: null,
        category: "negative",
      },
      {
        customerName: "Lisa Wilson",
        customerInitials: "LW",
        rating: 5,
        content: "Amazing experience! The ambiance was perfect for our anniversary dinner. Thank you for making our evening special!",
        datePosted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        responseStatus: "draft",
        response: "Thank you so much for choosing us for your anniversary, Lisa! We're absolutely delighted that we could be part of your special celebration. It means the world to us that you had such a wonderful experience.",
        responseDate: null,
        category: "special",
      },
      {
        customerName: "David Chen",
        customerInitials: "DC",
        rating: 5,
        content: "Outstanding quality and presentation. The chef's special was absolutely perfect. Highly recommend!",
        datePosted: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        responseStatus: "responded",
        response: "Thank you, David! We're so pleased you enjoyed the chef's special. Your recommendation means everything to us!",
        responseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        category: "positive",
      },
      {
        customerName: "Emma Thompson",
        customerInitials: "ET",
        rating: 3,
        content: "Decent food but the wait time was longer than expected. The staff was apologetic though.",
        datePosted: new Date(Date.now() - 8 * 60 * 60 * 1000),
        responseStatus: "pending",
        response: null,
        responseDate: null,
        category: "neutral",
      },
    ];

    sampleReviews.forEach(review => {
      const id = this.currentReviewId++;
      this.reviews.set(id, { ...review, id });
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Review operations
  async getReviews(filters?: {
    rating?: number;
    status?: string;
    dateRange?: string;
    search?: string;
  }): Promise<ReviewWithResponse[]> {
    let filteredReviews = Array.from(this.reviews.values());

    if (filters) {
      if (filters.rating) {
        filteredReviews = filteredReviews.filter(review => review.rating === filters.rating);
      }
      if (filters.status) {
        filteredReviews = filteredReviews.filter(review => review.responseStatus === filters.status);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredReviews = filteredReviews.filter(review => 
          review.customerName.toLowerCase().includes(searchLower) ||
          review.content.toLowerCase().includes(searchLower)
        );
      }
      if (filters.dateRange) {
        const now = new Date();
        let cutoffDate: Date;
        
        switch (filters.dateRange) {
          case "last-7-days":
            cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case "last-30-days":
            cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case "last-3-months":
            cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
          default:
            cutoffDate = new Date(0);
        }
        
        filteredReviews = filteredReviews.filter(review => review.datePosted >= cutoffDate);
      }
    }

    // Sort by date posted (newest first)
    filteredReviews.sort((a, b) => b.datePosted.getTime() - a.datePosted.getTime());

    // Add responses to each review
    const reviewsWithResponses: ReviewWithResponse[] = await Promise.all(
      filteredReviews.map(async (review) => ({
        ...review,
        responses: await this.getResponsesByReview(review.id),
      }))
    );

    return reviewsWithResponses;
  }

  async getReview(id: number): Promise<ReviewWithResponse | undefined> {
    const review = this.reviews.get(id);
    if (!review) return undefined;

    return {
      ...review,
      responses: await this.getResponsesByReview(id),
    };
  }

  async getReviewByGMBId(gmbId?: string): Promise<ReviewWithResponse | undefined> {
    if (!gmbId) return undefined;
    
    for (const review of this.reviews.values()) {
      if (review.sourceId === gmbId) {
        const responses = await this.getResponsesByReview(review.id);
        return { ...review, responses };
      }
    }
    return undefined;
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    const newReview: Review = { 
      ...review, 
      id,
      response: review.response || null,
      responseDate: review.responseDate || null,
      category: review.category || null,
      responseStatus: review.responseStatus || "pending"
    };
    this.reviews.set(id, newReview);
    return newReview;
  }

  async updateReviewResponse(id: number, response: string, status: string): Promise<Review | undefined> {
    const review = this.reviews.get(id);
    if (!review) return undefined;

    const updatedReview = {
      ...review,
      response,
      responseStatus: status as any,
      responseDate: status === "responded" ? new Date() : null,
    };

    this.reviews.set(id, updatedReview);
    return updatedReview;
  }

  // Template operations
  async getTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values());
  }

  async getTemplate(id: number): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const id = this.currentTemplateId++;
    const newTemplate: Template = { 
      ...template, 
      id,
      isDefault: template.isDefault ?? false
    };
    this.templates.set(id, newTemplate);
    return newTemplate;
  }

  async updateTemplate(id: number, template: Partial<InsertTemplate>): Promise<Template | undefined> {
    const existingTemplate = this.templates.get(id);
    if (!existingTemplate) return undefined;

    const updatedTemplate = { ...existingTemplate, ...template };
    this.templates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  async deleteTemplate(id: number): Promise<boolean> {
    return this.templates.delete(id);
  }

  // Response operations
  async createResponse(response: InsertResponse): Promise<Response> {
    const id = this.currentResponseId++;
    const newResponse: Response = { 
      ...response, 
      id, 
      createdAt: new Date(),
      isAiGenerated: response.isAiGenerated ?? false,
      sentAt: response.sentAt || null
    };
    this.responses.set(id, newResponse);
    return newResponse;
  }

  async getResponsesByReview(reviewId: number): Promise<Response[]> {
    return Array.from(this.responses.values()).filter(
      response => response.reviewId === reviewId
    );
  }

  // Dashboard operations
  async getDashboardStats(): Promise<DashboardStats> {
    const allReviews = Array.from(this.reviews.values());
    const totalReviews = allReviews.length;
    const pendingResponses = allReviews.filter(r => r.responseStatus === "pending" || r.responseStatus === "priority").length;
    const respondedReviews = allReviews.filter(r => r.responseStatus === "responded").length;
    
    const averageRating = totalReviews > 0 
      ? allReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

    const responseRate = totalReviews > 0 
      ? (respondedReviews / totalReviews) * 100
      : 0;

    // Calculate monthly growth (simplified)
    const thisMonth = new Date();
    const lastMonth = new Date(thisMonth.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const thisMonthReviews = allReviews.filter(r => r.datePosted >= lastMonth);
    const lastMonthReviews = allReviews.filter(r => 
      r.datePosted >= new Date(lastMonth.getTime() - 30 * 24 * 60 * 60 * 1000) && 
      r.datePosted < lastMonth
    );

    const reviewsGrowth = lastMonthReviews.length > 0 
      ? ((thisMonthReviews.length - lastMonthReviews.length) / lastMonthReviews.length) * 100
      : 0;

    return {
      totalReviews,
      pendingResponses,
      averageRating: Math.round(averageRating * 10) / 10,
      responseRate: Math.round(responseRate),
      monthlyGrowth: {
        reviews: Math.round(reviewsGrowth),
        rating: 2, // Simplified
        responses: 5, // Simplified
      },
    };
  }

  // GMB Integration methods
  async saveGMBTokens(userId: number, tokens: any): Promise<void> {
    this.gmbTokens.set(userId, tokens);
  }

  async getGMBTokens(userId: number): Promise<any> {
    return this.gmbTokens.get(userId);
  }

  async saveGMBAccount(userId: number, accountData: any): Promise<void> {
    this.gmbAccounts.set(userId, accountData);
  }

  async getGMBAccount(userId: number): Promise<any> {
    return this.gmbAccounts.get(userId);
  }
}

export const storage = new MemStorage();
