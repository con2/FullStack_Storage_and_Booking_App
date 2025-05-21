import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  getItemById,
  selectSelectedItem,
  selectItemsLoading,
  selectItemsError,
} from "../../store/slices/itemsSlice";
import {
  getItemImages,
  selectItemImages,
} from "../../store/slices/itemImagesSlice";
import { Button } from "../../components/ui/button";
import { ChevronLeft, Clock, Info, LoaderCircle } from "lucide-react";
import Rating from "../ui/rating";
import { addToCart } from "../../store/slices/cartSlice";
import { Input } from "../ui/input";
import { toast } from "sonner";
import imagePlaceholder from "@/assets/defaultImage.jpg";
import { useTranslation } from "@/hooks/useTranslation";
import { t } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";
import { ItemImageAvailabilityInfo, ItemTranslation } from "@/types";
import { ordersApi } from "@/api/services/orders";
import { useFormattedDate } from "@/hooks/useFormattedDate";

const ItemsDetails: React.FC = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { formatDate } = useFormattedDate();

  // Redux selectors
  const item = useAppSelector(selectSelectedItem);
  const loading = useAppSelector(selectItemsLoading);
  const error = useAppSelector(selectItemsError);
  const { startDate, endDate } = useAppSelector((state) => state.timeframe);
  const itemImages = useAppSelector(selectItemImages);

  // State for selected tab
  //const [selectedTab, setSelectedTab] = useState("description");
  // State for cart quantity
  const [quantity, setQuantity] = useState(1);
  // Image tracking states
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  // State for larger image view
  const [isImageVisible, setIsImageVisible] = useState(false);

  const [availabilityInfo, setAvailabilityInfo] =
    useState<ItemImageAvailabilityInfo>({
      availableQuantity: item?.items_number_available ?? 0,
      isChecking: false,
      error: null,
    });

  const toggleImageVisibility = () => {
    setIsImageVisible(!isImageVisible);
  };

  // Get images for this specific item
  const itemImagesForCurrentItem = useMemo(
    () => itemImages.filter((img) => img.item_id === id),
    [itemImages, id],
  );

  // Get all detail images for the gallery
  const detailImages = useMemo(
    () => itemImagesForCurrentItem.filter((img) => img.image_type === "detail"),
    [itemImagesForCurrentItem],
  );

  // Get the main image - no transformation needed
  const mainImage = useMemo(() => {
    // If user selected an image, use that
    if (selectedImageUrl) return selectedImageUrl;

    // First try to find a main image
    const mainImg = itemImagesForCurrentItem.find(
      (img) => img.image_type === "main",
    );

    // If no main image, try thumbnail
    const thumbnailImg = mainImg
      ? null
      : itemImagesForCurrentItem.find((img) => img.image_type === "thumbnail");

    const anyImg = mainImg || thumbnailImg ? null : itemImagesForCurrentItem[0];

    // Return image URL or placeholder
    return (
      mainImg?.image_url ||
      thumbnailImg?.image_url ||
      anyImg?.image_url ||
      imagePlaceholder
    );
  }, [itemImagesForCurrentItem, selectedImageUrl]);

  // Handle cart actions
  const handleAddToCart = () => {
    if (item) {
      dispatch(
        addToCart({
          item: item,
          quantity: quantity,
          startDate: startDate,
          endDate: endDate,
        }),
      );
      toast.success(`${itemContent?.item_name || "Item"} added to cart`); //item added to cart
    }
  };

  // Check if the item is available for the selected timeframe
  useEffect(() => {
    // Only check availability if item and dates are selected
    if (item && startDate && endDate) {
      setAvailabilityInfo((prev) => ({
        ...prev,
        isChecking: true,
        error: null,
      }));

      ordersApi
        .checkAvailability(item.id, startDate, endDate)
        .then((response) => {
          setAvailabilityInfo({
            availableQuantity: response.availableQuantity,
            isChecking: false,
            error: null,
          });
        })
        .catch((error) => {
          console.error("Error checking availability:", error);
          setAvailabilityInfo({
            availableQuantity: item.items_number_available,
            isChecking: false,
            error: "Failed to check availability",
          });
        });
    }
  }, [item, startDate, endDate]);

  const isItemAvailableForTimeframe = availabilityInfo.availableQuantity > 0;

  // Translation
  const { getTranslation } = useTranslation<ItemTranslation>();
  // Get the translated item content
  const itemContent = getTranslation(item, "fi") as ItemTranslation | undefined;
  const { lang } = useLanguage();

  // Fetch item and images
  useEffect(() => {
    if (id) {
      dispatch(getItemById(id));

      // Fetch images for this item
      dispatch(getItemImages(id))
        .unwrap()
        .catch((error) => {
          console.error("Failed to fetch item images:", error);
        });
    }
  }, [id, dispatch]);

  // Loading and error states
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <LoaderCircle className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-12 text-center text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto p-12 text-center">Item not found</div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      {/* Back Button */}
      <div className="mb-3 mt-4 md:mt-0">
        <Button
          onClick={() => navigate(-1)}
          className="text-secondary px-6 border-secondary border-1 rounded-2xl bg-white hover:bg-secondary hover:text-white"
        >
          <ChevronLeft /> {t.itemDetails.buttons.back[lang]}
        </Button>
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Item Images - Positioned Left */}
        <div className="md:w-1/3 w-full">
          {/* Main Image */}
          <div className="relative mb-4 h-[300px] group w-full max-w-md mx-auto md:max-w-none aspect-[4/3]">
            {/* Main Image Container */}
            <div className="border rounded-md bg-slate-50 overflow-hidden h-full w-full">
              <img
                src={mainImage}
                alt={itemContent?.item_name || "Tuotteen kuva"}
                className="w-full h-full object-cover cursor-pointer hover:opacity-90 hover:scale-105 hover:shadow-lg transition-all duration-300 ease-in-out"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = imagePlaceholder;
                }}
                onClick={toggleImageVisibility}
              />
            </div>

            {/* Floating Enlarged Preview on Hover */}
            <div
              className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 ${isImageVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"} transition-all duration-400 ease-in-out z-50 pointer-events-none`}
            >
              <div className="w-[400px] h-[400px] border rounded-lg shadow-lg bg-white flex justify-center items-center enlarged-image">
                <img
                  src={mainImage}
                  alt={itemContent?.item_name || "Tuotteen kuva"}
                  className="object-contain max-w-full max-h-full"
                />
              </div>
            </div>
          </div>

          {/* Detail Images Gallery */}
          {detailImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {detailImages.map((img) => (
                <div
                  key={img.id}
                  className="border rounded-md overflow-hidden bg-slate-50 cursor-pointer"
                  onClick={() => setSelectedImageUrl(img.image_url)}
                >
                  <img
                    src={img.image_url}
                    alt={itemContent?.item_name || "Tuotteen kuva"}
                    className="w-full h-20 object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = imagePlaceholder;
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side - Item Details */}
        <div className="md:w-2/3 w-full space-y-4 order-1 md:order-2">
          <h2 className="text-2xl font-normal text-left mb-0">
            {itemContent?.item_name
              ? `${itemContent.item_name.charAt(0).toUpperCase()}${itemContent.item_name.slice(1)}`
              : "Tuote"}
          </h2>
          
          {/* Rating Component */}
          {item.average_rating ? (
            <div className="flex items-center justify-start mt-1">
              <Rating rating={item.average_rating ?? 0} readOnly />
            </div>
          ) : (
            ""
          )}

          {/* Location Details Section */}
          {item.location_details && (
            <div className="text-sm mt-2">
              {item.location_details.name && (
                <div className="flex items-start">
                  <span>
                    {t.itemDetails.locations.location[lang]}:
                  </span>
                  <span className="ml-1">{item.location_details.name}</span>
                </div>
              )}

              {item.location_details.address && (
                <div className="flex items-start">
                  <span>
                    {" "}
                    {t.itemDetails.locations.address[lang]}:
                  </span>
                  <span className="ml-1">{item.location_details.address}</span>
                </div>
              )}
            </div>
          )}

          <p>
            {itemContent?.item_description
              ? `${itemContent.item_description
                  .toLowerCase()
                  .replace(/^./, (c) => c.toUpperCase())}`
              : "Ei kuvausta saatavilla"}
          </p>

          {/* Display selected booking timeframe if it exists */}
          {startDate && endDate ? (
            <div className="flex flex-col justify-center items-start mt-4">
              <div className="bg-slate-100 max-w-[250px] rounded-md p-2">
                <div className="flex items-center text-sm text-slate-400">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="font-medium text-xs">
                    {t.itemDetails.info.timeframe[lang]}
                  </span>
                </div>
                <p className="text-xs font-medium m-0">
                  {formatDate(startDate, "d MMM yyyy")}
                    <span> -</span>{" "}
                    {formatDate(endDate, "d MMM yyyy")}
                </p>
              </div>

              {/* Booking Section */}
              <div className="flex flex-row justify-center items-center mt-3">
                {/* <span className="text-sm mr-4">
                  {t.itemDetails.items.quantity[lang]}
                </span> */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-8 w-8 p-0"
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <Input
                  type="text"
                  value={quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setQuantity(
                      Math.min(
                        availabilityInfo.availableQuantity,
                        Math.max(0, value),
                      ),
                    );
                  }}
                  min={1}
                  max={availabilityInfo.availableQuantity}
                  className="w-11 h-8 mx-2 text-center"
                />
                <Button
                  variant="outline"
                  size="sm"
                      onClick={() =>
                    setQuantity(
                      Math.min(availabilityInfo.availableQuantity, quantity + 1),
                    )
                  }
                  disabled={quantity >= availabilityInfo.availableQuantity}
                  className="h-8 w-8 p-0"
                >
                  +
                </Button>
              </div>
              {/* Availability Info */}
              <div className="flex items-center justify-end mt-1">
                {availabilityInfo.isChecking ? (
                  <p className="text-xs text-slate-400 italic m-0">
                    <LoaderCircle className="animate-spin h-4 w-4 mr-1" />
                    {t.itemCard.checkingAvailability[lang]}
                  </p>
                ) : availabilityInfo.error ? (
                  <p className="text-xs text-red-500 italic m-0">
                    {t.itemCard.availabilityError[lang]}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 italic m-0">
                    {startDate && endDate
                      ? availabilityInfo.availableQuantity > 0
                        ? `${t.itemCard.available[lang]}: ${availabilityInfo.availableQuantity}`
                        : `${t.itemCard.notAvailable[lang]}`
                      : `${t.itemCard.totalUnits[lang]}: ${item.items_number_available}`}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-start mt-1 mb-4 md:mb-0">
                <Button
                  className={`bg-secondary rounded-2xl text-white border-secondary border-1 flex-1 mt-3
                    hover:text-secondary hover:bg-white
                    ${!isItemAvailableForTimeframe ? "opacity-50 cursor-not-allowed hover:text-white hover:bg-secondary" : ""}
                  `}
                  onClick={handleAddToCart}
                  disabled={!isItemAvailableForTimeframe}
                >
                  {t.itemDetails.items.addToCart[lang]}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-row items-center">
              <Info className="mr-1 text-secondary size-4" />{" "}
              {t.itemDetails.info.noDates[lang]}
              <Link to="/storage" className="ml-1 text-secondary underline">
                {t.itemDetails.info.here[lang]}
              </Link>
              .
            </div>
          )}
        </div>
      </div>

      {/* Tabs and Tab Contents */}
      {/* <div className="mt-10 w-full"> */}
      {/* <div className="flex gap-4">
        <Button
          onClick={() => setSelectedTab("description")}
          className={`${
            selectedTab === "description"
              ? "bg-secondary text-white"
              : "bg-transparent text-secondary"
          } hover:bg-secondary hover:text-white`}
        >
          Description
        </Button>
        <Button
          onClick={() => setSelectedTab("reviews")}
          className={`${
            selectedTab === "reviews"
              ? "bg-secondary text-white"
              : "bg-transparent text-secondary"
          } hover:bg-secondary hover:text-white`}
        >
          Reviews
        </Button>
      </div> */}

      {/* Tab Content */}
      {/* <div className="mt-4 bg-slate-50 p-4 rounded-lg">
        {selectedTab === "description" && (
          <p>{item.translations.fi.item_description}</p>
        )}
        {selectedTab === "reviews" && <p>Reviews will be displayed here</p>}
      </div> */}
    </div>
    // </div>
  );
};

export default ItemsDetails;
