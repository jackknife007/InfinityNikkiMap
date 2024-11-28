"use strict";

let resourceControl = {
  // 默认世界名称
  regionName: "xyyy",

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
    return `./assets/data/common/groups.json`;
  },

  getCategoriesJsonFilePath: function () {
    return `./assets/data/${this.regionName}/categories.json`;
  },

  getMarkersJsonFilePath: function () {
    return `./assets/data/${this.regionName}/markers.json`;
  },

  getQuickPositionsJsonFilePath: function () {
    return `./assets/data/${this.regionName}/quickPositions.json`;
  },

  getTilesFilePath: function () {
    return `./assets/tiles/${this.regionName}/{z}/{x}/{y}.jpg`;
  },

  getMarkerImageFilePath: function (image) {
    return `./assets/images/${this.regionName}/markers/${image}`;
  },

  isMobile: function () {
    return window.innerWidth <= 768 || window.innerHeight <= 768;
  },

  isMobilePortrait: function () {
    return window.innerWidth <= 768;
  },
};
