import { common } from "./common";

export const addLocationModal = {
  title: {
    en: "Add New Location",
    fi: "Lisää uusi sijainti",
  },
  description: {
    en: "Create a new storage location for this organization",
    fi: "Luo uusi varastosijainti tälle organisaatiolle",
  },
  fields: {
    name: {
      label: {
        en: "Location Name",
        fi: "Sijainnin nimi",
      },
      placeholder: {
        en: "Enter location name",
        fi: "Syötä sijainnin nimi",
      },
    },
    street: {
      label: {
        en: common.personalData.street.en,
        fi: common.personalData.street.fi,
      },
      placeholder: {
        en: "Enter street address",
        fi: "Syötä katuosoite",
      },
    },
    city: {
      label: {
        en: common.personalData.city.en,
        fi: common.personalData.city.fi,
      },
      placeholder: {
        en: "Enter city",
        fi: "Syötä kaupunki",
      },
    },
    postcode: {
      label: {
        en: common.personalData.postalCode.en,
        fi: common.personalData.postalCode.fi,
      },
      placeholder: {
        en: "Enter postal code",
        fi: "Syötä postinumero",
      },
    },
    description: {
      label: {
        en: "Description",
        fi: "Kuvaus",
      },
      placeholder: {
        en: "Enter location description",
        fi: "Syötä sijainnin kuvaus",
      },
    },
    latitude: {
      label: {
        en: "Latitude",
        fi: "Leveysaste",
      },
      placeholder: {
        en: "Enter latitude (optional)",
        fi: "Syötä leveysaste (valinnainen)",
      },
    },
    longitude: {
      label: {
        en: "Longitude",
        fi: "Pituusaste",
      },
      placeholder: {
        en: "Enter longitude (optional)",
        fi: "Syötä pituusaste (valinnainen)",
      },
    },
    imageUrl: {
      label: {
        en: "Image URL",
        fi: "Kuvan URL",
      },
      placeholder: {
        en: "Enter image URL (optional)",
        fi: "Syötä kuvan URL (valinnainen)",
      },
    },
    isActive: {
      label: {
        en: "Active Location",
        fi: "Aktiivinen sijainti",
      },
    },
  },
  labels: {
    address: {
      en: common.personalData.address.en,
      fi: common.personalData.address.fi,
    },
  },
  buttons: {
    create: {
      en: "Create Location",
      fi: "Luo sijainti",
    },
    creating: {
      en: "Creating...",
      fi: "Luodaan...",
    },
    cancel: {
      en: common.cancel.en,
      fi: common.cancel.fi,
    },
  },
  messages: {
    success: {
      en: "Location created successfully!",
      fi: "Sijainti luotu onnistuneesti!",
    },
    error: {
      en: "Failed to create location",
      fi: "Sijainnin luominen epäonnistui",
    },
  },
  validation: {
    requiredFields: {
      en: "Name, street, city, and postcode are required",
      fi: "Nimi, katuosoite, kaupunki ja postinumero ovat pakollisia",
    },
  },
};
