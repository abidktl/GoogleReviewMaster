import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertReviewSchema, insertTemplateSchema, insertResponseSchema } from "@shared/schema";
import { generateResponseSuggestions, improveResponse } from "./services/openai";
import { gmbApiService } from "./services/gmb-api";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Reviews endpoints
  app.get("/api/reviews", async (req, res) => {
    try {
      const { rating, status, dateRange, search } = req.query;
      const filters = {
        rating: rating ? parseInt(rating as string) : undefined,
        status: status as string,
        dateRange: dateRange as string,
        search: search as string,
      };
      
      const reviews = await storage.getReviews(filters);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.get("/api/reviews/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const review = await storage.getReview(id);
      
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      res.json(review);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch review" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const validatedData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      res.status(400).json({ message: "Invalid review data" });
    }
  });

  app.patch("/api/reviews/:id/response", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { response, status } = req.body;
      
      if (!response || !status) {
        return res.status(400).json({ message: "Response and status are required" });
      }
      
      const updatedReview = await storage.updateReviewResponse(id, response, status);
      
      if (!updatedReview) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      res.json(updatedReview);
    } catch (error) {
      res.status(500).json({ message: "Failed to update review response" });
    }
  });

  // AI suggestions
  app.post("/api/reviews/:id/ai-suggestions", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const review = await storage.getReview(id);
      
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      const suggestions = await generateResponseSuggestions(
        review.content,
        review.rating,
        review.customerName
      );
      
      res.json({ suggestions });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate AI suggestions" });
    }
  });

  app.post("/api/ai/improve-response", async (req, res) => {
    try {
      const { response, reviewContent, rating } = req.body;
      
      if (!response || !reviewContent || rating === undefined) {
        return res.status(400).json({ message: "Response, review content, and rating are required" });
      }
      
      const improvedResponse = await improveResponse(response, reviewContent, rating);
      res.json({ improvedResponse });
    } catch (error) {
      res.status(500).json({ message: "Failed to improve response" });
    }
  });

  // Templates endpoints
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.post("/api/templates", async (req, res) => {
    try {
      const validatedData = insertTemplateSchema.parse(req.body);
      const template = await storage.createTemplate(validatedData);
      res.status(201).json(template);
    } catch (error) {
      res.status(400).json({ message: "Invalid template data" });
    }
  });

  app.patch("/api/templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTemplateSchema.partial().parse(req.body);
      const updatedTemplate = await storage.updateTemplate(id, validatedData);
      
      if (!updatedTemplate) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      res.json(updatedTemplate);
    } catch (error) {
      res.status(400).json({ message: "Invalid template data" });
    }
  });

  app.delete("/api/templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTemplate(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete template" });
    }
  });

  // Responses endpoints
  app.post("/api/responses", async (req, res) => {
    try {
      const validatedData = insertResponseSchema.parse(req.body);
      const response = await storage.createResponse(validatedData);
      res.status(201).json(response);
    } catch (error) {
      res.status(400).json({ message: "Invalid response data" });
    }
  });

  // Export functionality
  app.get("/api/export/reviews", async (req, res) => {
    try {
      const reviews = await storage.getReviews();
      
      // Generate CSV content
      const csvHeaders = "Date,Customer,Rating,Review,Response Status,Response,Response Date\n";
      const csvRows = reviews.map(review => 
        `"${review.datePosted.toISOString()}","${review.customerName}","${review.rating}","${review.content.replace(/"/g, '""')}","${review.responseStatus}","${review.response?.replace(/"/g, '""') || ''}","${review.responseDate?.toISOString() || ''}"`
      ).join("\n");
      
      const csvContent = csvHeaders + csvRows;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="reviews-export.csv"');
      res.send(csvContent);
    } catch (error) {
      res.status(500).json({ message: "Failed to export reviews" });
    }
  });

  // GMB API Integration routes
  app.get("/api/gmb/auth-url", async (req, res) => {
    try {
      const authUrl = gmbApiService.getAuthUrl();
      res.json({ authUrl });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate auth URL" });
    }
  });

  app.post("/api/gmb/callback", async (req, res) => {
    try {
      const code = req.query.code as string;
      if (!code) {
        return res.status(400).json({ message: "Authorization code required" });
      }

      const tokens = await gmbApiService.getTokensFromCode(code);
      const userId = 1; // For now, use a default user ID
      
      await storage.saveGMBTokens(userId, tokens);
      gmbApiService.setCredentials(tokens);

      // Fetch and save account information
      const accounts = await gmbApiService.listAccounts();
      if (accounts.length > 0) {
        await storage.saveGMBAccount(userId, accounts[0]);
      }

      res.json({ success: true, message: "GMB integration completed" });
    } catch (error) {
      console.error("GMB callback error:", error);
      res.status(500).json({ message: "Failed to complete GMB authorization" });
    }
  });

  app.get("/api/gmb/accounts", async (req, res) => {
    try {
      const userId = 1; // For now, use a default user ID
      const tokens = await storage.getGMBTokens(userId);
      
      if (!tokens) {
        return res.status(401).json({ message: "GMB not authorized" });
      }

      gmbApiService.setCredentials(tokens);
      const accounts = await gmbApiService.listAccounts();
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch GMB accounts" });
    }
  });

  app.get("/api/gmb/locations/:accountId", async (req, res) => {
    try {
      const { accountId } = req.params;
      const userId = 1; // For now, use a default user ID
      const tokens = await storage.getGMBTokens(userId);
      
      if (!tokens) {
        return res.status(401).json({ message: "GMB not authorized" });
      }

      gmbApiService.setCredentials(tokens);
      const locations = await gmbApiService.listLocations(accountId);
      res.json(locations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch GMB locations" });
    }
  });

  app.get("/api/gmb/reviews/:accountId/:locationId", async (req, res) => {
    try {
      const { accountId, locationId } = req.params;
      const userId = 1; // For now, use a default user ID
      const tokens = await storage.getGMBTokens(userId);
      
      if (!tokens) {
        return res.status(401).json({ message: "GMB not authorized" });
      }

      gmbApiService.setCredentials(tokens);
      const reviews = await gmbApiService.getReviews(accountId, locationId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch GMB reviews" });
    }
  });

  app.post("/api/gmb/sync/:accountId/:locationId", async (req, res) => {
    try {
      const { accountId, locationId } = req.params;
      const userId = 1; // For now, use a default user ID
      const tokens = await storage.getGMBTokens(userId);
      
      if (!tokens) {
        return res.status(401).json({ message: "GMB not authorized" });
      }

      gmbApiService.setCredentials(tokens);
      const syncedCount = await gmbApiService.syncReviewsToLocal(accountId, locationId, storage);
      
      res.json({ 
        success: true, 
        message: `Synced ${syncedCount} new reviews from GMB`,
        syncedCount 
      });
    } catch (error) {
      console.error("GMB sync error:", error);
      res.status(500).json({ message: "Failed to sync GMB reviews" });
    }
  });

  app.post("/api/gmb/reply/:accountId/:locationId/:reviewId", async (req, res) => {
    try {
      const { accountId, locationId, reviewId } = req.params;
      const { replyText } = req.body;
      const userId = 1; // For now, use a default user ID
      
      if (!replyText) {
        return res.status(400).json({ message: "Reply text required" });
      }

      const tokens = await storage.getGMBTokens(userId);
      if (!tokens) {
        return res.status(401).json({ message: "GMB not authorized" });
      }

      gmbApiService.setCredentials(tokens);
      const reply = await gmbApiService.replyToReview(accountId, locationId, reviewId, replyText);
      
      res.json({ success: true, reply });
    } catch (error) {
      console.error("GMB reply error:", error);
      res.status(500).json({ message: "Failed to reply to GMB review" });
    }
  });

  app.get("/api/gmb/status", async (req, res) => {
    try {
      const userId = 1; // For now, use a default user ID
      const tokens = await storage.getGMBTokens(userId);
      const account = await storage.getGMBAccount(userId);
      
      res.json({
        isConnected: !!tokens,
        account: account || null,
        hasTokens: !!tokens
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to check GMB status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
