"use strict";

let allDatas = {
  maxMarkerId: 0,
  dataTimestamp: 0,

  groups: new Map(),
  categories: new Map(),
  quickPositions: new Array(),

  serverMarkers: new Map(),

  ignoreMarkers: {
    data: new Map(),

    loadFromLocalStorage: function (categorysId) {
      try {
        for (const categoryId of categorysId) {
          const stored = localStorage.getItem(this._item_key(categoryId));
          if (stored) {
            const markersArray = JSON.parse(stored);
            this.data.set(categoryId, new Set(markersArray));
          }
        }
      } catch (error) {
        console.error("读取已标记坐标失败:", error);
      }
    },

    has: function (markerId, categorysId) {
      return this.data.get(categorysId)?.has(markerId) || false;
    },

    delete: function (markerId, categorysId) {
      const ignoreMarkersId = this.data.get(categorysId);
      if (ignoreMarkersId && ignoreMarkersId.has(markerId)) {
        ignoreMarkersId.delete(markerId);
        this.saveToLocalStorage(categorysId);
      }
    },

    changeState: function (markerId, categoryId) {
      let ignoreMarkersId = this.data.get(categoryId);
      if (!ignoreMarkersId) {
        ignoreMarkersId = new Set();
        this.data.set(categoryId, ignoreMarkersId);
      }
      const ignore = ignoreMarkersId.has(markerId);
      if (ignore) {
        ignoreMarkersId.delete(markerId);
      } else {
        ignoreMarkersId.add(markerId);
      }
      this.saveToLocalStorage(categoryId);
      return !ignore;
    },

    saveToLocalStorage: function (categoryId) {
      try {
        const ignoreMarkersArray = Array.from(this.data.get(categoryId));
        localStorage.setItem(
          this._item_key(categoryId),
          JSON.stringify(ignoreMarkersArray)
        );
      } catch (error) {
        console.error("保存已标记坐标失败:", error);
      }
    },

    clear: function () {
      for (const categoryId of this.data.keys()) {
        localStorage.removeItem(this._item_key(categoryId));
      }
      location.reload();
    },

    loadFromFileData: function (data) {
      for (const categoryId of this.data.keys()) {
        localStorage.removeItem(this._item_key(categoryId));
      }
      this.data = new Map(
        data.map(([categoryId, markers]) => [categoryId, new Set(markers)])
      );
      for (const categoryId of this.data.keys()) {
        this.saveToLocalStorage(categoryId);
      }
    },

    _item_key: function (categoryId) {
      return `ignoreMarkers-category-${categoryId}`;
    },
  },

  defaultMarkers: {
    data: new Map(),

    loadFromLocalStorage: function () {
      try {
        const stored = localStorage.getItem(this._item_key());
        if (stored) {
          const defaultMarkersArray = JSON.parse(stored);
          this.data = new Map(defaultMarkersArray);
        }
      } catch (error) {
        console.error("读取自定义坐标失败:", error);
      }
    },

    get: function (markerId) {
      return this.data.get(markerId);
    },

    set: function (markerId, marker) {
      this.data.set(markerId, marker);
      this.saveToLocalStorage();
    },

    delete: function (markerId) {
      this.data.delete(markerId);
      this.saveToLocalStorage();
    },

    saveToLocalStorage: function () {
      try {
        const defaultMarkersArray = Array.from(this.data.entries());
        localStorage.setItem(
          this._item_key(),
          JSON.stringify(defaultMarkersArray)
        );
      } catch (error) {
        console.error("保存自定义坐标失败:", error);
      }
    },

    clear: function () {
      localStorage.removeItem(this._item_key());
      location.reload();
    },

    loadFromFileData: function (data) {
      this.data = new Map(data);
      // 保存到localStorage
      this.saveToLocalStorage();
    },

    _item_key: function () {
      return "defaultMarkers";
    },
  },

  newAddMarkers: {
    data: new Map(),

    load: function () {
      try {
        const stored = localStorage.getItem(this._item_key());
        if (stored) {
          const markersArray = JSON.parse(stored);
          this.data = new Map(markersArray);
        }
      } catch (error) {
        console.error("读取新增坐标失败:", error);
      }
    },

    set: function (markerId, marker) {
      this.data.set(markerId, marker);
      this.saveToLocalStorage();
    },

    delete: function (markerId) {
      this.data.delete(markerId);
      this.saveToLocalStorage();
    },

    saveToLocalStorage: function () {
      try {
        const markersArray = Array.from(this.data.entries());
        localStorage.setItem(this._item_key(), JSON.stringify(markersArray));
      } catch (error) {
        console.error("保存新增坐标失败:", error);
      }
    },

    _item_key: function () {
      return "newAddMarkers";
    },
  },

  editedMarkers: {
    data: new Map(),

    load: function () {
      try {
        const stored = localStorage.getItem(this._item_key());
        if (stored) {
          const markersArray = JSON.parse(stored);
          this.data = new Map(markersArray);
        }
      } catch (error) {
        console.error("读取已编辑坐标失败:", error);
      }
    },

    set: function (markerId, marker) {
      this.data.set(markerId, marker);
      this.saveToLocalStorage();
    },

    delete: function (markerId) {
      this.data.delete(markerId);
      this.saveToLocalStorage();
    },

    saveToLocalStorage: function () {
      try {
        const markersArray = Array.from(this.data.entries());
        localStorage.setItem(this._item_key(), JSON.stringify(markersArray));
      } catch (error) {
        console.error("保存已编辑坐标失败:", error);
      }
    },

    _item_key: function () {
      return "editedMarkers";
    },
  },

  deletedMarkers: {
    data: new Set(),

    load: function () {
      try {
        const stored = localStorage.getItem(this._item_key());
        if (stored) {
          const deletedArray = JSON.parse(stored);
          this.data = new Set(deletedArray);
        }
      } catch (error) {
        console.error("读取已删除坐标失败:", error);
      }
    },

    add: function (markerId) {
      this.data.add(markerId);
      this.saveToLocalStorage();
    },

    saveToLocalStorage: function () {
      try {
        const deletedArray = Array.from(this.data);
        localStorage.setItem(this._item_key(), JSON.stringify(deletedArray));
      } catch (error) {
        console.error("保存已删除坐标失败:", error);
      }
    },

    _item_key: function () {
      return "deletedMarkers";
    },
  },

  getNextMarkerId: function () {
    this.maxMarkerId += 1;
    return this.maxMarkerId;
  },

  getMarker: function (markerId) {
    return (
      this.serverMarkers.get(markerId) || this.defaultMarkers.get(markerId)
    );
  },

  addMarker: function (marker) {
    marker.id = this.getNextMarkerId();
    if (this.isDefaultCategory(marker.categoryId)) {
      this.defaultMarkers.set(marker.id, marker);
    } else {
      this.newAddMarkers.set(marker.id, marker);
    }
    this.serverMarkers.set(marker.id, marker);
  },

  editMarker: function (marker) {
    if (this.newAddMarkers.data.has(marker.id)) {
      this.newAddMarkers.set(marker.id, marker);
    } else if (this.defaultMarkers.data.has(marker.id)) {
      this.defaultMarkers.set(marker.id, marker);
    } else {
      this.editedMarkers.set(marker.id, marker);
    }
    this.serverMarkers.set(marker.id, marker);
  },

  deleteMarker: function (markerId, categoryId) {
    if (this.newAddMarkers.data.has(markerId)) {
      this.newAddMarkers.delete(markerId);
    } else if (this.defaultMarkers.data.has(markerId)) {
      this.defaultMarkers.delete(markerId);
    } else if (this.editedMarkers.data.has(markerId)) {
      this.editedMarkers.delete(markerId);
      this.deletedMarkers.add(markerId);
    } else {
      this.deletedMarkers.add(markerId);
    }
    this.serverMarkers.delete(markerId);
    this.ignoreMarkers.delete(markerId, categoryId);
  },

  clearDevelopMarkers: function () {
    localStorage.removeItem(this.editedMarkers._item_key());
    localStorage.removeItem(this.deletedMarkers._item_key());
    localStorage.removeItem(this.newAddMarkers._item_key());
    location.reload();
  },

  downloadPersonalData: function () {
    const data = {
      ignoreMarkers: Array.from(this.ignoreMarkers.data.entries()).map(
        ([categoryId, markerSet]) => [
          categoryId,
          Array.from(markerSet), // 将 Set 转换为数组
        ]
      ),
      defaultMarkers: Array.from(this.defaultMarkers.data.entries()),
    };
    this.downloadDataJson(data, "个人数据备份");
  },

  uploadPersonalData: function () {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (!file) {
        return;
      }

      const text = await file.text();
      const data = JSON.parse(text);

      // 恢复 ignoreMarkers
      if (data.ignoreMarkers) {
        this.ignoreMarkers.loadFromFileData(data.ignoreMarkers);
      }

      // 恢复 defaultMarkers
      if (data.defaultMarkers) {
        this.defaultMarkers.loadFromFileData(data.defaultMarkers);
      }

      location.reload();
    };
    input.click();
  },

  downloadServerMrkers: function () {
    const data = Array.from(this.serverMarkers.values());
    this.downloadDataJson(data, "所有坐标备份");
  },

  downloadNewAddMarkers: function () {
    const data = Array.from(this.newAddMarkers.data.values());
    this.downloadDataJson(data, "新增数据备份");
  },

  uploadNewAddMarkers: function () {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (!file) {
        return;
      }

      const text = await file.text();
      const data = JSON.parse(text);

      if (data) {
        this.newAddMarkers.data = new Map(
          data.map((marker) => [marker.id, marker])
        );
        // 保存到localStorage
        this.newAddMarkers.saveToLocalStorage();
      }
      location.reload();
    };
    input.click();
  },

  load: function (groups, categories, markers, qkPos) {
    this.dataTimestamp = markers.timestamp;
    this.quickPositions = qkPos;

    groups.forEach((group) => {
      group.categoriesInfo = [];
      this.groups.set(group.id, group);
    });

    categories.forEach((category) => {
      category.markersId = new Set();
      const categoryId = parseInt(category.id);
      this.categories.set(categoryId, category);
      const group = this.groups.get(category.groupId);
      if (group) {
        group.categoriesInfo.push(categoryId);
      }
    });

    markers.data.forEach((marker) => {
      this.serverMarkers.set(parseInt(marker.id), marker);
    });

    this.editedMarkers.load();

    this.editedMarkers.data.forEach((marker) => {
      this.serverMarkers.set(parseInt(marker.id), marker);
    });

    this.deletedMarkers.load();
    this.deletedMarkers.data.forEach((markerId) => {
      this.serverMarkers.delete(parseInt(markerId));
    });

    this.newAddMarkers.load();
    this.newAddMarkers.data.forEach((marker) => {
      this.serverMarkers.set(parseInt(marker.id), marker);
    });

    this.defaultMarkers.loadFromLocalStorage();
    this.defaultMarkers.data.forEach((marker) => {
      this.serverMarkers.set(parseInt(marker.id), marker);
    });

    this.serverMarkers.forEach((marker) => {
      this.maxMarkerId = Math.max(this.maxMarkerId, marker.id);
      const category = this.categories.get(marker.categoryId);
      if (category) {
        category.markersId.add(marker.id);
      }
    });

    this.ignoreMarkers.loadFromLocalStorage(this.categories.keys());
  },

  downloadDataJson: function (dataToJsonStringData, fileName) {
    // 创建 Blob
    const blob = new Blob([JSON.stringify(dataToJsonStringData, null, 2)], {
      type: "application/json",
    });

    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.json`;

    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  isDefaultCategory: function (categoryId) {
    return categoryId >= 900;
  },
};

async function loadData() {
  try {
    const [groups, categories, markers, qkPos] = await Promise.all([
      fetch("./assets/data/groups.json").then((res) => res.json()),
      fetch("./assets/data/categories.json").then((res) => res.json()),
      fetch("./assets/data/markers.json").then((res) => res.json()),
      fetch("./assets/data/quickPositions.json").then((res) => res.json()),
    ]);

    allDatas.load(groups, categories, markers, qkPos);
  } catch (error) {
    console.error("加载数据失败:", error);
  }
}
