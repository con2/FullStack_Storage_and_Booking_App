import { Button } from "@/components/ui/button";
import {
  OriginalTable,
  OriginalTableBody,
  OriginalTableCell,
  OriginalTableFooter,
  OriginalTableHead,
  OriginalTableHeader,
  OriginalTableRow,
} from "@/components/ui/original-table";
import { useLanguage } from "@/context/LanguageContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createItem,
  editLocalItem,
  removeFromItemCreation,
  selectItemCreation,
  selectItemsError,
  selectItemsLoading,
  toggleIsEditing,
} from "@/store/slices/itemsSlice";
import { setPrevStep, setStepper } from "@/store/slices/uiSlice";
import { ItemFormData } from "@common/items/form.types";
import { ClipboardPen, Loader2Icon, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { t } from "@/translations";
import { clearOrgLocations } from "@/store/slices/organizationLocationsSlice";

function Summary() {
  const form = useAppSelector(selectItemCreation);
  const { items } = form;
  const { lang } = useLanguage();
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectItemsLoading);
  const uploadError = useAppSelector(selectItemsError);
  const navigate = useNavigate();

  const createNext = () => dispatch(setPrevStep());
  const editItem = (id: string) => {
    void dispatch(toggleIsEditing(true));
    void dispatch(editLocalItem(id));
    dispatch(setPrevStep());
  };
  const handleSubmit = async () => {
    try {
      await dispatch(createItem(form as ItemFormData)).unwrap();
      if (uploadError) throw new Error(uploadError);
      toast.success("Your items were created!");
      const newItems = items.flatMap((item) => item.id);
      void dispatch(setStepper(1));
      void dispatch(clearOrgLocations());
      void navigate("/admin/items", {
        state: { ascending: false, newItems: newItems },
      });
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : "Items could not be created. Contact support if the error persists.",
      );
    }
  };

  return (
    <>
      <div className="bg-white flex flex-wrap rounded border mt-4 max-w-[900px] flex-col p-10 gap-4">
        <p className="scroll-m-20 text-2xl font-semibold tracking-tight w-full">
          {t.itemSummary.headings[lang]}
        </p>

        {form.org && items.length > 0 && (
          <div>
            <p className="text-sm leading-none font-medium mb-4">
              Adding items to organization {form.org?.name}
            </p>
          </div>
        )}
        {/* Items */}
        {items.length > 0 ? (
          <>
            <OriginalTable>
              <OriginalTableHeader>
                <OriginalTableRow>
                  <OriginalTableHead>
                    {t.itemSummary.tableHeaders.item[lang]}
                  </OriginalTableHead>
                  <OriginalTableHead>
                    {t.itemSummary.tableHeaders.quantity[lang]}
                  </OriginalTableHead>
                  <OriginalTableHead>
                    {t.itemSummary.tableHeaders.storage[lang]}
                  </OriginalTableHead>
                  <OriginalTableHead className="text-right">
                    {t.itemSummary.tableHeaders.actions[lang]}
                  </OriginalTableHead>
                </OriginalTableRow>
              </OriginalTableHeader>
              <OriginalTableBody>
                {items.map((item) => (
                  <OriginalTableRow key={item.id}>
                    <OriginalTableCell
                      width="250"
                      className="font-medium max-w-[250px] text-ellipsis overflow-hidden"
                    >
                      {item.translations[lang].item_name}
                    </OriginalTableCell>
                    <OriginalTableCell>
                      {item.items_number_total}
                    </OriginalTableCell>
                    <OriginalTableCell>{item.location.name}</OriginalTableCell>
                    <OriginalTableCell className="text-right">
                      <Button
                        onClick={() => editItem(item.id)}
                        variant="outline"
                        className="mr-1 p-2"
                        disabled={loading}
                      >
                        <ClipboardPen />
                      </Button>
                      <Button
                        className="p-2"
                        variant="destructive"
                        onClick={() =>
                          dispatch(removeFromItemCreation(item.id))
                        }
                        disabled={loading}
                      >
                        <Trash />
                      </Button>
                    </OriginalTableCell>
                  </OriginalTableRow>
                ))}
              </OriginalTableBody>
              <OriginalTableFooter>
                <OriginalTableRow>
                  <OriginalTableCell colSpan={4}>
                    {t.itemSummary.tableFooter.totalItems[lang]} {items.length}
                  </OriginalTableCell>
                </OriginalTableRow>
              </OriginalTableFooter>
            </OriginalTable>

            {/* Summary Actions */}
            <div className="flex justify-end gap-4">
              {/* Create another */}
              <Button variant="default" disabled={loading} onClick={createNext}>
                {t.itemSummary.buttons.createAnother[lang]}
              </Button>

              {/* Upload Items */}
              {loading ? (
                <Button variant="outline" disabled>
                  <Loader2Icon className="animate-spin mr-2" />
                  {t.itemSummary.buttons.uploading[lang]}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  disabled={loading}
                  onClick={handleSubmit}
                >
                  {t.itemSummary.buttons.uploadItems[lang]}
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center my-6">
            <p className="font-semibold mb-2">
              {t.itemSummary.paragraphs.noItems[lang]}
            </p>
            <Button
              variant="outline"
              disabled={loading}
              onClick={() => dispatch(setPrevStep())}
            >
              {t.itemSummary.buttons.goToItemCreation[lang]}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

export default Summary;
