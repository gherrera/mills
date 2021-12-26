import i18n from 'i18next'
import { initReactI18next } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector'
import langEs from '../locales/es.json'
import langEn from '../locales/en.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: {
        translations: langEs
      },
      en: {
        translations: langEn
      },
    },

    detection: {
      //order: ['navigator'],
      lookupQuerystring: 'lang'
    },

    fallbackLng: "es",
    debug: true,

    ns: ["translations"],

    defaultNS: "translations",

    keySeparator: false, // we use content as keys

    interpolation: {
      formatSeparator: ","
    },

    react: {
      wait: true
    }
  })

export default i18n
