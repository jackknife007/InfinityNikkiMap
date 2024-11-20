let contextMenu;
let formOverlay;
let saveBtn;
let deleteBtn;
let addBtn;
let cancelBtn;

function initContextMenu() {
  // 创建菜单元素
  contextMenu = document.createElement("div");
  contextMenu.className = "context-menu";
  contextMenu.innerHTML = '<div class="context-menu-item">添加新标记</div>';
  hideContextMenu();
  document.body.appendChild(contextMenu);

  // 添加点击事件监听
  contextMenu
    .querySelector(".context-menu-item")
    .addEventListener("click", () => {
      hideContextMenu();
      showEditMarkerForm(0, "add");
    });
  return contextMenu;
}

map.on("contextmenu", (e) => {
  e.preventDefault();

  // 查询点击位置的所有图层要素
  const features = map.queryRenderedFeatures(e.point);

  // 检查是否点击在自定义图层上
  const isOnCustomLayer = features.some((feature) =>
    feature.layer.id.startsWith("category-layer-")
  );

  // 如果不在自定义图层上，显示菜单
  if (!isOnCustomLayer) {
    contextMenu.dataset.lng = e.lngLat.lng.toFixed(4);
    contextMenu.dataset.lat = e.lngLat.lat.toFixed(4);
    //console.log(contextMenu.dataset.lng, contextMenu.dataset.lat);
    contextMenu.style.left = `${e.point.x}px`;
    contextMenu.style.top = `${e.point.y}px`;
    contextMenu.style.visibility = "visible";

    // 添加全局点击事件关闭菜单
    document.addEventListener("click", closeMenu);
  }
});

// 点击其他地方关闭菜单
const closeMenu = (e) => {
  if (!contextMenu.contains(e.target)) {
    hideContextMenu();
    document.removeEventListener("click", closeMenu);
  }
};

function hideContextMenu() {
  contextMenu.style.visibility = "hidden";
}

function createEditForm() {
  // 创建外层容器
  const formOverlayConst = document.createElement("div");
  formOverlayConst.id = "edit-form-overlay";

  // 创建表单容器
  const editForm = document.createElement("div");
  editForm.className = "edit-form";

  // 创建标题
  const title = document.createElement("h3");
  title.textContent = "编辑坐标点";
  editForm.appendChild(title);

  // 创建表单元素
  const inputs = [
    { id: "edit-name", type: "text", placeholder: "名称" },
    { id: "edit-category", type: "select" },
    { id: "edit-description", type: "textarea", placeholder: "描述" },
    { id: "edit-image", type: "text", placeholder: "图片链接" },
    { id: "edit-video", type: "text", placeholder: "视频链接" },
    { id: "edit-author", type: "text", placeholder: "作者" },
    { id: "edit-author-link", type: "text", placeholder: "作者链接" },
  ];

  // 生成表单元素
  inputs.forEach((input) => {
    let element;
    if (input.type === "textarea") {
      element = document.createElement("textarea");
    } else if (input.type === "select") {
      element = document.createElement("select");
    } else {
      element = document.createElement("input");
      element.type = input.type;
    }
    element.id = input.id;
    element.placeholder = input.placeholder;
    editForm.appendChild(element);
  });

  // 创建按钮容器
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "edit-form-buttons";

  // 创建按钮
  const buttons = [
    { className: "delete-btn", text: "删除" },
    { className: "cancel-btn", text: "取消" },
    { className: "save-btn", text: "保存" },
    { className: "add-btn", text: "新建" },
  ];

  buttons.forEach((btn) => {
    const button = document.createElement("button");
    button.className = btn.className;
    button.textContent = btn.text;
    buttonContainer.appendChild(button);
  });

  // 组装表单

  editForm.appendChild(buttonContainer);
  formOverlayConst.appendChild(editForm);

  saveBtn = formOverlayConst.querySelector(".save-btn");
  deleteBtn = formOverlayConst.querySelector(".delete-btn");
  addBtn = formOverlayConst.querySelector(".add-btn");
  cancelBtn = formOverlayConst.querySelector(".cancel-btn");

  addBtn.addEventListener("click", () => {
    const newMarker = {
      id: nextMarkerId,
      lng: Number(contextMenu.dataset.lng),
      lat: Number(contextMenu.dataset.lat),
      ...getFormData(),
    };
    nextMarkerId += 1;
    globalMarkers.set(newMarker.id, newMarker);
    addMarkerToCategorySource(newMarker, newMarker.categoryId);
    hideformOverlay();
  });

  saveBtn.addEventListener("click", () => {
    const markerId = Number(formOverlay.dataset.markerId);
    const marker = globalMarkers.get(markerId);
    const updatedMarker = {
      ...marker,
      ...getFormData(),
    };
    globalMarkers.set(markerId, updatedMarker);

    // 如果category发生变化
    if (marker.category !== updatedMarker.categoryId) {
      deleteMarkerFromCategorySource(marker, marker.categoryId);
      addMarkerToCategorySource(updatedMarker, updatedMarker.categoryId);
    }

    hideformOverlay();
  });

  deleteBtn.addEventListener("click", () => {
    const markerId = Number(formOverlay.dataset.markerId);
    const marker = globalMarkers.get(markerId);
    deleteMarkerFromCategorySource(marker, marker.categoryId);
    globalMarkers.delete(markerId);
    hideformOverlay();
  });

  cancelBtn.addEventListener("click", () => {
    hideformOverlay();
  });

  return formOverlayConst;
}

function getFormData() {
  return {
    name: document.getElementById("edit-name").value,
    description: document.getElementById("edit-description").value,
    image: document.getElementById("edit-image").value,
    video: document.getElementById("edit-video").value,
    author: document.getElementById("edit-author").value,
    authorLink: document.getElementById("edit-author-link").value,
    categoryId: Number(document.getElementById("edit-category").value),
    ignore: false,
    updateTime: new Date()
      .toLocaleString("zh-cn", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
      .replace(/\//g, "-"),
  };
}

function hideformOverlay() {
  formOverlay.style.visibility = "hidden";
  console.log(globalMarkers);
}

function addMarkerToCategorySource(marker, categoryId) {
  // 更新新category的数据源
  const newFeature = {
    type: "Feature",
    id: marker.id,
    geometry: {
      type: "Point",
      coordinates: [marker.lng, marker.lat],
    },
  };
  const newSource = map.getSource(`category-${categoryId}`);
  if (newSource) {
    const newFeatures = [...newSource._data.features];
    newFeatures.push(newFeature);
    newSource.setData({
      type: "FeatureCollection",
      features: newFeatures,
    });
  }

  globalCategories.get(categoryId).markersId.add(marker.id);
  updateCategoryCountShow(categoryId);
}

function deleteMarkerFromCategorySource(marker, categoryId) {
  // 更新旧category的数据源
  const oldSource = map.getSource(`category-${categoryId}`);
  if (oldSource) {
    const oldFeatures = oldSource._data.features.filter(
      (f) => f.id !== marker.id
    );
    oldSource.setData({
      type: "FeatureCollection",
      features: oldFeatures,
    });
  }

  globalCategories.get(categoryId).markersId.delete(marker.id);
  globalCategories.get(categoryId).ignoredMarkers.delete(marker.id);
  updateCategoryCountShow(categoryId);
}

function showEditMarkerForm(markerId, typeOfBtn) {
  const marker = globalMarkers.get(markerId);

  formOverlay = document.getElementById("edit-form-overlay");
  const nameElement = document.getElementById("edit-name");
  const descriptionElement = document.getElementById("edit-description");
  const imageElement = document.getElementById("edit-image");
  const videoElement = document.getElementById("edit-video");
  const authorElement = document.getElementById("edit-author");
  const authorLinkElement = document.getElementById("edit-author-link");
  const categoryElement = document.getElementById("edit-category");

  nameElement.value = marker?.name || "";
  descriptionElement.value = marker?.description || "";
  imageElement.value = marker?.image || "";
  videoElement.value = marker?.video || "";
  authorElement.value = marker?.author || "黄大胖不胖";
  authorLinkElement.value =
    marker?.authorLinkElement || "https://space.bilibili.com/619196/";

  categoryElement.value = marker?.categoryId || 26;

  formOverlay.dataset.markerId = marker ? marker.id : nextMarkerId;
  formOverlay.dataset.lng = marker
    ? marker.lng
    : Number(contextMenu.dataset.lng);
  formOverlay.dataset.lat = marker
    ? marker.lat
    : Number(contextMenu.dataset.lat);
  if (typeOfBtn === "edit") {
    saveBtn.style.display = "block";
    deleteBtn.style.display = "block";
    addBtn.style.display = "none";
  } else if (typeOfBtn === "add") {
    saveBtn.style.display = "none";
    deleteBtn.style.display = "none";
    addBtn.style.display = "block";
  } else {
    saveBtn.style.display = "none";
    deleteBtn.style.display = "none";
    addBtn.style.display = "none";
  }

  formOverlay.style.visibility = "visible";
}
