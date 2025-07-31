import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import {
  createOrgLocationWithStorage,
  fetchAllOrgLocations,
} from "@/store/slices/organizationLocationsSlice";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CreateOrgLocationWithStorage } from "@/types/organizationLocation";
import { toast } from "sonner";

interface AddLocationModalProps {
  organizationId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface StorageLocationFormData {
  name: string;
  street: string;
  city: string;
  postcode: string;
  description: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
  is_active: boolean;
}

const AddLocationModal = ({
  organizationId,
  isOpen,
  onClose,
}: AddLocationModalProps) => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<StorageLocationFormData>({
    name: "",
    street: "",
    city: "",
    postcode: "",
    description: "",
    latitude: undefined,
    longitude: undefined,
    image_url: "",
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.street.trim() ||
      !formData.city.trim() ||
      !formData.postcode.trim()
    ) {
      toast.error("Name, street, city, and postcode are required");
      return;
    }

    setIsSubmitting(true);

    try {
      const combinedAddress = `${formData.street}, ${formData.city}, ${formData.postcode}`;

      const locationData: CreateOrgLocationWithStorage = {
        organization_id: organizationId,
        is_active: formData.is_active,
        storage_location: {
          name: formData.name,
          address: combinedAddress,
          description: formData.description,
          latitude: formData.latitude,
          longitude: formData.longitude,
          image_url: formData.image_url,
          is_active: formData.is_active,
        },
      };

      await dispatch(createOrgLocationWithStorage(locationData)).unwrap();

      // Refresh the organization locations list
      await dispatch(
        fetchAllOrgLocations({
          orgId: organizationId,
          pageSize: 100,
          currentPage: 1,
        }),
      );

      toast.success("Location created successfully");
      resetForm();
      onClose();
    } catch (error) {
      toast.error("Failed to create location");
      console.error("Error creating location:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      street: "",
      city: "",
      postcode: "",
      description: "",
      latitude: undefined,
      longitude: undefined,
      image_url: "",
      is_active: true,
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Location</DialogTitle>
          <DialogDescription>
            Create a new storage location for this organization
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Location Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter location name"
                required
              />
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="image_url" className="text-sm font-medium">
                Image URL
              </Label>
              <Input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    image_url: e.target.value,
                  }))
                }
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* Address Fields */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Address *</Label>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label
                  htmlFor="street"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Street Address
                </Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, street: e.target.value }))
                  }
                  placeholder="Enter street address"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="city"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    City
                  </Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, city: e.target.value }))
                    }
                    placeholder="Enter city"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="postcode"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Postcode
                  </Label>
                  <Input
                    id="postcode"
                    value={formData.postcode}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        postcode: e.target.value,
                      }))
                    }
                    placeholder="Enter postcode"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Enter location description..."
              rows={3}
            />
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude" className="text-sm font-medium">
                Latitude
              </Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    latitude: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  }))
                }
                placeholder="e.g. 60.1699"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude" className="text-sm font-medium">
                Longitude
              </Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    longitude: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  }))
                }
                placeholder="e.g. 24.9384"
              />
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, is_active: checked }))
              }
            />
            <Label htmlFor="is_active" className="text-sm font-medium">
              Active Location
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} variant={"secondary"}>
              {isSubmitting ? "Creating..." : "Create Location"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLocationModal;
