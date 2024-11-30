let developmentMode = false;

let filterPanel = {
  element: null,
  mobilePopupAtiveBtn: null,
  // 创建 filter-panel
  render: async function () {
    try {
      await loadBackgroundImage("./assets/backgrounds/shenhu.jpg");

      // 创建 filter-panel
      const filterPanel = document.createElement("div");
      filterPanel.className = "filter-panel";
      filterPanel.style.visibility = "hidden"; // 先隐藏
      this.filterPanel = filterPanel;

      filterPanel.appendChild(this.sider.render());
      filterPanel.appendChild(this.icon.render());
      filterPanel.appendChild(this.content.render());

      document.querySelector(".map-container").appendChild(filterPanel);

      this.sider.foldBtn.element.addEventListener("click", () => {
        filterPanel.classList.toggle("filter-panel--hidden");
        this.icon.toggle();

        this.sider.foldBtn.toggle();
        this.sider.locationBtn.element.toggleFolded();
        this.sider.personalDataBtn.element.toggleFolded();
        this.sider.developmentBtn.element.toggleFolded();

        if (
          resourceControl.isMobile() &&
          this.sider.mobileFilterFoldBtn.element !== null
        ) {
          this.sider.mobileFilterFoldBtn.element.container.classList.toggle(
            "filter-panel-sider-mobile-btn-active"
          );
        }
      });

      this.content.header.allShowBtn.element.addEventListener("click", () => {
        this.content.body.showAllCategories();

        // 显示所有图层
        for (const categoryId of allDatas.categories.keys()) {
          toggleCategoryLayer(categoryId, true);
        }
      });

      this.content.header.allHiddenBtn.element.addEventListener("click", () => {
        this.content.body.hideAllCategories();

        // 隐藏所有图层
        for (const categoryId of allDatas.categories.keys()) {
          toggleCategoryLayer(categoryId, false);
        }
      });

      this.content.footer.trackBtn.checkbox.addEventListener("change", (e) => {
        const activeCategories = document.querySelectorAll(
          ".filter-panel-categories"
        );
        activeCategories.forEach((category) => {
          if (e.target.checked) {
            category.classList.add("active");
          } else {
            category.classList.remove("active");
          }
        });
        for (const categoryId of allDatas.categories.keys()) {
          UpdateCategoryCountShow(categoryId);
        }
      });

      this.content.footer.developBtn.onclick(() => {
        this.sider.developmentBtn.toggleDevelopMode();
        developmentMode = !developmentMode;
        markerPopup.setEditBtnState();
      });

      if (resourceControl.isMobile()) {
        this.sider.foldBtn.element.click();
        this.sider.mobileFilterFoldBtn.element.container.classList.toggle(
          "filter-panel-sider-mobile-btn-active"
        );
        this.sider.mobileFilterFoldBtn.element.container.addEventListener(
          "click",
          () => {
            this.sider.foldBtn.element.click();
          }
        );
        this.sider.personalDataBtn.element.container.addEventListener(
          "click",
          () => {
            if (this.mobilePopupAtiveBtn !== null) {
              this.mobilePopupAtiveBtn.classList.remove(
                "filter-panel-sider-mobile-popup-btn-active"
              );
            }
            if (
              this.mobilePopupAtiveBtn ===
              this.sider.personalDataBtn.element.container
            ) {
              this.mobilePopupAtiveBtn = null;
              return;
            } else {
              this.sider.personalDataBtn.element.container.classList.toggle(
                "filter-panel-sider-mobile-popup-btn-active"
              );
              this.mobilePopupAtiveBtn =
                this.sider.personalDataBtn.element.container;
            }
          }
        );

        this.sider.locationBtn.element.container.addEventListener(
          "click",
          () => {
            if (this.mobilePopupAtiveBtn !== null) {
              this.mobilePopupAtiveBtn.classList.remove(
                "filter-panel-sider-mobile-popup-btn-active"
              );
            }
            if (
              this.mobilePopupAtiveBtn ===
              this.sider.locationBtn.element.container
            ) {
              this.mobilePopupAtiveBtn = null;
              return;
            } else {
              this.sider.locationBtn.element.container.classList.toggle(
                "filter-panel-sider-mobile-popup-btn-active"
              );
              this.mobilePopupAtiveBtn =
                this.sider.locationBtn.element.container;
            }
          }
        );

        this.sider.developmentBtn.element.container.addEventListener(
          "click",
          () => {
            if (this.mobilePopupAtiveBtn !== null) {
              this.mobilePopupAtiveBtn.classList.remove(
                "filter-panel-sider-mobile-popup-btn-active"
              );
            }
            if (
              this.mobilePopupAtiveBtn ===
              this.sider.developmentBtn.element.container
            ) {
              this.mobilePopupAtiveBtn = null;
              return;
            } else {
              this.sider.developmentBtn.element.container.classList.toggle(
                "filter-panel-sider-mobile-popup-btn-active"
              );
              this.mobilePopupAtiveBtn =
                this.sider.developmentBtn.element.container;
            }
          }
        );
      }

      filterPanel.style.visibility = "visible";
    } catch (error) {
      console.error("加载面板失败:", error);
    }
  },

  sider: {
    dom: null,
    render: function () {
      // 创建 filter-panel-sider
      const filterPanelSider = document.createElement("div");
      filterPanelSider.className = "filter-panel-sider";

      filterPanelSider.appendChild(this.foldBtn.render());
      if (resourceControl.isMobile()) {
        filterPanelSider.appendChild(this.mobileFilterFoldBtn.render());
      }
      filterPanelSider.appendChild(this.personalDataBtn.render());
      filterPanelSider.appendChild(this.locationBtn.render());
      filterPanelSider.appendChild(this.developmentBtn.render());
      this.dom = filterPanelSider;

      return filterPanelSider;
    },

    mobileFilterFoldBtn: {
      element: null,
      render: function () {
        const btn = new SiderBtn("filter");
        this.element = btn;
        btn.container.classList.add("filter-panel-sider-mobile-filter");
        return btn.container;
      },
    },

    foldBtn: {
      element: null,
      render: function () {
        this.element = document.createElement("div");
        this.element.className = "filter-panel__fold";

        // 创建 filter-panel__fold-icon
        const filterPanelFoldIcon = document.createElement("div");
        filterPanelFoldIcon.className = "filter-panel__fold-icon";
        this.element.appendChild(filterPanelFoldIcon);
        return this.element;
      },

      toggle: function () {
        this.element.classList.toggle("filter-panel__fold--active");
      },
    },

    locationBtn: {
      element: null,
      render: function () {
        const btn = new SiderBtn("location");
        btn.addPopup("快速定位");
        allDatas.quickPositions.defaultData.forEach((location) => {
          btn.addListItem(location.text, () => {
            map.flyTo({
              center: [location.lng, location.lat],
              zoom: location.zoom,
              duration: 1500, // 飞行时间(毫秒)
              curve: 1.1, // 飞行曲线
            });
          });
        });

        this.element = btn;

        allDatas.quickPositions.personalData.forEach((location) => {
          this.addLocation(location);
        });
        return btn.container;
      },

      addLocation: function (location) {
        const newItem = this.element.addListItem(location.text, () => {
          map.flyTo({
            center: [location.lng, location.lat],
            zoom: location.zoom,
            duration: 2000, // 飞行时间(毫秒)
          });
        });

        newItem.dataset.locationId = location.id;

        // 添加右键事件监听, 删除快速定位
        newItem.addEventListener("contextmenu", (e) => {
          e.preventDefault(); // 阻止默认右键菜单

          // 创建遮罩层
          const overlay = document.createElement("div");
          overlay.className = "quick-position-form-overlay";

          // 创建表单容器
          const container = document.createElement("div");
          container.className = "quick-position-form-container";

          // 创建标题
          const title = document.createElement("div");
          title.innerHTML = `删除快速定位: ${location.text}`;
          title.className = "quick-position-form-title";
          container.appendChild(title);

          // 创建按钮容器
          const buttonContainer = document.createElement("div");
          buttonContainer.className = "quick-position-form-buttons";

          // 创建取消按钮
          const cancelButton = document.createElement("button");
          cancelButton.textContent = "取消";
          cancelButton.className = "cancel-btn";
          cancelButton.onclick = () => {
            overlay.remove();
          };
          buttonContainer.appendChild(cancelButton);

          // 创建保存按钮
          const saveButton = document.createElement("button");
          saveButton.textContent = "删除";
          saveButton.className = "save-btn";
          saveButton.onclick = () => {
            const locationId = parseInt(newItem.dataset.locationId);
            allDatas.quickPositions.delete(locationId);
            newItem.remove();
            overlay.remove();
          };
          buttonContainer.appendChild(saveButton);

          container.appendChild(buttonContainer);
          overlay.appendChild(container);
          document.getElementById("root").appendChild(overlay);
        });
      },
    },

    personalDataBtn: {
      element: null,
      render: function () {
        const btn = new SiderBtn("user");
        btn.addPopup("个人数据操作");
        btn.addListItem(
          "下载个人数据",
          allDatas.downloadPersonalData.bind(allDatas)
        );
        btn.addListItem(
          "导入个人数据",
          allDatas.uploadPersonalData.bind(allDatas)
        );
        btn.addListItem("重置进度", () =>
          showConfirmation(
            "确定要重置当前区域所有进度吗？",
            allDatas.ignoreMarkers.clear.bind(allDatas.ignoreMarkers)
          )
        );
        btn.addListItem("清理自定义标记", () =>
          showConfirmation(
            "确定要清理当前区域所有自定义标记吗？",
            allDatas.personalMarkers.clear.bind(allDatas.personalMarkers)
          )
        );
        btn.addListItem("清理个人快速定位", () =>
          showConfirmation(
            "确定要清理当前区域所有个人快速定位吗？",
            allDatas.quickPositions.clear.bind(allDatas.quickPositions)
          )
        );
        this.element = btn;
        return btn.container;
      },
    },

    developmentBtn: {
      element: null,
      render: function () {
        const btn = new SiderBtn("development");
        btn.addPopup("开发者功能");
        btn.addListItem(
          "下载完整位置数据",
          allDatas.downloadServerMrkers.bind(allDatas)
        );
        btn.addListItem(
          "导出新增坐标数据",
          allDatas.downloadNewAddMarkers.bind(allDatas)
        );
        btn.addListItem(
          "覆盖新增坐标数据",
          allDatas.uploadNewAddMarkers.bind(allDatas)
        );
        btn.addListItem("清理所有修改", () =>
          showConfirmation(
            "确定要清理当前区域所有修改(不含自定义)吗？",
            allDatas.clearDevelopMarkers.bind(allDatas)
          )
        );
        this.element = btn;
        this.toggleDevelopMode();
        return btn.container;
      },

      toggleDevelopMode: function () {
        this.element.container.classList.toggle("develop-inactive");
      },
    },
  },

  icon: {
    render: function () {
      // 创建 filter-panel__icon
      const filterPanelIcon = document.createElement("div");
      filterPanelIcon.className = "filter-panel-icon";
      this.container = filterPanelIcon;
      return filterPanelIcon;
    },

    toggle: function () {
      this.container.classList.toggle("filter-panel-icon--active");
    },
  },

  content: {
    render: function () {
      // 创建 filter-panel__content
      const filterPanelContent = document.createElement("div");
      filterPanelContent.className = "filter-panel-content";

      // 组装 DOM 结构
      filterPanelContent.appendChild(this.header.render());
      filterPanelContent.appendChild(this.body.render());
      filterPanelContent.appendChild(this.footer.render());
      return filterPanelContent;
    },

    header: {
      render: function () {
        const filterPanelHeader = document.createElement("div");
        filterPanelHeader.className = "filter-panel-header";

        const filterPanelHeaderImg = document.createElement("div");
        filterPanelHeaderImg.className = "filter-panel-header-img";
        filterPanelHeader.appendChild(filterPanelHeaderImg);

        const filterPanelHeaderToolBar = document.createElement("div");
        filterPanelHeaderToolBar.className = "filter-panel-header-toolbar";

        filterPanelHeaderToolBar.appendChild(this.allShowBtn.render());
        filterPanelHeaderToolBar.appendChild(this.allHiddenBtn.render());
        filterPanelHeader.appendChild(filterPanelHeaderToolBar);
        return filterPanelHeader;
      },

      allShowBtn: {
        element: null,
        render: function () {
          this.element = document.createElement("span");
          this.element.className = "filter-panel-header-toolbar-btn";
          this.element.textContent = "显示全部";
          return this.element;
        },
      },

      allHiddenBtn: {
        element: null,
        render: function () {
          this.element = document.createElement("span");
          this.element.className = "filter-panel-header-toolbar-btn";
          this.element.textContent = "隐藏全部";
          return this.element;
        },
      },
    },

    body: {
      categoriesContainer: new Map(),
      categoriesList: [],
      groupsList: [],

      render: function () {
        // 创建 filter-panel__body
        const filterPanelBody = document.createElement("div");
        filterPanelBody.className = "filter-panel-body";

        const bodyContainer = document.createElement("div");
        bodyContainer.className = "filter-panel-groups";

        for (const group of allDatas.groups.values()) {
          this.categoriesContainer.set(group.id, []); // 初始化空数组
          const groupDiv = document.createElement("div");
          groupDiv.className = "filter-panel-group";

          // 添加分组标题
          const groupTitle = document.createElement("div");
          groupTitle.className = "filter-panel-group-title";
          groupTitle.textContent = group.title;
          groupTitle.dataset.groupId = group.id;
          groupDiv.appendChild(groupTitle);

          // 添加该分组下的类别
          const categoryList = document.createElement("div");
          categoryList.className = "filter-panel-categories";

          group.categoriesInfo.forEach((categoryId) => {
            const category = allDatas.categories.get(categoryId);
            const categoryDiv = document.createElement("div");
            categoryDiv.className = "filter-panel-category";
            categoryDiv.id = `category-${category.id}`;
            categoryDiv.classList.toggle("active");
            categoryDiv.dataset.categoryId = category.id;

            // 添加点击事件
            categoryDiv.addEventListener("click", () => {
              categoryDiv.classList.toggle("active");
              const isActive = categoryDiv.classList.contains("active");

              toggleCategoryLayer(category.id, isActive);
            });

            // 添加图标
            const icon = document.createElement("img");
            icon.src = `./assets/icons/markers/${category.icon}.png`;
            icon.className = "filter-panel-category-icon";

            // 添加标题
            const title = document.createElement("span");
            title.className = "filter-panel-category-title";
            title.textContent = category.title;

            // 创建右侧数量显示
            const count = document.createElement("span");
            count.id = `category-count-${category.id}`;
            count.className = "filter-panel-category-count";
            count.textContent = category.markersId.size;

            categoryDiv.appendChild(icon);
            categoryDiv.appendChild(title);
            categoryDiv.appendChild(count);

            categoryList.appendChild(categoryDiv);
            this.categoriesList.push(categoryDiv);
            this.categoriesContainer.get(group.id).push(categoryDiv);
          });

          groupTitle.addEventListener("click", () => {
            const categoryList = this.categoriesContainer.get(group.id);
            const isActive = categoryList.every((category) =>
              category.classList.contains("active")
            );

            categoryList.forEach((category) => {
              category.classList.toggle("active", !isActive);
              toggleCategoryLayer(category.dataset.categoryId, !isActive);
            });
          });

          this.groupsList.push(groupTitle);
          groupDiv.appendChild(categoryList);
          bodyContainer.appendChild(groupDiv);
        }

        // 添加右键事件监听
        this.groupsList.forEach((group) => {
          group.addEventListener("contextmenu", (e) => {
            e.preventDefault(); // 阻止默认右键菜单

            const groupId = parseInt(group.dataset.groupId);

            // 遍历所有 category
            this.categoriesContainer.forEach((categories, id) => {
              if (id === groupId) {
                // 当前分组设为激活
                categories.forEach((category) => {
                  category.classList.add("active");
                  toggleCategoryLayer(category.dataset.categoryId, true);
                });
              } else {
                // 其他分组设为非激活
                categories.forEach((category) => {
                  category.classList.remove("active");
                  toggleCategoryLayer(category.dataset.categoryId, false);
                });
              }
            });
          });
        });

        this.categoriesList.forEach((category) => {
          // 添加右键事件监听
          category.addEventListener("contextmenu", (e) => {
            e.preventDefault(); // 阻止默认右键菜单

            const currentCategoryId = parseInt(category.dataset.categoryId);

            // 遍历所有 category
            this.categoriesList.forEach((cat) => {
              const catId = parseInt(cat.dataset.categoryId);

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
        });

        filterPanelBody.appendChild(bodyContainer);
        return filterPanelBody;
      },

      showAllCategories: function () {
        this.categoriesList.forEach((category) => {
          category.classList.add("active");
        });
      },

      hideAllCategories: function () {
        this.categoriesList.forEach((category) => {
          category.classList.remove("active");
        });
      },
    },

    footer: {
      render: function () {
        // 创建 filter-panel-footer
        const filterPanelFooter = document.createElement("div");
        filterPanelFooter.className = "filter-panel-footer";

        // 创建左侧按钮容器
        const footerLeftButtons = document.createElement("div");
        footerLeftButtons.className = "filter-panel-footer-left";

        footerLeftButtons.appendChild(this.trackBtn.render());
        footerLeftButtons.appendChild(this.hideIgnoreMarkerBtn.render());

        filterPanelFooter.appendChild(footerLeftButtons);
        filterPanelFooter.appendChild(this.developBtn.render());

        return filterPanelFooter;
      },

      trackBtn: {
        checkbox: null,
        render: function () {
          const element = document.createElement("label");
          element.className = "filter-footer-control";

          // 创建 checkbox
          this.checkbox = document.createElement("input");
          this.checkbox.type = "checkbox";
          this.checkbox.className = "filter-footer-control-checkbox";

          // 创建文本
          const textSpan = document.createElement("span");
          textSpan.textContent = "追踪进度";

          element.appendChild(this.checkbox);
          element.appendChild(textSpan);
          return element;
        },

        isChecked: function () {
          return this.checkbox.checked;
        },
      },

      hideIgnoreMarkerBtn: {
        checkbox: null,
        render: function () {
          // 创建容器
          const element = document.createElement("label");
          element.className = "filter-footer-control";

          // 创建 checkbox
          this.checkbox = document.createElement("input");
          this.checkbox.type = "checkbox";
          this.checkbox.className = "filter-footer-control-checkbox";

          const textSpan = document.createElement("span");
          textSpan.textContent = "隐藏已找到的坐标";

          element.appendChild(this.checkbox);
          element.appendChild(textSpan);

          // 添加切换事件
          this.checkbox.addEventListener("change", (e) => {
            if (e.target.checked) {
              hiddenIgnoredMarkers();
            } else {
              showIgnoredMarkers();
            }
          });
          return element;
        },
      },

      developBtn: {
        element: null,
        render: function () {
          const element = document.createElement("div");
          element.className = "filter-footer-develop-btn";
          element.title = "开发模式"; // 添加提示文本
          this.element = element;
          return element;
        },

        onclick: function (callback) {
          this.element.onclick = callback;
        },
      },
    },
  },
};

function loadBackgroundImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("背景图片加载失败"));
  });
}

function UpdateCategoryCountShow(categoryId, onlyChangeIgnore = false) {
  const countElement = document.getElementById(`category-count-${categoryId}`);
  const categoryElement = document.getElementById(`category-${categoryId}`);
  const category = allDatas.categories.get(categoryId);

  if (filterPanel.content.footer.trackBtn.isChecked()) {
    const totalCount = category.markersId.size;
    const ignoredCount = allDatas.ignoreMarkers.data.get(categoryId)?.size || 0;
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

class SiderBtn {
  constructor(iconImgSrc) {
    this.container = document.createElement("div");
    this.container.className = "filter-sider-container";

    // 创建 icon
    const icon = document.createElement("div");
    icon.className = "filter-sider-icon";
    const iconImg = document.createElement("img");
    iconImg.src = `./assets/icons/${iconImgSrc}.png`;
    iconImg.className = "filter-sider-icon-img";
    icon.appendChild(iconImg);

    this.container.appendChild(icon);
  }

  addPopup(title) {
    // 创建 popup
    const popup = document.createElement("div");
    popup.className = "filter-sider-popup";

    // 创建 popup-list
    const popupList = document.createElement("div");
    popupList.className = "filter-sider-popup-list";

    // 创建 popup-list-title
    const popupListTitle = document.createElement("h3");
    popupListTitle.className = "filter-sider-popup-list-title";
    popupListTitle.innerHTML = `${title}<br>(${resourceControl.getRegionNameZh()})`;

    // 创建 popup-list-item-container
    this.popupListItemContainer = document.createElement("div");
    this.popupListItemContainer.className =
      "filter-sider-popup-list-item-container";

    // 组装 DOM 结构
    popupList.appendChild(popupListTitle);
    popupList.appendChild(this.popupListItemContainer);
    popup.appendChild(popupList);
    this.container.appendChild(popup);
  }

  addListItem(text, callback) {
    const item = document.createElement("div");
    item.className = "filter-sider-popup-list-item";
    item.textContent = text;
    item.onclick = callback;
    this.popupListItemContainer.appendChild(item);
    return item;
  }

  toggleFolded() {
    this.container.classList.toggle("filter-sider-container--folded");
  }
}

function showConfirmation(message, callback) {
  const confirmed = window.confirm(message);
  if (confirmed) {
    callback();
  }
}
