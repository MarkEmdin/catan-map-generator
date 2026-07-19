import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ru from "../locales/ru.json";
import en from "../locales/en.json";
import de from "../locales/de.json";

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      ru: { translation: ru },
      en: { translation: en },
      de: { translation: de },
    },
    lng: "en",
    fallbackLng: "en",
    // "3:1" is a translation key, and ":" is i18next's default namespace
    // separator - disable it since this project only has one namespace.
    nsSeparator: false,
    interpolation: { escapeValue: false },
  });
}

export default i18n;
