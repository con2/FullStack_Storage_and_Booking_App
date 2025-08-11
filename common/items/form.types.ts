export type SelectedOrg = {
  id: string;
  name: string;
};
export type SelectedStorage = {
  name: string;
  id: string;
  address: string;
};

export type CreateItemType = {
  id: string;
  location: {
    id: string;
    name: string;
    address: string;
  };
  items_number_total: number;
  items_number_currently_in_storage: number;
  price: number;
  is_active: boolean;
  translations: {
    fi: {
      item_name: string;
      item_type: string;
      item_description: string;
    };
    en: {
      item_name: string;
      item_type: string;
      item_description: string;
    };
  };
  tags: string[];
  images: {
    main: {
      id: string;
      url: string;
      full_path: string;
      path: string;
      metadata: {
        image_type: string;
        alt_text?: string;
        display_order: number;
        is_active: boolean;
      };
    } | null;
    details: {
      id: string;
      url: string;
      full_path: string;
      path: string;
      metadata: {
        image_type: string;
        alt_text?: string;
        display_order: number;
        is_active: boolean;
      };
    }[];
  };
};

export type MappedItem = Omit<CreateItemType, "location" | "tags" | "images"> & {
  location_id: string;
};

export type ItemFormData = {
  org: SelectedOrg;
  location: SelectedStorage;
  items: CreateItemType[];
};

export type ImageEntry = {
  item_id: string;
  url: string;
  path: string;
  image_type: string;
  alt_text?: string;
  display_order: number;
  is_active: boolean;
};
