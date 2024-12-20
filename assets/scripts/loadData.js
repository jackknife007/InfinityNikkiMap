"use strict";

const PersonalMarkerIdUpperBound = 31 * 10;
const NormalMarkerIdLowerBound = 31 * 400 + 1;
const newAddMarkerIdLowerBound = 31 * 10000 + 1;

class IgnoreStateStorage {
  constructor(name, offset = 1, shardSize = 100) {
    this.name = `${name}-ignore`;
    this.offset = offset;
    this.indexStorage = new IndexStorage(this.name, shardSize);
  }

  load() {
    const indexes = this.indexStorage.getAllindexes();
    let datas = new Set();
    indexes.forEach((index) => {
      let ignoreState = this.getIgnoreState(index);
      while (ignoreState > 0) {
        const mask = ignoreState & -ignoreState;
        let markerId = index * 31 + this.offset + Math.log2(mask);
        datas.add(markerId);
        ignoreState &= ~mask;
      }
    });
    return datas;
  }

  save(datas) {
    this.clear();

    const stateMap = new Map();

    // 批量处理markerId
    datas.forEach((markerId) => {
      const [index, mask] = this.getIndexAndMask(markerId);

      let state = stateMap.get(index) || 0;
      // 设置对应位为1
      state |= mask;
      stateMap.set(index, state);
    });

    stateMap.forEach((state, index) => {
      this.indexStorage.add(index);
      localStorage.setItem(this._ignoreStateKey(index), state.toString());
    });
  }

  clear() {
    this.indexStorage.getAllindexes().forEach((index) => {
      localStorage.removeItem(this._ignoreStateKey(index));
      this.indexStorage.delete(index);
    });
  }

  set(markerId, ignore) {
    const [index, mask] = this.getIndexAndMask(markerId);
    let ignoreState = this.getIgnoreState(index);

    // ignore为true则设置对应bit为1,否则为0
    if (ignore) {
      ignoreState |= mask;
    } else {
      ignoreState &= ~mask;
    }
    if (ignoreState === 0) {
      localStorage.removeItem(this._ignoreStateKey(index));
      this.indexStorage.delete(index);
    } else {
      localStorage.setItem(this._ignoreStateKey(index), ignoreState);
    }
  }

  getIgnoreState(index) {
    let ignoreState = 0;
    if (localStorage.getItem(this._ignoreStateKey(index)) !== null) {
      ignoreState = parseInt(localStorage.getItem(this._ignoreStateKey(index)));
    } else {
      this.indexStorage.add(index);
    }
    return ignoreState;
  }

  getIndexAndMask(markerId) {
    const index = markerId - this.offset;
    const mask = 1 << index % 31;
    return [Math.floor(index / 31), mask];
  }

  _ignoreStateKey(index) {
    return `${this.name}-${index}`;
  }
}

class IndexStorage {
  constructor(name, shardSize = 100) {
    this.name = name;
    this.shardSize = shardSize;
    this.indexShardNumsKey = `${name}-index-shard-nums`;
    this.shardDatas = new Map();

    this.load();
  }

  load() {
    const shardNums = localStorage.getItem(this.indexShardNumsKey);
    if (shardNums) {
      shardNums
        .split(",")
        .map(Number)
        .forEach((shardNum) => {
          const shard = localStorage.getItem(this._shardKey(shardNum));
          if (shard) {
            this.shardDatas.set(
              shardNum,
              new Set(shard.split(",").map(Number))
            );
          }
        });
    }
  }

  getAllindexes() {
    const indexes = [];
    this.shardDatas.forEach((shardData) => {
      shardData.forEach((index) => {
        indexes.push(index);
      });
    });
    return indexes;
  }

  add(index) {
    const shardNum = Math.floor(index / this.shardSize);
    let shardData = this.shardDatas.get(shardNum);
    if (!shardData) {
      shardData = new Set();
      this.shardDatas.set(shardNum, shardData);
      this.saveIndexShardNums();
    }
    shardData.add(index);
    this.saveIndexShardValue(shardNum, shardData);
  }

  delete(index) {
    const shardNum = Math.floor(index / this.shardSize);
    const shardData = this.shardDatas.get(shardNum);
    if (shardData) {
      shardData.delete(index);
      if (shardData.size === 0) {
        this.shardDatas.delete(shardNum);
        this.saveIndexShardNums();
        localStorage.removeItem(this._shardKey(shardNum));
      } else {
        this.saveIndexShardValue(shardNum, shardData);
      }
    }
  }

  saveIndexShardNums() {
    if (this.shardDatas.size === 0) {
      localStorage.removeItem(this.indexShardNumsKey);
    } else {
      localStorage.setItem(
        this.indexShardNumsKey,
        Array.from(this.shardDatas.keys()).join(",")
      );
    }
  }

  saveIndexShardValue(shardNum, shardData) {
    localStorage.setItem(
      this._shardKey(shardNum),
      Array.from(shardData).join(",")
    );
  }

  _shardKey(shardNum) {
    return `${this.name}-index-shard-${shardNum}`;
  }
}

let allDatas = {
  groups: new Map(),
  categories: new Map(),
  quickPositions: {
    defaultData: new Map(),
    personalData: new Map(),
    nextPositionId: 1,
    upperBoungd: 100,
    load: function (dataArray) {
      dataArray.forEach((data) => {
        this.defaultData.set(data.id, data);
      });
      const stored = localStorage.getItem(this._item_key());
      if (stored) {
        const quickPositionsArray = JSON.parse(stored);
        quickPositionsArray.forEach((data) => {
          this.personalData.set(data.id, data);
        });
      }
      let positionsId = Array.from(this.personalData.keys());
      positionsId.sort();
      let i = 0;
      while (i < positionsId.length && positionsId[i] == i + 1) {
        i++;
      }
      this.nextPositionId = i + 1;
    },

    getAllPositions: function () {
      const positions = {};

      // 获取默认数据
      this.defaultData.forEach((value, key) => {
        positions[key] = value;
      });

      // 获取个人数据
      this.personalData.forEach((value, key) => {
        positions[key] = value;
      });

      return positions;
    },

    add: function (position) {
      position.id = this.getNextPositionId();
      if (position.id) {
        this.personalData.set(position.id, position);
        this.saveToLocalStorage();
      }
      return position.id;
    },

    delete: function (positionId) {
      this.nextPositionId = Math.min(this.nextPositionId, positionId);
      this.personalData.delete(positionId);
      this.saveToLocalStorage();
    },

    getNextPositionId: function () {
      let nextPositionId = this.nextPositionId;
      if (nextPositionId > this.upperBoungd) {
        tips.show("快速定位已达上限", "请删除部分快速定位后再添加");
        return null;
      } else {
        this.nextPositionId += 1;
        // 确保nextPositionId是未使用的
        while (this.personalData.has(this.nextPositionId)) {
          this.nextPositionId += 1;
        }
        return nextPositionId;
      }
    },

    saveToLocalStorage: function () {
      try {
        const quickPositionsArray = Array.from(this.personalData.values());
        if (quickPositionsArray.length === 0) {
          localStorage.removeItem(this._item_key());
        } else {
          localStorage.setItem(
            this._item_key(),
            JSON.stringify(quickPositionsArray)
          );
        }
      } catch (error) {
        console.error("保存快速定位失败:", error);
      }
    },

    clear: function () {
      localStorage.removeItem(this._item_key());
      location.reload();
    },

    save: function (data) {
      this.personalData = new Map(data);
      // 保存到localStorage
      this.saveToLocalStorage();
    },

    _item_key: function () {
      return `${resourceControl.getRegionName()}-quickPositions`;
    },
  },

  serverMarkers: new Map(),
  maxMarkerId: NormalMarkerIdLowerBound - 1,
  nextMarkerId: newAddMarkerIdLowerBound - 1,
  dataTimestamp: 0,

  ignoreMarkers: {
    data: new Map(),
    personalIgnoreState: new IgnoreStateStorage(
      `${resourceControl.getRegionName()}-personal`,
      1,
      100
    ),
    normalIgnoreState: new IgnoreStateStorage(
      `${resourceControl.getRegionName()}-normal`,
      NormalMarkerIdLowerBound,
      100
    ),

    loadFromLocalStorage: function () {
      try {
        this.personalIgnoreState.load().forEach((markerId) => {
          const marker = allDatas.getMarker(markerId);
          this.data.get(marker.categoryId).add(markerId);
        });

        this.normalIgnoreState.load().forEach((markerId) => {
          const marker = allDatas.getMarker(markerId);
          this.data.get(marker.categoryId).add(markerId);
        });
      } catch (error) {
        console.error("读取已标记坐标失败:", error);
      }
    },

    has: function (markerId) {
      return this.data.has(markerId);
    },

    delete: function (markerId, categoryId) {
      const ignoreSet = this.data.get(categoryId);
      if (ignoreSet.has(markerId)) {
        ignoreSet.delete(markerId);
        if (allDatas.isPersonalCategory(categoryId)) {
          this.personalIgnoreState.set(markerId, false);
        } else {
          this.normalIgnoreState.set(markerId, false);
        }
      }
    },

    changeState: function (markerId, categoryId) {
      const ignoreSet = this.data.get(categoryId);
      const ignore = ignoreSet.has(markerId);
      if (ignore) {
        ignoreSet.delete(markerId);
      } else {
        ignoreSet.add(markerId);
      }
      if (allDatas.isPersonalCategory(categoryId)) {
        this.personalIgnoreState.set(markerId, !ignore);
      } else {
        this.normalIgnoreState.set(markerId, !ignore);
      }
      return !ignore;
    },

    clear: function (persional = true, normal = true, reload = true) {
      if (persional) {
        this.personalIgnoreState.clear();
      }
      if (normal) {
        this.normalIgnoreState.clear();
      }
      if (reload) {
        location.reload();
      }
    },

    save(datas) {
      // 遍历并保存个人分类的标记
      let personalMarkers = new Set();
      let normalMarkers = new Set();

      // 遍历Map，收集个人分类的markers
      for (const [categoryId, markerSet] of datas) {
        markerSet.forEach((markerId) => {
          if (allDatas.getMarker(markerId)) {
            if (allDatas.isPersonalCategory(categoryId)) {
              personalMarkers.add(markerId);
            } else {
              normalMarkers.add(markerId);
            }
          }
        });
      }

      // 保存收集到的markers
      this.personalIgnoreState.save(personalMarkers);
      this.normalIgnoreState.save(normalMarkers);
    },
  },

  personalMarkers: {
    data: new Map(),
    nextMarkerId: 1,

    loadFromLocalStorage: function () {
      try {
        const stored = localStorage.getItem(this._item_key());
        if (stored) {
          const personalMarkersArray = JSON.parse(stored);
          this.data = new Map(personalMarkersArray);
        }

        let markersId = Array.from(this.data.keys());
        markersId.sort();
        let i = 0;
        while (i < markersId.length && markersId[i] == i + 1) {
          i++;
        }
        this.nextMarkerId = i + 1;
      } catch (error) {
        console.error("读取自定义坐标失败:", error);
      }
    },

    get: function (markerId) {
      return this.data.get(markerId);
    },

    getNextMarkerId: function () {
      let nextMarkerId = this.nextMarkerId;
      if (nextMarkerId > PersonalMarkerIdUpperBound) {
        tips.show("自定义坐标已达上限", "请删除部分自定义坐标后再添加");
        return null;
      } else {
        this.nextMarkerId += 1;
        // 确保nextMarkerId是未使用的
        while (this.data.has(this.nextMarkerId)) {
          this.nextMarkerId += 1;
        }
        return nextMarkerId;
      }
    },

    set: function (markerId, marker) {
      this.data.set(markerId, marker);
      this.saveToLocalStorage();
    },

    delete: function (markerId) {
      // 如果删除的markerId小于nextMarkerId,则更新nextMarkerId
      this.nextMarkerId = Math.min(this.nextMarkerId, markerId);
      this.data.delete(markerId);
      this.saveToLocalStorage();
    },

    saveToLocalStorage: function () {
      try {
        const personalMarkersArray = Array.from(this.data.entries());
        if (personalMarkersArray.length === 0) {
          localStorage.removeItem(this._item_key());
        } else {
          localStorage.setItem(
            this._item_key(),
            JSON.stringify(personalMarkersArray)
          );
        }
      } catch (error) {
        console.error("保存自定义坐标失败:", error);
      }
    },

    clear: function () {
      localStorage.removeItem(this._item_key());
      allDatas.ignoreMarkers.personalIgnoreState.clear();
      location.reload();
    },

    save: function (data) {
      this.data = new Map(data);
      // 保存到localStorage
      this.saveToLocalStorage();
    },

    _item_key: function () {
      return `${resourceControl.getRegionName()}-personalMarkers`;
    },
  },

  newAddMarkers: {
    data: new Map(),

    loadFromLocalStorage: function () {
      try {
        const stored = localStorage.getItem(this._item_key());
        if (stored) {
          const markersArray = JSON.parse(stored);
          markersArray.forEach((marker) => {
            this.data.set(parseInt(marker.id), marker);
            allDatas.serverMarkers.set(parseInt(marker.id), marker);
            allDatas.nextMarkerId = Math.max(allDatas.nextMarkerId, marker.id);
          });
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
        const markersArray = Array.from(this.data.values());
        if (markersArray.length === 0) {
          localStorage.removeItem(this._item_key());
        } else {
          localStorage.setItem(this._item_key(), JSON.stringify(markersArray));
        }
      } catch (error) {
        console.error("保存新增坐标失败:", error);
      }
    },

    _item_key: function () {
      return `${resourceControl.getRegionName()}-newAddMarkers`;
    },
  },

  editedMarkers: {
    data: new Map(),

    loadFromLocalStorage: function () {
      try {
        const stored = localStorage.getItem(this._item_key());
        if (stored) {
          const markersArray = JSON.parse(stored);
          markersArray.forEach((marker) => {
            this.data.set(parseInt(marker.id), marker);
            allDatas.serverMarkers.set(parseInt(marker.id), marker);
          });
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
        const markersArray = Array.from(this.data.values());
        if (markersArray.length === 0) {
          localStorage.removeItem(this._item_key());
        } else {
          localStorage.setItem(this._item_key(), JSON.stringify(markersArray));
        }
      } catch (error) {
        console.error("保存已编辑坐标失败:", error);
      }
    },

    _item_key: function () {
      return `${resourceControl.getRegionName()}-editedMarkers`;
    },
  },

  deletedMarkers: {
    data: new Set(),

    loadFromLocalStorage: function () {
      try {
        const stored = localStorage.getItem(this._item_key());
        if (stored) {
          const deletedArray = JSON.parse(stored);
          deletedArray.forEach((markerId) => {
            this.data.add(markerId);
            allDatas.serverMarkers.delete(parseInt(markerId));
          });
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
      return `${resourceControl.getRegionName()}-deletedMarkers`;
    },
  },

  load: async function () {
    try {
      const [groups, categories, markers, qkPos] = await Promise.all([
        fetch(resourceControl.getGroupsJsonFilePath()).then((res) =>
          res.json()
        ),
        fetch(resourceControl.getCategoriesJsonFilePath()).then((res) =>
          res.json()
        ),
        fetch(resourceControl.getMarkersJsonFilePath()).then((res) =>
          res.json()
        ),
        fetch(resourceControl.getQuickPositionsJsonFilePath()).then((res) =>
          res.json()
        ),
      ]);

      this.dataTimestamp = markers.timestamp;
      this.quickPositions.load(qkPos);

      groups.forEach((group) => {
        group.categoriesInfo = [];
        this.groups.set(group.id, group);
      });

      categories.forEach((category) => {
        const categoryId = parseInt(category.id);
        this.ignoreMarkers.data.set(categoryId, new Set());
        category.markersId = new Set();
        this.categories.set(categoryId, category);
        const group = this.groups.get(category.groupId);
        if (group) {
          group.categoriesInfo.push(categoryId);
        }
      });

      markers.data.forEach((marker) => {
        this.serverMarkers.set(parseInt(marker.id), marker);
        this.maxMarkerId = Math.max(this.maxMarkerId, marker.id);
      });

      // 加载localStorage数据
      this.newAddMarkers.loadFromLocalStorage();
      this.editedMarkers.loadFromLocalStorage();
      this.deletedMarkers.loadFromLocalStorage();

      // 设定serverMarkers的分类
      this.serverMarkers.forEach((marker) => {
        const category = this.categories.get(marker.categoryId);
        if (category) {
          category.markersId.add(marker.id);
        }
      });

      // 设定personalMarkers的分类
      this.personalMarkers.loadFromLocalStorage();
      for (const marker of this.personalMarkers.data.values()) {
        const category = this.categories.get(marker.categoryId);
        if (category) {
          category.markersId.add(marker.id);
        }
      }

      this.ignoreMarkers.loadFromLocalStorage();
    } catch (error) {
      console.error("加载数据失败:", error);
    }
  },

  getNextMarkerId: function () {
    this.nextMarkerId += 1;
    return this.nextMarkerId;
  },

  getMarker: function (markerId) {
    return (
      this.serverMarkers.get(markerId) || this.personalMarkers.get(markerId)
    );
  },

  addMarker: function (marker) {
    if (this.isPersonalCategory(marker.categoryId)) {
      let markerId = this.personalMarkers.getNextMarkerId();
      if (markerId) {
        marker.id = markerId;
        this.personalMarkers.set(markerId, marker);
        return true;
      } else {
        return false;
      }
    } else {
      marker.id = this.getNextMarkerId();
      this.serverMarkers.set(marker.id, marker);
      this.newAddMarkers.set(marker.id, marker);
      return true;
    }
  },

  editMarker: function (marker) {
    if (this.personalMarkers.data.has(marker.id)) {
      this.personalMarkers.set(marker.id, marker);
    } else if (this.newAddMarkers.data.has(marker.id)) {
      this.serverMarkers.set(marker.id, marker);
      this.newAddMarkers.set(marker.id, marker);
    } else {
      this.serverMarkers.set(marker.id, marker);
      this.editedMarkers.set(marker.id, marker);
    }
  },

  deleteMarker: function (markerId, categoryId) {
    if (this.newAddMarkers.data.has(markerId)) {
      this.newAddMarkers.delete(markerId);
    } else if (this.personalMarkers.data.has(markerId)) {
      this.personalMarkers.delete(markerId);
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
    this.newAddMarkers.data.forEach((marker, markerId) => {
      this.ignoreMarkers.delete(markerId, marker.categoryId);
    });
    location.reload();
  },

  downloadPersonalData: function () {
    const data = {
      ignoreMarkers: Array.from(this.ignoreMarkers.data.entries()).map(
        ([categoryId, markerSet]) => [categoryId, Array.from(markerSet)]
      ),
      personalMarkers: Array.from(this.personalMarkers.data.entries()),
      quickPositions: Array.from(this.quickPositions.personalData.entries()),
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

      // 恢复 personalMarkers
      if (data.personalMarkers) {
        this.personalMarkers.save(data.personalMarkers);
      }

      // 恢复 ignoreMarkers
      if (data.ignoreMarkers) {
        this.ignoreMarkers.save(data.ignoreMarkers);
      }

      // 恢复 quickPositions
      if (data.quickPositions) {
        this.quickPositions.save(data.quickPositions);
      }

      location.reload();
    };
    input.click();
  },

  downloadServerMarkers: function () {
    let serverMarkersCopy = [];
    let nextMarkerId = this.maxMarkerId + 1;
    for (const marker of this.serverMarkers.values()) {
      if (this.newAddMarkers.data.has(marker.id)) {
        serverMarkersCopy.push({ ...marker, id: nextMarkerId });
        nextMarkerId += 1;
      } else {
        serverMarkersCopy.push(marker);
      }
    }
    let downloadData = {
      timestamp: Date.now(),
      data: Array.from(serverMarkersCopy.values()),
    };
    this.downloadDataJson(downloadData, "所有坐标备份(不含自定义)");
  },

  downloadNewAddMarkers: function () {
    const data = Array.from(this.newAddMarkers.data.values());
    this.downloadDataJson(data, "新增数据备份(不含自定义)");
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

  downloadDataJson: function (dataToJsonStringData, fileName) {
    // 创建 Blob
    const blob = new Blob([JSON.stringify(dataToJsonStringData, null, 2)], {
      type: "application/json",
    });

    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${resourceControl.getRegionNameZh()}-${fileName}.json`;

    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  isPersonalCategory: function (categoryId) {
    return categoryId > 900;
  },
};
