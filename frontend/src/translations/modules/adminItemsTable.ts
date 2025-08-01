export const adminItemsTable = {
  title: {
    fi: "Hallinnoi varastotuotteita",
    en: "Manage Storage Items",
  },
  filters: {
    searchPlaceholder: {
      fi: "Hae nimellä tai tyypillä",
      en: "Search by name or type",
    },
    status: {
      all: {
        fi: "Kaikki",
        en: "All",
      },
      active: {
        fi: "Aktiiviset",
        en: "Active",
      },
      inactive: {
        fi: "Ei-aktiiviset",
        en: "Inactive",
      },
    },
    tags: {
      filter: {
        fi: "Suodata tageilla",
        en: "Filter by tags",
      },
      filtered: {
        fi: "{count} tagia valittu",
        en: "{count} tags selected",
      },
      noTags: {
        fi: "Ei tageja saatavilla",
        en: "No tags found",
      },
      loading: {
        fi: "Ladataan tageja...",
        en: "Loading tags...",
      },
      error: {
        fi: "Virhe ladattaessa tageja",
        en: "Error loading tags",
      },
      unnamed: { fi: "Nimetön", en: "Unnamed" },
    },
    clear: {
      fi: "Tyhjennä suodattimet",
      en: "Clear Filters",
    },
  },
  buttons: {
    addNew: {
      fi: "Lisää uusi tuote",
      en: "Add New Item",
    },
  },
  columns: {
    namefi: {
      fi: "Tuotteen nimi (FI)",
      en: "Item Name (FI)",
    },
    typefi: {
      fi: "Tuotteen tyyppi (FI)",
      en: "Item Type (FI)",
    },
    location: {
      fi: "Sijainti",
      en: "Location",
    },
    price: {
      fi: "Hinta",
      en: "Price",
    },
    quantity: {
      fi: "Määrä",
      en: "Quantity",
    },
    active: {
      fi: "Aktiivinen",
      en: "Active",
    },
    actions: {
      fi: "Toiminnot",
      en: "Actions",
    },
  },
  tooltips: {
    cantDelete: {
      fi: "Ei voida poistaa, tuotteella on varauksia",
      en: "Can't delete, it has existing bookings",
    },
  },
  messages: {
    deletion: {
      title: {
        fi: "Vahvista poistaminen",
        en: "Confirm Deletion",
      },
      description: {
        fi: "Haluatko varmasti poistaa tämän tuotteen? (Pehmeä poisto)",
        en: "Are you sure you want to delete this item? (Soft Delete)",
      },
      confirm: {
        fi: "Vahvista",
        en: "Confirm",
      },
      cancel: {
        fi: "Peruuta",
        en: "Cancel",
      },
    },
    toast: {
      deleting: {
        fi: "Poistetaan tuotetta...",
        en: "Deleting item...",
      },
      deleteSuccess: {
        fi: "Tuote on poistettu onnistuneesti.",
        en: "Item has been successfully deleted.",
      },
      deleteFail: {
        fi: "Tuotteen poistaminen epäonnistui.",
        en: "Failed to delete item.",
      },
      deleteError: {
        fi: "Virhe tuotteen poistamisessa.",
        en: "Error deleting item.",
      },
      activateSuccess: {
        fi: "Tuote aktivoitu onnistuneesti",
        en: "Item activated successfully",
      },
      deactivateSuccess: {
        fi: "Tuote deaktivoitu onnistuneesti",
        en: "Item deactivated successfully",
      },
      statusUpdateFail: {
        fi: "Tuotteen tilan päivittäminen epäonnistui",
        en: "Failed to update item status",
      },
    },
    units: {
      fi: "kpl",
      en: "pcs",
    },
  },
};
