import { Item, ValidItemOrder } from "@/types";
import { api } from "../axios";
import { ApiSingleResponse } from "@common/response.types";
import { ItemFormData } from "@common/items/form.types";
import { UpdateItem, UpdateResponse } from "@common/items/storage-items.types";
import { ProcessedCSV } from "@common/items/csv.types";

/**
 * API service for item-related endpoints
 */
export const itemsApi = {
  /**
   * Get all storage items
   * @returns Promise with an array of items
   */
  getAllItems: (page: number, limit: number) =>
    api.get(`/storage-items?page=${page}&limit=${limit}`),

  /**
   * Get a specific item by ID
   * @param id - Item ID to fetch
   * @returns Promise with the requested item
   */
  getItemById: (id: string): Promise<Item> => api.get(`/storage-items/${id}`),

  /**
   * Create a new item or multiple items
   * @param item - Item data to create
   * @returns Promise with the created item
   */
  createItems: (
    payload: ItemFormData,
  ): Promise<{ status: number; error: string | null }> =>
    api.post("/storage-items", payload),

  /**
   * ****** BETA ******
   * Parse items from a CSV file
   * @param file - File. Must be a .CSV file
   * @returns Promise with the created items
   */
  parseCSV: (file: File): Promise<ProcessedCSV> => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/storage-items/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /**
   * Update an existing item
   * @param org_id - ID of org which item belongs to
   * @param item - Updated item data
   * @param id - Item ID to update
   * @returns Promise with the updated item
   */
  updateItem: (
    item_id: string,
    item: Partial<UpdateItem>,
    org_id: string,
  ): Promise<UpdateResponse> =>
    api.put(`/storage-items/${org_id}/${item_id}`, item),

  /**
   * Delete an item
   * @param id - Item ID to delete
   */
  deleteItem: (
    org_id: string,
    item_id: string,
  ): Promise<{ success: boolean; id: string }> =>
    api.delete(`/storage-items/${org_id}/${item_id}`),

  /**
   * Get all items with a specific tag
   * @param tagId - Tag ID to filter by
   * @returns Promise with an array of items that have the specified tag
   */
  getItemsByTag: (tagId: string): Promise<Item[]> =>
    api.get(`/storage-items/by-tag/${tagId}`),

  /**
   * Get availability information for a specific item within a date range
   * @param itemId - ID of the item to check
   * @param startDate - Start of the date range
   * @param endDate - End of the date range
   * @returns Promise with item availability information
   */
  checkAvailability: (
    itemId: string,
    startDate: Date,
    enddate: Date,
  ): Promise<{
    item_id: string;
    alreadyBookedQuantity: number;
    availableQuantity: number;
  }> => {
    const params = new URLSearchParams({
      start_date: startDate.toISOString(),
      end_date: enddate.toISOString(),
    });
    return api
      .get(`/storage-items/availability/${itemId}?${params.toString()}`)
      .then((res) => res.data);
  },

  getOrderedItems: (
    ordered_by: ValidItemOrder = "created_at",
    ascending: boolean = true,
    page: number,
    limit: number,
    searchquery?: string,
    tag_filters?: string[],
    activity_filter?: "active" | "inactive",
    location_filter?: string[],
    categories?: string[],
    availability_min?: number,
    availability_max?: number,
    org_ids?: string[] | string,
  ) => {
    const activity = activity_filter === "active" ? true : false;
    let call = `/storage-items/ordered?order=${ordered_by}&page=${page}&limit=${limit}&ascending=${ascending}`;
    if (searchquery) call += `&search=${searchquery}`;
    if (tag_filters && tag_filters.length > 0)
      call += `&tags=${tag_filters.join(",")}`;
    if (activity_filter) call += `&active=${activity}`;
    if (location_filter && location_filter.length > 0)
      call += `&location=${location_filter.join(",")}`;
    if (categories && categories.length > 0)
      call += `&category=${categories.join(",")}`;
    if (availability_min !== undefined)
      call += `&availability_min=${availability_min}`;
    if (availability_max !== undefined)
      call += `&availability_max=${availability_max}`;
    if (org_ids && (Array.isArray(org_ids) ? org_ids.length > 0 : true)) {
      const orgParam = Array.isArray(org_ids) ? org_ids.join(",") : org_ids;
      call += `&org=${orgParam}`;
    }
    return api.get(call);
  },

  /**
   * Get total amount of bookings in the system (active and inactive)
   * @returns number
   */
  getItemCount: async (): Promise<ApiSingleResponse<number>> => {
    return await api.get(`/storage-items/count`);
  },
};
