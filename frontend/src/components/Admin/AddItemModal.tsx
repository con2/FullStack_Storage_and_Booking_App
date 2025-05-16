import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createItem,
  selectItemsError,
  selectItemsErrorContext,
} from "@/store/slices/itemsSlice";
import { toast } from "sonner";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { fetchAllTags, selectAllTags } from "@/store/slices/tagSlice";
import { Loader2 } from "lucide-react";
import { ItemFormData } from "@/types";
import { Checkbox } from "../ui/checkbox";
import ItemImageManager from "./ItemImageManager";
import {
  openItemModal,
  closeItemModal,
  setCreatedItemId,
  selectItemModalState,
} from "@/store/slices/uiSlice";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchAllLocations,
  selectAllLocations,
} from "@/store/slices/locationsSlice";
// Import translation utilities
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

const initialFormState: ItemFormData = {
  location_id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  compartment_id: "0ffa5562-82a9-4352-b804-1adebbb7d80c",
  items_number_total: 1,
  items_number_available: 1,
  items_number_currently_in_storage: 1,
  price: 0,
  is_active: true,
  translations: {
    fi: {
      item_type: "",
      item_name: "",
      item_description: "",
    },
    en: {
      item_type: "",
      item_name: "",
      item_description: "",
    },
  },
  tagIds: [],
};

const AddItemModal = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const availableTags = useAppSelector(selectAllTags);
  const error = useAppSelector(selectItemsError);
  const errorContext = useAppSelector(selectItemsErrorContext);
  const { lang } = useLanguage(); // Get current language

  // Use global modal state from Redux
  const modalState = useAppSelector(selectItemModalState);

  const [formData, setFormData] = useState<ItemFormData>(initialFormState);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "images">("details");

  // Fetch the created item from Redux store when we have the ID
  const createdItem = useAppSelector((state) =>
    modalState.createdItemId
      ? state.items.items.find((item) => item.id === modalState.createdItemId)
      : null,
  );
  const locations = useAppSelector(selectAllLocations);

  // Display errors when they occur
  useEffect(() => {
    if (error && errorContext === "create") {
      toast.error(error);
    }
  }, [error, errorContext]);

  useEffect(() => {
    if (modalState.isOpen) {
      dispatch(fetchAllTags()); // Fetch all tags when modal opens
      dispatch(fetchAllLocations()); // Fetch all locations when the modal opens
    }
  }, [dispatch, modalState.isOpen]);

  // When item is created, switch to images tab
  useEffect(() => {
    if (modalState.createdItemId) {
      setActiveTab("images");
    }
  }, [modalState.createdItemId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    // Handle nested fields for translations (FI and EN)
    if (name.includes(".")) {
      const [parent, child, field] = name.split(".");

      if (parent === "translations") {
        if (child === "fi" || child === "en") {
          setFormData({
            ...formData,
            translations: {
              ...formData.translations,
              [child]: {
                ...formData.translations[child],
                [field]: value,
              },
            },
          });
        }
      }
    } else {
      // Handle numeric values
      if (
        name === "price" ||
        name === "items_number_total" ||
        name === "items_number_available" ||
        name === "items_number_currently_in_storage"
      ) {
        setFormData({
          ...formData,
          [name]: parseFloat(value) || 0,
        } as ItemFormData);
      } else if (name === "location_id" || name === "compartment_id") {
        setFormData({
          ...formData,
          [name]: value,
        } as ItemFormData);
      }
    }
  };

  const handleToggleChange = (checked: boolean) => {
    setFormData({
      ...formData,
      is_active: checked,
    });
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setLoading(true);

    try {
      // Create the item
      const newItem = await dispatch(
        createItem({ ...formData, tagIds: selectedTags }),
      ).unwrap();

      console.log("Item created successfully:", newItem);

      // Update the global state
      dispatch(setCreatedItemId(newItem.id));
      setActiveTab("images");

      toast.success(
        t.addItemModal.messages.success[lang].replace(
          "{name}",
          newItem.translations.en.item_name,
        ),
      );
    } catch (error) {
      console.error("Error creating item:", error);
      toast.error(t.addItemModal.messages.error[lang]);
    } finally {
      setLoading(false);
    }
  };

  // Reset form and close modal
  const resetForm = () => {
    setFormData(initialFormState);
    setSelectedTags([]);
    setActiveTab("details");
    dispatch(closeItemModal());
  };

  return (
    <Dialog
      open={modalState.isOpen}
      onOpenChange={(isOpen) => {
        if (isOpen) {
          dispatch(openItemModal());
        } else {
          // Handle close confirmation
          if (activeTab === "images" && modalState.createdItemId) {
            if (confirm(t.addItemModal.messages.closeConfirm[lang])) {
              resetForm();
            }
          } else {
            resetForm();
          }
        }
      }}
    >
      <DialogTrigger asChild onClick={() => dispatch(openItemModal())}>
        {children}
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.addItemModal.title[lang]}</DialogTitle>
          <DialogDescription className="text-center">
            {activeTab === "details"
              ? t.addItemModal.description.details[lang]
              : createdItem
                ? t.addItemModal.description.images[lang].replace(
                    "{name}",
                    createdItem.translations.en.item_name,
                  )
                : t.addItemModal.description.createFirst[lang]}
          </DialogDescription>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex border-b mb-4">
          <button
            className={`px-4 py-2 ${
              activeTab === "details"
                ? "border-b-2 border-secondary font-medium"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("details")}
          >
            {t.addItemModal.tabs.details[lang]}
          </button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={`px-4 py-2 ${
                    activeTab === "images"
                      ? "border-b-2 border-secondary font-medium"
                      : "text-gray-500"
                  }`}
                  onClick={() =>
                    modalState.createdItemId && setActiveTab("images")
                  }
                  disabled={!modalState.createdItemId}
                >
                  {t.addItemModal.tabs.images[lang]}
                </button>
              </TooltipTrigger>
              {!modalState.createdItemId && (
                <TooltipContent side="top">
                  {t.addItemModal.tooltips.createFirst[lang]}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>

        {activeTab === "details" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }}
            className="space-y-4"
          >
            {/* Item Translation Fields */}
            <div className="space-y-4">
              {/* Item Names - Side by Side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="translations.fi.item_name">
                    {t.addItemModal.labels.itemNameFi[lang]}
                  </Label>
                  <Input
                    id="translations.fi.item_name"
                    name="translations.fi.item_name"
                    value={formData.translations.fi.item_name}
                    onChange={handleChange}
                    placeholder={t.addItemModal.placeholders.itemFi[lang]}
                    className="placeholder:text-xs italic p-2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="translations.en.item_name">
                    {t.addItemModal.labels.itemNameEn[lang]}
                  </Label>
                  <Input
                    id="translations.en.item_name"
                    name="translations.en.item_name"
                    value={formData.translations.en.item_name}
                    onChange={handleChange}
                    placeholder={t.addItemModal.placeholders.itemEn[lang]}
                    className="placeholder:text-xs italic p-2"
                    required
                  />
                </div>
              </div>

              {/* Item Types - Side by Side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="translations.fi.item_type">
                    {t.addItemModal.labels.itemTypeFi[lang]}
                  </Label>
                  <Input
                    id="translations.fi.item_type"
                    name="translations.fi.item_type"
                    value={formData.translations.fi.item_type}
                    onChange={handleChange}
                    placeholder={t.addItemModal.placeholders.typeFi[lang]}
                    className="placeholder:text-xs italic p-2"
                  />
                </div>
                <div>
                  <Label htmlFor="translations.en.item_type">
                    {t.addItemModal.labels.itemTypeEn[lang]}
                  </Label>
                  <Input
                    id="translations.en.item_type"
                    name="translations.en.item_type"
                    value={formData.translations.en.item_type}
                    onChange={handleChange}
                    placeholder={t.addItemModal.placeholders.typeEn[lang]}
                    className="placeholder:text-xs italic p-2"
                  />
                </div>
              </div>

              {/* Item Descriptions - Side by Side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="translations.fi.item_description">
                    {t.addItemModal.labels.descriptionFi[lang]}
                  </Label>
                  <Textarea
                    id="translations.fi.item_description"
                    name="translations.fi.item_description"
                    value={formData.translations.fi.item_description}
                    onChange={handleChange}
                    placeholder={
                      t.addItemModal.placeholders.descriptionFi[lang]
                    }
                    className="placeholder:text-xs italic p-2 shadow-sm ring-1 ring-inset ring-muted"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="translations.en.item_description">
                    {t.addItemModal.labels.descriptionEn[lang]}
                  </Label>
                  <Textarea
                    id="translations.en.item_description"
                    name="translations.en.item_description"
                    value={formData.translations.en.item_description}
                    onChange={handleChange}
                    placeholder={
                      t.addItemModal.placeholders.descriptionEn[lang]
                    }
                    className="placeholder:text-xs italic p-2 shadow-sm ring-1 ring-inset ring-muted"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location_id">
                  {t.addItemModal.labels.location[lang]}
                </Label>
                <Select
                  value={formData.location_id || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, location_id: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        t.addItemModal.placeholders.selectLocation[lang]
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price and Active Status */}
              <div className="flex flex-row items-baseline space-x-4 space-y-4">
                <div className="flex flex-row items-baseline space-x-2">
                  <Label htmlFor="price" className="font-medium">
                    {t.addItemModal.labels.price[lang]}
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder={t.addItemModal.labels.price[lang]}
                    required
                    className="w-60"
                  />
                </div>
                <div className="flex flex-row items-center space-x-2">
                  <Label htmlFor="is_active" className="font-medium">
                    {t.addItemModal.labels.active[lang]}
                  </Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={handleToggleChange}
                  />
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="items_number_total">
                      {t.addItemModal.labels.totalQuantity[lang]}
                    </Label>
                    <Input
                      id="items_number_total"
                      name="items_number_total"
                      type="number"
                      value={formData.items_number_total}
                      onChange={handleChange}
                      min="1"
                      placeholder={t.addItemModal.labels.totalQuantity[lang]}
                      className="value:text-xs"
                    />
                  </div>

                  <div>
                    <Label htmlFor="items_number_currently_in_storage">
                      {t.addItemModal.labels.inStorage[lang]}
                    </Label>
                    <Input
                      id="items_number_currently_in_storage"
                      name="items_number_currently_in_storage"
                      type="number"
                      value={formData.items_number_currently_in_storage}
                      onChange={handleChange}
                      min="0"
                      max={formData.items_number_total}
                      placeholder={t.addItemModal.labels.inStorage[lang]}
                      className="value:text-xs"
                    />
                  </div>

                  <div>
                    <Label htmlFor="items_number_available">
                      {t.addItemModal.labels.available[lang]}
                    </Label>
                    <Input
                      id="items_number_available"
                      name="items_number_available"
                      type="number"
                      value={formData.items_number_available}
                      onChange={handleChange}
                      min="0"
                      max={formData.items_number_total}
                      placeholder={t.addItemModal.labels.available[lang]}
                      className="value:text-xs"
                    />
                  </div>
                </div>

                {/* Tag Selection */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">
                    {t.addItemModal.labels.assignTags[lang]}
                  </h3>
                  <div className="grid grid-cols-2 max-h-60 overflow-y-auto">
                    {availableTags.map((tag) => (
                      <label key={tag.id} className="flex items-center">
                        <Checkbox
                          className="m-0.75 border-secondary text-primary data-[state=checked]:bg-secondary data-[state=checked]:text-white"
                          checked={selectedTags.includes(tag.id)}
                          onCheckedChange={() => handleTagToggle(tag.id)}
                        />
                        <span className="text-sm">
                          {tag.translations?.[lang]?.name ||
                            tag.translations?.[lang === "fi" ? "en" : "fi"]
                              ?.name ||
                            "Unnamed"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="submit"
                className="w-full text-secondary px-6 border-secondary border-1 rounded-2xl bg-white hover:bg-secondary hover:text-white"
                disabled={loading}
                size="sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.addItemModal.buttons.creating[lang]}
                  </>
                ) : (
                  t.addItemModal.buttons.create[lang]
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : modalState.createdItemId ? (
          <>
            <ItemImageManager itemId={modalState.createdItemId} />

            <DialogFooter className="mt-4">
              <Button
                className="w-full text-secondary px-6 border-secondary border-1 rounded-2xl bg-white hover:bg-secondary hover:text-white"
                onClick={resetForm}
                size="sm"
              >
                {t.addItemModal.buttons.done[lang]}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="text-center py-12">
            <p>{t.addItemModal.description.createFirst[lang]}</p>
            <Button
              className="mt-4 text-secondary px-6 border-secondary border-1 rounded-2xl bg-white hover:bg-secondary hover:text-white"
              onClick={() => setActiveTab("details")}
              size="sm"
            >
              {t.addItemModal.buttons.back[lang]}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddItemModal;
