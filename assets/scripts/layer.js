const btns = [
  {
    id: 0,
    name: "麦浪农场",
    maxLevel: 3,
    coordinates: [-40.48, -12.09],
    areaId: 501,
  },
  {
    id: 1,
    name: "涟漪庄园",
    maxLevel: 3,
    coordinates: [-59.59, -16.83],
    areaId: 502,
  },
  {
    id: 2,
    name: "乘风磨坊",
    maxLevel: 3,
    coordinates: [-83.31, 0.07],
    areaId: 503,
  },
  {
    id: 3,
    name: "欢乐市集",
    maxLevel: 3,
    coordinates: [-59.21, 7.16],
    areaId: 504,
  },
  {
    id: 4,
    name: "呜呜车站",
    maxLevel: 3,
    coordinates: [-36.58, 16.7],
    areaId: 505,
  },
  {
    id: 5,
    name: "星空钓场",
    maxLevel: 3,
    coordinates: [-83.12, 29.56],
    areaId: 506,
  },
  {
    id: 6,
    name: "丰饶古村",
    maxLevel: 3,
    coordinates: [-15, 37.69],
    areaId: 507,
  },
  {
    id: 7,
    name: "石之冠",
    maxLevel: 4,
    coordinates: [-51.33, 38.36],
    areaId: 508,
  },
  {
    id: 8,
    name: "染织工坊旁石树",
    maxLevel: 3,
    coordinates: [-21.04, -14.86],
    areaId: 401,
  },
  {
    id: 9,
    name: "火冠石树",
    maxLevel: 3,
    coordinates: [-5.96, -24.79],
    areaId: 402,
  },
  {
    id: 10,
    name: "千愿巨树",
    maxLevel: 5,
    coordinates: [103.95, 32.87],
    areaId: 601,
  },
];

let layers = {
  render: function () {
    this.initLevelLayers();
    this.sider.render();
  },

  sider: {
    element: null,
    maxLevel: Math.max(...btns.map((l) => l.maxLevel)),
    currentAreaId: null,
    render: function () {
      const container = document.createElement("div");
      container.className = "level-buttons-container";
      container.style.display = "none";
      this.levelButtons.render(container);
      this.resetButton.render(container);
      this.element = container;
      document.querySelector(".map-container").appendChild(container);
    },

    levelButtons: {
      elements: [],
      render: function (container) {
        for (let i = 1; i <= layers.sider.maxLevel; i++) {
          const btn = document.createElement("button");
          btn.className = "level-btn";
          btn.textContent = `${i}`;
          this.elements.push({ btn: btn, level: i });
          container.appendChild(btn);
        }
        for (const { btn, level } of this.elements) {
          btn.onclick = () => {
            // 移除其他按钮的active状态
            this.elements.forEach(({ btn }, _) =>
              btn.classList.remove("active")
            );
            btn.classList.add("active");
            // 设置过滤器
            allDatas.categories.forEach((_, categoryId) => {
              const layerId = `category-layer-${categoryId}`;
              if (map.getLayer(layerId)) {
                map.setFilter(layerId, [
                  "all",
                  ["==", ["get", "areaId"], filterPanel.currentAreaId],
                  ["==", ["get", "level"], level],
                ]);
              }
            });
          };
        }
      },
    },

    resetButton: {
      element: null,
      render: function (container) {
        const resetBtn = document.createElement("button");
        resetBtn.className = "level-btn";
        resetBtn.textContent = "退出";
        resetBtn.onclick = () => {
          map.setLayoutProperty(`level-layer`, "visibility", "visible");
          filterPanel.content.header.allHiddenBtn.element.click();
          layers.sider.back();
        };
        this.element = resetBtn;
        container.appendChild(resetBtn);
      },
    },

    show: function (layerBtnId) {
      this.element.style.display = "flex";
      this.currentAreaId = btns[layerBtnId].areaId;
      for (let i = 0; i < this.maxLevel; i++) {
        if (i < btns[layerBtnId].maxLevel) {
          this.levelButtons.elements[i].btn.style.display = "block";
        } else {
          this.levelButtons.elements[i].btn.style.display = "none";
        }
      }
      this.levelButtons.elements[0].btn.click();
    },

    hide: function () {
      this.element.style.display = "none";
    },

    back: function () {
      if (this.element.style.display === "flex") {
        this.hide();
        filterPanel.content.header.areaSelector.enable();
        const fatherAreaId = this.currentAreaId - (this.currentAreaId % 100);
        const fatherArea = areas.find((a) => a.id === fatherAreaId);
        filterPanel.content.header.areaSelector.setSelected(
          fatherArea.id,
          fatherArea.name
        );
        map.setMaxBounds([
          [-360, -90],
          [360, 90],
        ]);
        layers.filterArea(fatherArea);
        this.currentAreaId = null;
        if (resourceControl.isMobile()) {
          zoomSliderControl.show();
          mapAction.show();
        }
      }
    },
  },

  filterArea: function (area) {
    for (const categoryId of allDatas.categories.keys()) {
      UpdateCategoryCountShow(categoryId);
      if (area.id === 0) {
        map.setFilter(`category-layer-${categoryId}`, null);
      } else if (area.id % 100 === 0) {
        map.setFilter(`category-layer-${categoryId}`, [
          "all",
          [">=", ["get", "areaId"], area.id],
          ["<=", ["get", "areaId"], area.id + 99],
        ]);
      } else {
        map.setFilter(`category-layer-${categoryId}`, [
          "==",
          ["get", "areaId"],
          area.id,
        ]);
      }
    }
    map.easeTo({
      center: [area.lng, area.lat],
      zoom: area.zoom,
      duration: 400,
    });
  },

  initLevelLayers: function () {
    if (map.hasImage("levelLayer")) {
      addLevelLayer();
      return;
    }

    // 加载图片
    map.loadImage(`./assets/icons/layers.png`, (error, image) => {
      if (error) {
        console.warn(`图标 levelLayer 加载失败:`, error);
        return;
      }

      map.addImage("levelLayer", image);
      addLevelLayer();
    });

    function addLevelLayer() {
      if (!map.getSource(`level-layer-source`)) {
        map.addSource(`level-layer-source`, {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: btns.map((layer) => {
              return {
                type: "Feature",
                id: layer.id,
                geometry: {
                  type: "Point",
                  coordinates: layer.coordinates,
                },
              };
            }),
          },
        });

        if (!map.getLayer(`level-layer`)) {
          map.addLayer({
            id: `level-layer`,
            type: "symbol",
            source: `level-layer-source`,
            layout: {
              "icon-image": "levelLayer",
              "icon-size": 0.4,
              "icon-allow-overlap": true,
              "icon-ignore-placement": true, // 禁用图标自动调整位置
            },
          });
        }
      }
      map.setLayoutProperty(`level-layer`, "visibility", "none");
    }

    map.on("click", `level-layer`, (e) => {
      const layerAreaId = e.features[0].id;
      map.easeTo({
        center: btns[layerAreaId].coordinates,
        zoom: 5,
        curve: 1.1, // 飞行曲线
      });
      map.setLayoutProperty(`level-layer`, "visibility", "none");
      filterPanel.content.header.areaSelector.disable();
      filterPanel.content.header.allShowBtn.element.click();
      filterPanel.content.header.areaSelector.setSelected(
        btns[layerAreaId].areaId,
        btns[layerAreaId].name
      );
      for (const categoryId of allDatas.categories.keys()) {
        UpdateCategoryCountShow(categoryId);
      }
      if (resourceControl.isMobile()) {
        zoomSliderControl.hide();
        mapAction.hide();
      }
      layers.sider.show(layerAreaId);
    });

    map.on("mouseenter", `level-layer`, () => {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", `level-layer`, (e) => {
      map.getCanvas().style.cursor = "";
    });
  },
};
