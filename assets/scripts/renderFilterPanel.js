function loadBackgroundImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("背景图片加载失败"));
  });
}

// 渲染面板
async function renderFilterPanel() {
  try {
    await loadBackgroundImage("./assets/icons/nikki.png");

    // 创建 filter-panel
    const filterPanel = document.createElement("div");
    filterPanel.className = "filter-panel";
    filterPanel.style.visibility = "hidden"; // 先隐藏

    // 创建 filter-panel-sider
    const filterPanelSider = document.createElement("div");
    filterPanelSider.className = "filter-panel-sider";

    const filterFoldBtn = renderFilterFoldBtn();
    const filterLocationBtn = renderFilterLocationBtn();
    filterPanelSider.appendChild(filterFoldBtn);
    filterPanelSider.appendChild(filterLocationBtn);
    filterPanel.appendChild(filterPanelSider);

    // 创建 filter-panel__content
    const filterPanelContent = document.createElement("div");
    filterPanelContent.className = "filter-panel__content";

    // 创建 filter-panel__icon
    const filterPanelIcon = document.createElement("img");
    filterPanelIcon.src = "./assets/icons/nikki.png";
    filterPanelIcon.className = "filter-panel__icon";

    // 创建 filter-panel__header
    const filterPanelHeader = document.createElement("div");
    filterPanelHeader.className = "filter-panel__header";

    // 创建 filter-panel__body
    const filterPanelBody = document.createElement("div");
    filterPanelBody.className = "filter-panel__body";

    // 创建 filter-panel__footer
    const filterPanelFooter = document.createElement("div");
    filterPanelFooter.className = "filter-panel__footer";

    const filterPanelHeaderImg = document.createElement("div");
    filterPanelHeaderImg.className = "filter-panel__header__img";
    filterPanelHeader.appendChild(filterPanelHeaderImg);

    const filterPanelHeaderToolBar = document.createElement("div");
    filterPanelHeaderToolBar.className = "filter-panel__header__toolbar";

    const allShowBtn = document.createElement("span");
    allShowBtn.className = "filter-panel__header__toolbar_btn";
    allShowBtn.textContent = "显示全部";
    allShowBtn.addEventListener("click", () => {
      const activeCategories = document.querySelectorAll(".filter-category");

      // 移除所有active类
      activeCategories.forEach((category) => {
        category.classList.add("active");
      });

      // 显示所有图层
      for (const [categoryId] of globalCategories) {
        toggleCategoryLayer(categoryId, true);
      }
    });

    const allHiddenBtn = document.createElement("span");
    allHiddenBtn.className = "filter-panel__header__toolbar_btn";
    allHiddenBtn.textContent = "隐藏全部";
    allHiddenBtn.addEventListener("click", () => {
      const activeCategories = document.querySelectorAll(".filter-category");

      // 移除所有active类
      activeCategories.forEach((category) => {
        category.classList.remove("active");
      });

      // 隐藏所有图层
      for (const [categoryId] of globalCategories) {
        toggleCategoryLayer(categoryId, false);
      }
    });

    filterPanelHeaderToolBar.appendChild(allShowBtn);
    filterPanelHeaderToolBar.appendChild(allHiddenBtn);
    filterPanelHeader.appendChild(filterPanelHeaderToolBar);

    const bodyContainer = document.createElement("div");
    bodyContainer.className = "filter-groups";

    for (const group of globalGroups.values()) {
      const groupDiv = document.createElement("div");
      groupDiv.className = "filter-group";

      // 添加分组标题
      const groupTitle = document.createElement("div");
      groupTitle.className = "filter-group__title";
      groupTitle.textContent = group.title;
      groupDiv.appendChild(groupTitle);

      // 添加该分组下的类别
      const categoryList = document.createElement("div");
      categoryList.className = "filter-group__categories";

      group.categoriesInfo.forEach((categoryInfo) => {
        const category = globalCategories.get(categoryInfo.id);
        const categoryDiv = document.createElement("div");
        categoryDiv.className = "filter-category";
        categoryDiv.id = `category-${category.id}`;
        categoryDiv.classList.toggle("active");
        categoryDiv.dataset.categoryId = category.id;

        // 添加点击事件
        categoryDiv.addEventListener("click", () => {
          categoryDiv.classList.toggle("active");
          const isActive = categoryDiv.classList.contains("active");

          toggleCategoryLayer(category.id, isActive);
        });

        // 添加右键事件监听
        categoryDiv.addEventListener("contextmenu", (e) => {
          e.preventDefault(); // 阻止默认右键菜单

          // 获取所有 category 元素
          const allCategories = document.querySelectorAll(".filter-category");
          const currentCategoryId = Number(categoryDiv.dataset.categoryId);

          // 遍历所有 category
          allCategories.forEach((cat) => {
            const catId = Number(cat.dataset.categoryId);

            if (catId === currentCategoryId) {
              // 当前分类设为激活
              cat.classList.add("active");
              toggleCategoryLayer(catId, true);
            } else {
              // 其他分类设为非激活
              cat.classList.remove("active");
              toggleCategoryLayer(catId, false);
            }
          });
        });

        // 添加图标
        const icon = document.createElement("img");
        icon.src = `./assets/icons/markers/${category.icon}.png`;
        icon.className = "filter-category__icon";

        // 添加标题
        const title = document.createElement("span");
        title.className = "filter-category__title";
        title.textContent = category.title;

        // 创建右侧数量显示
        const count = document.createElement("span");
        count.id = `category-count-${category.id}`;
        count.className = "filter-category__count";
        count.textContent = category.markersId.size;

        categoryDiv.appendChild(icon);
        categoryDiv.appendChild(title);
        categoryDiv.appendChild(count);

        categoryList.appendChild(categoryDiv);
      });

      groupDiv.appendChild(categoryList);
      bodyContainer.appendChild(groupDiv);
    }

    filterPanelBody.appendChild(bodyContainer);

    const footerContainer = document.createElement("div");
    footerContainer.className = "filter-footer-container";

    // 创建左侧按钮容器
    const footerLeftButtons = document.createElement("div");
    footerLeftButtons.className = "filter-footer-left";

    // 创建容器
    const ignoreControl = document.createElement("label");
    ignoreControl.className = "filter-footer-ignore-control";

    // 创建 checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "filter-footer-ignore-checkbox";

    const textSpan = document.createElement("span");
    textSpan.textContent = "隐藏已找到的坐标";

    ignoreControl.appendChild(checkbox);
    ignoreControl.appendChild(textSpan);

    // 添加切换事件
    checkbox.addEventListener("change", (e) => {
      if (e.target.checked) {
        hiddenIgnoredMarkers();
      } else {
        showIgnoredMarkers();
      }
    });

    // 创建第二个控制组
    const showAllControl = document.createElement("label");
    showAllControl.className = "filter-footer-ignore-control";

    // 创建 checkbox
    const showAllCheckbox = document.createElement("input");
    showAllCheckbox.type = "checkbox";
    showAllCheckbox.className = "filter-footer-ignore-checkbox";
    showAllCheckbox.id = "process-track-mode-checkbox";

    // 创建文本
    const showAllText = document.createElement("span");
    showAllText.textContent = "追踪进度";

    showAllControl.appendChild(showAllCheckbox);
    showAllControl.appendChild(showAllText);

    // 添加切换事件
    showAllCheckbox.addEventListener("change", (e) => {
      const activeCategories = document.querySelectorAll(
        ".filter-group__categories"
      );
      activeCategories.forEach((category) => {
        if (e.target.checked) {
          category.classList.add("active");
        } else {
          category.classList.remove("active");
        }
      });
      for (const categoryId of globalCategories.keys()) {
        updateCategoryCountShow(categoryId);
      }
    });

    footerLeftButtons.appendChild(showAllControl);
    footerLeftButtons.appendChild(ignoreControl);

    const saveButton = document.createElement("div");
    saveButton.className = "save-markers-btn";
    saveButton.onclick = saveMarkersData;

    footerContainer.appendChild(footerLeftButtons);
    footerContainer.appendChild(saveButton);

    filterPanelFooter.appendChild(footerContainer);

    // 组装 DOM 结构
    filterPanelContent.appendChild(filterPanelIcon);
    filterPanelContent.appendChild(filterPanelHeader);
    filterPanelContent.appendChild(filterPanelBody);
    filterPanelContent.appendChild(filterPanelFooter);

    filterPanel.appendChild(filterPanelContent);

    filterFoldBtn.addEventListener("click", () => {
      filterFoldBtn.classList.toggle("filter-panel__fold--active");
      // 切换panel的class
      filterPanel.classList.toggle("filter-panel--hidden");

      filterPanelIcon.classList.toggle("filter-panel__icon--active");
      filterLocationBtn.classList.toggle("filter-location--folded");
    });

    document.querySelector(".map-container").appendChild(filterPanel);
    filterPanel.style.visibility = "visible";
  } catch (error) {
    console.error("加载面板失败:", error);
  }
}

function toggleCategoryLayer(categoryId, visible) {
  const visibility = visible ? "visible" : "none";
  map.setLayoutProperty(
    `category-layer-${categoryId}`,
    "visibility",
    visibility
  );
}

function renderFilterLocationBtn() {
  // 创建 filter-location-container
  const filterLocationContainer = document.createElement("div");
  filterLocationContainer.className = "filter-location-container";

  // 创建 filter-location-icon
  const filterLocationIcon = document.createElement("div");
  filterLocationIcon.className = "filter-location-icon";
  const filterLocationIconImg = document.createElement("img");
  filterLocationIconImg.src = "./assets/icons/location.png";
  filterLocationIconImg.className = "filter-location-icon-img";
  filterLocationIcon.appendChild(filterLocationIconImg);

  // 创建 filter-location-popup
  const filterLocationPopup = document.createElement("div");
  filterLocationPopup.className = "filter-location-popup";

  // 创建 filter-location-list
  const filterLocationList = document.createElement("div");
  filterLocationList.className = "filter-location-list";

  // 创建 filter-location-list-title
  const filterLocationListTitle = document.createElement("h3");
  filterLocationListTitle.className = "filter-location-list-title";
  filterLocationListTitle.textContent = "快速定位";

  // 创建 filter-location-list-container
  const filterLocationListContainer = document.createElement("div");
  filterLocationListContainer.className = "filter-location-list-container";

  // 创建 filter-location-list-item
  globalQuickPositions.forEach((location) => {
    const item = document.createElement("div");
    item.className = "filter-location-list-item";
    item.dataset.lat = location.lat;
    item.dataset.lng = location.lng;
    item.dataset.zoom = location.zoom;
    item.textContent = location.text;

    item.addEventListener("click", () => {
      const lng = parseFloat(item.dataset.lng);
      const lat = parseFloat(item.dataset.lat);
      const zoom = parseFloat(item.dataset.zoom);
      map.flyTo({
        center: [lng, lat],
        zoom: zoom,
        duration: 2000, // 飞行时间(毫秒)
      });
    });

    filterLocationListContainer.appendChild(item);
  });

  // 组装 DOM 结构
  filterLocationList.appendChild(filterLocationListTitle);
  filterLocationList.appendChild(filterLocationListContainer);
  filterLocationPopup.appendChild(filterLocationList);
  filterLocationContainer.appendChild(filterLocationIcon);
  filterLocationContainer.appendChild(filterLocationPopup);

  return filterLocationContainer;
}

function renderFilterFoldBtn() {
  // 创建 filter-panel__fold
  const filterFoldContainer = document.createElement("div");
  filterFoldContainer.className = "filter-panel__fold";

  // 创建 filter-panel__fold-icon
  const filterPanelFoldIcon = document.createElement("div");
  filterPanelFoldIcon.className = "filter-panel__fold-icon";
  filterFoldContainer.appendChild(filterPanelFoldIcon);
  return filterFoldContainer;
}

function showIgnoredMarkers() {
  globalCategories.forEach((category, categoryId) => {
    // 获取数据源
    const source = map.getSource(`category-${categoryId}`);
    if (source) {
      // 获取当前所有特征 TODO: 测试是否有性能问题和闪烁问题
      //const currentFeatures = [...source._data.features];
      const currentFeatures = source._data.features;

      // 为每个被忽略的标记创建新的特征
      category.ignoredMarkers.forEach((markerId) => {
        const marker = globalMarkers.get(markerId);
        if (marker) {
          currentFeatures.push({
            type: "Feature",
            id: markerId,
            geometry: {
              type: "Point",
              coordinates: [marker.lng, marker.lat],
            },
          });
        }
      });

      // 更新数据源
      source.setData({
        type: "FeatureCollection",
        features: currentFeatures,
      });
    }
  });
}

function hiddenIgnoredMarkers() {
  globalCategories.forEach((category, categoryId) => {
    const oldSource = map.getSource(`category-${categoryId}`);
    if (oldSource) {
      const oldFeatures = oldSource._data.features.filter(
        (feature) => !category.ignoredMarkers.has(feature.id)
      );
      oldSource.setData({
        type: "FeatureCollection",
        features: oldFeatures,
      });
    }
  });
}

// 添加获取状态的函数
function isShowAllChecked() {
  showAllCheckbox = document.getElementById("process-track-mode-checkbox");
  return showAllCheckbox?.checked || false;
}

function updateCategoryCountShow(categoryId, onlyChangeIgnore = false) {
  const countElement = document.getElementById(`category-count-${categoryId}`);
  const categoryElement = document.getElementById(`category-${categoryId}`);
  const category = globalCategories.get(categoryId);

  if (isShowAllChecked()) {
    const totalCount = category.markersId.size;
    const ignoredCount = category.ignoredMarkers.size;
    countElement.textContent = `${ignoredCount} / ${totalCount}`;
    if (totalCount === ignoredCount) {
      categoryElement.style.background = "rgba(62, 138, 73, 0.3)"; // 完成状态背景色
    } else {
      categoryElement.style.background = ""; // 恢复默认背景
    }
  } else if (!onlyChangeIgnore) {
    // 显示总数
    countElement.textContent = category.markersId.size;
    categoryElement.style.background = ""; // 恢复默认背景
  }
}
