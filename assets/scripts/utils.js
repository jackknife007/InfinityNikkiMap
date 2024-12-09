"use strict";

let resourceControl = {
  env: "dev",
  lang: {
    default: "zh-Hans",
    selected: "",
    data: { en: null, "zh-Hans": null },
  },
  // 默认世界名称
  regionName: "xyyy",
  version: "1.0.0",

  init: async function () {
    this.loadRegionName();
    this.loadEnv();
    await this.loadLang();
    const version = localStorage.getItem("version");
    if (version !== this.version) {
      localStorage.clear();
      localStorage.setItem("version", this.version);
      location.reload();
    }
  },

  loadEnv: function () {
    if (location.hostname === "map.nikkimomo.cc") {
      this.env = "prod";
    } else if (location.hostname === "map2.nikkimomo.cc") {
      this.env = "uat";
    }
  },

  loadLang: async function () {
    const langStorage = localStorage.getItem("lang");
    let availableLangs = Object.keys(this.lang.data);

    if (langStorage) {
      this.lang.selected = langStorage;
    } else {
      var userLang = navigator.language || navigator.userLanguage;
      if (availableLangs.includes(userLang)) {
        this.lang.selected = userLang;
      } else if (availableLangs.includes(userLang.split("-")[0])) {
        this.lang.selected = userLang.split("-")[0];
      }
    }

    for (let lang of availableLangs) {
      this.lang.data[lang] = await fetch(
        `${this._assetsHost()}/i18n/${lang}.json`
      ).then((res) => res.json());
    }
  },

  loadRegionName: function () {
    this.regionName = localStorage.getItem("regionName") || this.regionName;
    return this.regionName;
  },

  getRegionName: function () {
    return this.regionName;
  },

  getLocalizedRegionName: function () {
    return this.regionName === "xyyy"
      ? this.i18n("region.wishfield")
      : this.i18n("region.unknown");
  },

  setRegionName: function (regionName) {
    localStorage.setItem("regionName", regionName);
    location.reload();
  },

  isCurrentRegion: function (regionName) {
    return this.regionName === regionName;
  },

  getGroupsJsonFilePath: function () {
    return `${this._assetsHost()}/datas/${
      this.lang.selected
    }/common/groups.json`;
  },

  getCategoriesJsonFilePath: function () {
    return `${this._assetsHost()}/datas/${this.lang.selected}/${
      this.regionName
    }/categories.json`;
  },

  getMarkersJsonFilePath: function () {
    return `${this._assetsHost()}/datas/${this.lang.selected}/${
      this.regionName
    }/markers.json`;
  },

  getQuickPositionsJsonFilePath: function () {
    return `${this._assetsHost()}/datas/${this.lang.selected}/${
      this.regionName
    }/quickPositions.json`;
  },

  getAnnouncementsJsonFilePath: function () {
    return `${this._assetsHost()}/datas/${
      this.lang.selected
    }/common/announcements.json`;
  },

  getFunctionalUpdatesJsonFilePath: function () {
    return `${this._assetsHost()}/datas/${
      this.lang.selected
    }/common/functionalUpdates.json`;
  },

  getGameEventsJsonFilePath: function () {
    return `${this._assetsHost()}/datas/${
      this.lang.selected
    }/common/gameEvents.json`;
  },

  getGameExplorationsJsonFilePath: function () {
    return `${this._assetsHost()}/datas/${
      this.lang.selected
    }/common/gameExplorations.json`;
  },

  getGameEventsOtherJsonFilePath: function () {
    return `${this._assetsHost()}/datas/${
      this.lang.selected
    }/common/gameEventsOther.json`;
  },

  getTilesFilePath: function () {
    return `${this._assetsHost()}/tiles/xyyy/{z}/{x}/{y}.jpg`;
  },

  getMarkerImageFilePath: function (image) {
    return `${this._assetsHost()}/images/${this.regionName}/markers/${image}`;
  },

  _assetsHost: function () {
    return this.env === "prod" ? "https://map-assets.nikkimomo.cc" : "./assets";
  },

  isMobile: function () {
    return window.innerWidth <= 768 || window.innerHeight <= 768;
  },

  isMobilePortrait: function () {
    return window.innerWidth <= 768;
  },

  i18n: function (location, inject = [], lang = this.lang.selected) {
    let paths = location.split(".");
    let dictionary = this.lang.data[lang];

    if (!dictionary) return null;

    let localized = dictionary;

    for (let path of paths) {
      if (localized[path]) {
        localized = localized[path];
      } else {
        if (lang !== this.lang.default) {
          return this.i18n(location, inject, this.lang.default);
        } else {
          return null;
        }
      }
    }
    
    if (typeof localized !== "string") {
      return null;
    }

    inject.forEach((value, index) => {
      localized = localized.replace(`{${index}}`, value);
    });

    return localized;
  },
};
