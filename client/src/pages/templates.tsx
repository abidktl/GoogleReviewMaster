import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, Copy } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Template } from "@shared/schema";
import { showToast } from "@/lib/pwa";

const templateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  isDefault: z.boolean().default(false),
});

type TemplateFormData = z.infer<typeof templateSchema>;

export default function Templates() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const queryClient = useQueryClient();

  // Fetch templates
  const { data: templates, isLoading } = useQuery<Template[]>({
    queryKey: ['/api/templates'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/templates');
      return response.json();
    },
  });

  // Create template mutation
  const createTemplate = useMutation({
    mutationFn: async (data: TemplateFormData) => {
      const response = await apiRequest('POST', '/api/templates', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      setDialogOpen(false);
      showToast("Template created successfully!", "success");
    },
    onError: () => {
      showToast("Failed to create template", "error");
    },
  });

  // Update template mutation
  const updateTemplate = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<TemplateFormData> }) => {
      const response = await apiRequest('PATCH', `/api/templates/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      setDialogOpen(false);
      setEditingTemplate(null);
      showToast("Template updated successfully!", "success");
    },
    onError: () => {
      showToast("Failed to update template", "error");
    },
  });

  // Delete template mutation
  const deleteTemplate = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      showToast("Template deleted successfully!", "success");
    },
    onError: () => {
      showToast("Failed to delete template", "error");
    },
  });

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      content: "",
      category: "",
      isDefault: false,
    },
  });

  const onSubmit = (data: TemplateFormData) => {
    if (editingTemplate) {
      updateTemplate.mutate({ id: editingTemplate.id, data });
    } else {
      createTemplate.mutate(data);
    }
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    form.reset({
      name: template.name,
      content: template.content,
      category: template.category,
      isDefault: template.isDefault || false,
    });
    setDialogOpen(true);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    showToast("Template copied to clipboard!", "success");
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteTemplate.mutate(id);
    }
  };

  const openCreateDialog = () => {
    setEditingTemplate(null);
    form.reset({
      name: "",
      content: "",
      category: "",
      isDefault: false,
    });
    setDialogOpen(true);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "positive":
        return "bg-green-100 text-green-800";
      case "negative":
        return "bg-red-100 text-red-800";
      case "neutral":
        return "bg-blue-100 text-blue-800";
      case "special":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const categoryOptions = [
    { value: "positive", label: "Positive Reviews" },
    { value: "negative", label: "Negative Reviews" },
    { value: "neutral", label: "Neutral Reviews" },
    { value: "special", label: "Special Occasions" },
    { value: "general", label: "General" },
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-6 w-6" />
              </div>
              <Skeleton className="h-20 w-full mb-4" />
              <div className="flex space-x-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Response Templates</h1>
          <p className="text-slate-600">
            Create and manage reusable response templates for different types of reviews
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? "Edit Template" : "Create New Template"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Thank You Response" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoryOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Write your response template here..."
                          className="min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createTemplate.isPending || updateTemplate.isPending}
                  >
                    {editingTemplate ? "Update Template" : "Create Template"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates Grid */}
      {templates && templates.length === 0 ? (
        <div className="empty-state">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No templates yet</h3>
          <p className="text-slate-600 mb-4">
            Create your first response template to speed up your review responses.
          </p>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates?.map((template) => (
            <Card key={template.id} className="template-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge className={`mt-2 ${getCategoryColor(template.category)}`}>
                      {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                    </Badge>
                    {template.isDefault && (
                      <Badge variant="outline" className="ml-2 mt-2">
                        Default
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                  {template.content}
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(template.content)}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  {!template.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                      disabled={deleteTemplate.isPending}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Template Categories Summary */}
      {templates && templates.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-4">
          {categoryOptions.map((category) => {
            const count = templates.filter(t => t.category === category.value).length;
            return (
              <div key={category.value} className="bg-white rounded-lg border border-slate-200 p-4 text-center">
                <div className="text-2xl font-bold text-slate-900">{count}</div>
                <div className="text-sm text-slate-600">{category.label}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
