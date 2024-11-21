let globalGroups = new Map();
let globalCategories = new Map();
let globalMarkers = new Map();
let nextMarkerId = 0;
let globalQuickPositions;
let localEditedMarkers = new Map();
let localDeletedMarkers = new Set();

async function loadData() {
  try {
    const [groups, categories, markers, qkPos] = await Promise.all([
      fetch("./assets/data/groups.json").then((res) => res.json()),
      fetch("./assets/data/categories.json").then((res) => res.json()),
      fetch("./assets/data/markers.json").then((res) => res.json()),
      fetch("./assets/data/quickPositions.json").then((res) => res.json()),
    ]);

    // 等待加载本地存储数据
    await Promise.all([
      loadDeletedMarkersFromStorage(),
      loadEditedMarkersFromStorage(),
    ]);

    var currentMarkerId = 0;

    globalQuickPositions = qkPos;

    groups.forEach((group) => {
      group.categoriesInfo = [];
      globalGroups.set(Number(group.id), group);
    });

    categories.forEach((category) => {
      category.markersId = new Set();
      category.ignoredMarkers = new Set();
      globalCategories.set(Number(category.id), category);
      const group = globalGroups.get(category.groupId);
      if (group) {
        group.categoriesInfo.push({
          id: Number(category.id),
        });
      }
    });

    markers.forEach((marker) => {
      currentMarkerId = Math.max(currentMarkerId, marker.id);
      globalMarkers.set(Number(marker.id), marker);
    });

    localEditedMarkers.forEach((marker) => {
      globalMarkers.set(Number(marker.id), marker);
    });

    localDeletedMarkers.forEach((markerId) => {
      globalMarkers.delete(markerId);
    });

    globalMarkers.forEach((marker) => {
      const category = globalCategories.get(marker.categoryId);
      if (category) {
        if (marker.ignore) {
          category.ignoredMarkers.add(Number(marker.id));
        }
        category.markersId.add(Number(marker.id));
      }
    });

    nextMarkerId = currentMarkerId + 1;
  } catch (error) {
    console.error("加载数据失败:", error);
  }
}

// localEditedMarkers存储函数
function saveEditedMarkersToStorage() {
  try {
    const markersArray = Array.from(localEditedMarkers.entries());
    localStorage.setItem("localEditedMarkers", JSON.stringify(markersArray));
    console.log("保存编辑记录成功");
  } catch (error) {
    console.error("保存编辑记录失败:", error);
  }
}

// 在页面加载时恢复数据
function loadEditedMarkersFromStorage() {
  try {
    const stored = localStorage.getItem("localEditedMarkers");
    if (stored) {
      const markersArray = JSON.parse(stored);
      localEditedMarkers = new Map(markersArray);
    }
  } catch (error) {
    console.error("读取编辑记录失败:", error);
  }
}

// localDeletedMarkers存储函数
function saveDeletedMarkersToStorage() {
  try {
    const deletedArray = Array.from(localDeletedMarkers);
    localStorage.setItem("localDeletedMarkers", JSON.stringify(deletedArray));
  } catch (error) {
    console.error("保存删除记录失败:", error);
  }
}

function loadDeletedMarkersFromStorage() {
  try {
    const stored = localStorage.getItem("localDeletedMarkers");
    if (stored) {
      const deletedArray = JSON.parse(stored);
      localDeletedMarkers = new Set(deletedArray);
    }
  } catch (error) {
    console.error("读取删除记录失败:", error);
  }
}

function ClearLocalStorageMarkers() {
  localStorage.removeItem("localEditedMarkers");
  localStorage.removeItem("localDeletedMarkers");
  location.reload();
}

// 添加保存数据函数
function DownloadMarkersData() {
  // 将 Map 转换为数组
  const markersArray = Array.from(globalMarkers.values());

  // 创建 Blob
  const blob = new Blob([JSON.stringify(markersArray, null, 2)], {
    type: "application/json",
  });

  // 创建下载链接
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "markers.json";

  // 触发下载
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function DownloadLocalStorageMarkers() {
  // 将 Map 转换为数组
  const markersArray = {
    localEditedMarkers: Array.from(localEditedMarkers.entries()),
    localDeletedMarkers: Array.from(localDeletedMarkers),
  };

  // 创建 Blob
  const blob = new Blob([JSON.stringify(markersArray, null, 2)], {
    type: "application/json",
  });

  // 创建下载链接
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "localStorageMarkers.json";

  // 触发下载
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function UploadLocalStorageMarkers() {
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

    if (data.localEditedMarkers) {
      localEditedMarkers = new Map(data.localEditedMarkers);
    }

    if (data.localDeletedMarkers) {
      localDeletedMarkers = new Set(data.localDeletedMarkers);
    }

    saveEditedMarkersToStorage();
    saveDeletedMarkersToStorage();
    location.reload();
  };
  input.click();
}