import { Tag, CreateTagDto, UpdateTagDto } from "@/types/tag";
import { api } from "../axios";
import { ApiResponse } from "@/types/api";

/**
 * API service for tag-related endpoints
 */
export const tagsApi = {
  /**
   * Get all tags with pagination metadata
   * @returns Array of tags with pagination metadata
   */
  getAllTags: async (
    page: number = 1,
    limit: number = 10,
    search: string = "",
    assignmentFilter: string = "all",
    sortBy: string = "created_at",
    sortOrder: string = "desc",
  ): Promise<ApiResponse<Tag[]>> => {
    // Fetch paginated tags from the backend
    const response: ApiResponse<Tag[]> = await api.get(
      `/tags?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&assignmentFilter=${assignmentFilter}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
    );

    return {
      data: response.data ?? [],
      metadata: response.metadata ?? {
        total: 0,
        page,
        totalPages: 1,
      },
    };
  },

  /**
   * Get all tags for a specific item
   * @param itemId - Item ID
   * @returns Array of tags assigned to the item
   */
  getTagById: (itemId: string): Promise<Tag> => api.get(`/tags/item/${itemId}`),

  /**
   * Get all tags for a specific item
   * @param itemId - Item ID
   * @returns Array of tags assigned to the item
   */
  getTagsByItem: (itemId: string): Promise<Tag[]> =>
    api.get(`/tags/item/${itemId}`),

  /**
   * Create a new tag
   * @param tag - Tag data to create
   * @returns Created tag
   */
  createTag: (tag: CreateTagDto): Promise<Tag> => api.post("/tags", tag),

  /**
   * Update an existing tag
   * @param id - Tag ID
   * @param tagData - Updated tag data
   * @returns Updated tag
   */
  updateTag: (id: string, tagData: UpdateTagDto): Promise<Tag> =>
    api.put(`/tags/${id}`, tagData),

  /**
   * Delete a tag
   * @param id - Tag ID to delete
   */
  deleteTag: (id: string): Promise<void> => api.delete(`/tags/${id}`),

  /**
   * Assign tags to an item
   * @param itemId - Item ID
   * @param tagIds - Array of tag IDs to assign
   */
  assignTagToItem: (itemId: string, tagIds: string[]): Promise<void> =>
    api.post(`/tags/${itemId}/assign`, { tagIds }),

  /**
   * Remove a tag from an item
   * @param itemId - Item ID
   * @param tagId - Tag ID to remove
   */
  removeTagFromItem: (itemId: string, tagId: string): Promise<void> =>
    api.post("/tags/remove", { itemId, tagId }),
};
