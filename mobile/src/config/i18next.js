import i18n from 'i18next'
import { initReactI18next } from "react-i18next";
//import LanguageDetector from 'i18next-browser-languagedetector'
import {getLocales} from 'react-native-localize';
import langEs from '../locales/es.json'
import langEn from '../locales/en.json'

i18n
  //.use(LanguageDetector)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    lng: 'es',
    resources: {
      es: {
        translations: langEs
      },
      en: {
        translations: langEn
      },
    },

    fallbackLng: "es",
    debug: true,
    ns: ["translations"],

    defaultNS: "translations",

    keySeparator: false, // we use content as keys

    interpolation: {
      formatSeparator: ","
    },
  })

export default i18n
