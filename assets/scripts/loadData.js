let globalGroups = new Map();
let globalCategories = new Map();
let globalMarkers = new Map();
let nextMarkerId = 0;
let globalQuickPositions;

async function loadData() {
  try {
    const [groups, categories, markers, qkPos] = await Promise.all([
      fetch("./assets/data/groups.json").then((res) => res.json()),
      fetch("./assets/data/categories.json").then((res) => res.json()),
      fetch("./assets/data/markers.json").then((res) => res.json()),
      fetch("./assets/data/quickPositions.json").then((res) => res.json()),
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

// 添加保存数据函数
function saveMarkersData() {
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
