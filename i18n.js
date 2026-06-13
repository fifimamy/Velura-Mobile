
import * as i18nModule from 'i18n-js';
import en from './locales/en.json';
import fr from './locales/fr.json';

const baseI18n = (i18nModule && i18nModule.default) ? i18nModule.default : i18nModule;

const i18n = baseI18n || {
  locale: 'en',
  defaultLocale: 'en',
  fallbacks: true,
  translations: {},
};

const getTranslation = (scope, locale) => {
  if (!scope) return '';
  const dict = i18n.translations && i18n.translations[locale];
  if (!dict) return scope;

  return scope.split('.').reduce((acc, key) => {
    if (acc && Object.prototype.hasOwnProperty.call(acc, key)) {
      return acc[key];
    }
    return undefined;
  }, dict);
};

const fallbackT = (scope, options = {}) => {
  const locale = i18n.locale || i18n.defaultLocale || 'en';
  const translation = getTranslation(scope, locale);
  if (translation !== undefined && translation !== null) {
    return translation;
  }

  if (i18n.fallbacks && i18n.defaultLocale && i18n.defaultLocale !== locale) {
    const fallback = getTranslation(scope, i18n.defaultLocale);
    if (fallback !== undefined && fallback !== null) {
      return fallback;
    }
  }

  if (typeof scope === 'string') {
    return scope;
  }
  return String(scope);
};

if (!i18n.t) {
  i18n.t = fallbackT;
}

if (!i18n.missingTranslation) {
  i18n.missingTranslation = (scope) => {
    if (typeof scope === 'string') {
      return scope;
    }
    return String(scope);
  };
}

if (!i18n.default) {
  i18n.default = i18n;
}

// ربط الترجمات
i18n.translations = { ...i18n.translations, en, fr };
i18n.defaultLocale = 'en';
if (!i18n.locale) {
  i18n.locale = 'en';
}
i18n.fallbacks = true;

// في حال يحتاج أي رمز مباشر i18n.default.t
if (i18n.default && !i18n.default.t && typeof i18n.t === 'function') {
  i18n.default.t = i18n.t;
}

// دعم التبديل من i18n.default
if (!i18n.default) {
  i18n.default = i18n;
}

export default i18n;