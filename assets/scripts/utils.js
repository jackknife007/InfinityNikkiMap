"use strict";

let resourceControl = {
  env: "dev",
  // 默认世界名称
  regionName: "xyyy",
  version: "1.0.0",

  init: function () {
    this.loadRegionName();
    this.loadEnv();
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

  loadRegionName: function () {
    this.regionName = localStorage.getItem("regionName") || this.regionName;
    return this.regionName;
  },

  getRegionName: function () {
    return this.regionName;
  },

  getRegionNameZh: function () {
    return this.regionName === "xyyy" ? "心愿原野" : "未知";
  },

  setRegionName: function (regionName) {
    localStorage.setItem("regionName", regionName);
    location.reload();
  },

  isCurrentRegion: function (regionName) {
    return this.regionName === regionName;
  },

  getGroupsJsonFilePath: function () {
    return `${this._assetsHost()}/datas/common/groups.json`;
  },

  getCategoriesJsonFilePath: function () {
    return `${this._assetsHost()}/datas/${this.regionName}/categories.json`;
  },

  getMarkersJsonFilePath: function () {
    return `${this._assetsHost()}/datas/${this.regionName}/markers.json`;
  },

  getQuickPositionsJsonFilePath: function () {
    return `${this._assetsHost()}/datas/${this.regionName}/quickPositions.json`;
  },

  getGameActivityJsonFilePath: function () {
    return `${this._assetsHost()}/datas/common/gameActivity.json`;
  },

  getGameActivityMarkerJsonFilePath: function (fileSuffix) {
    return `${this._assetsHost()}/datas/${
      this.regionName
    }/markers_${fileSuffix}.json`;
  },

  getAnouncementsJsonFilePath: function () {
    return `${this._assetsHost()}/datas/common/announcements.json`;
  },

  getFunctionalUpdatesJsonFilePath: function () {
    return `${this._assetsHost()}/datas/common/functionalUpdates.json`;
  },

  getGameEventsJsonFilePath: function () {
    return `${this._assetsHost()}/datas/common/gameEvents.json`;
  },

  getGameExplorationsJsonFilePath: function () {
    return `${this._assetsHost()}/datas/common/gameExplorations.json`;
  },

  getGameEventsOtherJsonFilePath: function () {
    return `${this._assetsHost()}/datas/common/gameEventsOther.json`;
  },

  getTilesFilePath: function () {
    return `${this._assetsHost()}/tiles/${this.regionName}/{z}/{x}/{y}.jpg`;
  },

  getTilesMaxZoom: function () {
    if (this.regionName === "xyyy") {
      return 6;
    } else if (this.regionName === "hyqd") {
      return 3;
    } else {
      return 6;
    }
  },

  getTilesBounds: function () {
    if (this.regionName === "xyyy") {
      return [-112.45, -70.58, 132.51, 68.36];
    } else if (this.regionName === "hyqd") {
      return [-180, -90, 180, 90];
    } else {
      return [-112.45, -70.58, 132.51, 68.36];
    }
  },

  getMarkerImageFilePath: function (image) {
    return `${this._assetsHost()}/images/${this.regionName}/markers/${image}`;
  },

  _assetsHost: function () {
    return this.env === "uat" ? "https://map-assets.nikkimomo.cc" : "./assets";
  },

  isMobile: function () {
    const ua = navigator.userAgent.toLowerCase();
    return /mobile|android|iphone|ipad|phone/i.test(ua);
  },

  isMobilePortrait: function () {
    return this.isMobile() && window.innerWidth <= 768;
  },
};
