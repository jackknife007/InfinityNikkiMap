let markerPopup = {
  _popup: new mapboxgl.Popup({
    offset: [19, 0],
    closeButton: true,
    closeOnClick: false,
    anchor: "left",
  }),

  _popup_up: new mapboxgl.Popup({
    offset: [0, -20],
    closeButton: true,
    closeOnClick: false,
    anchor: "bottom",
  }),

  _content: new MarkerPopupContent(),
  _popupMarkerId: 0,

  choosePopup: function () {
    if (resourceControl.isMobilePortrait()) {
      return this._popup_up;
    } else {
      return this._popup;
    }
  },

  _opened_popup: null,

  open: function (markerId) {
    this.close();

    const marker = allDatas.getMarker(markerId);
    this._content.update(marker);
    let popup;
    if (resourceControl.isMobilePortrait()) {
      popup = this._popup_up;
    } else {
      popup = this._popup;
    }
    popup
      .setLngLat([marker.lng, marker.lat])
      .setDOMContent(this._content.container)
      .addTo(map);
    this._popupMarkerId = markerId;
    this._opened_popup = popup;
  },

  close: function () {
    if (this._opened_popup) {
      this._opened_popup.remove();
    }
    this._popupMarkerId = 0;
  },

  setIgnore: function (markerId, categoryId) {
    this._content.setIgnoreCheckBoxState(markerId, categoryId);
  },

  isRepeatClick: function (markerId) {
    return this._popupMarker === markerId && this._data.isOpen();
  },

  setEditBtnState: function () {
    this._content.setEditBtnState();
  },
};

function renderMarkers() {
  for (const [categoryId, category] of allDatas.categories.entries()) {
    initLayerMarkers(categoryId, category);
  }
}

function initLayerMarkers(categoryId, category) {
  // 检查图片是否已加载
  if (map.hasImage(category.icon)) {
    addLayerWithSource();
    return;
  }

  // 加载图片
  map.loadImage(
    `./assets/icons/markers/${category.icon}.png`,
    (error, image) => {
      if (error) {
        console.warn(`图标 ${category.icon} 加载失败:`, error);
        return;
      }

      map.addImage(category.icon, image);
      addLayerWithSource();
    }
  );

  function addLayerWithSource() {
    // 添加数据源和图层的代码
    if (!map.getSource(`category-${categoryId}`)) {
      map.addSource(`category-${categoryId}`, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: Array.from(category.markersId).map((markerId) => {
            const marker = allDatas.getMarker(markerId);
            return {
              type: "Feature",
              id: markerId,
              geometry: {
                type: "Point",
                coordinates: [marker.lng, marker.lat],
              },
            };
          }),
        },
      });
    }

    if (!map.getLayer(`category-layer-${categoryId}`)) {
      map.addLayer({
        id: `category-layer-${categoryId}`,
        type: "symbol",
        source: `category-${categoryId}`,
        layout: {
          "icon-image": category.icon,
          "icon-size": 0.5,
          "icon-allow-overlap": true,
          "icon-ignore-placement": true, // 禁用图标自动调整位置
        },
        paint: {
          "icon-opacity": [
            "case",
            ["boolean", ["feature-state", "transparent"], false],
            0.4,
            1,
          ],
        },
      });

      InitIgnoreMarker(categoryId);
    }
  }

  // 添加点击事件
  map.on("click", `category-layer-${categoryId}`, (e) => {
    const markerId = e.features[0].id;
    features = map.queryRenderedFeatures(e.point);

    // 如果点击到多个图标，取最小的图标层级
    const minCategoryLayerId = Math.min(
      ...features.map((f) => f.layer.id.split("-")[2])
    );

    // 如果点击的是同一个图标，不重复打开 popup
    // 如果点击到不同层级多个图标，只有在最小的图标层级图标上点击才会打开 popup
    if (
      markerPopup.isRepeatClick(markerId) ||
      (features.length > 1 && minCategoryLayerId !== categoryId)
    ) {
      return;
    }

    markerPopup.open(markerId);
    //移动会产生popup抖动 先注释掉
    const marker = allDatas.getMarker(markerId);
    map.easeTo({
      center: [marker.lng, marker.lat],
      duration: 400,
    });
  });

  map.on("contextmenu", `category-layer-${categoryId}`, (e) => {
    e.preventDefault();
    const markerId = e.features[0].id;
    doAfterIgnoreClick(markerId, categoryId);
    markerPopup.setIgnore(markerId, categoryId);
  });

  map.on("mouseenter", `category-layer-${categoryId}`, () => {
    map.getCanvas().style.cursor = "pointer";
  });

  map.on("mouseleave", `category-layer-${categoryId}`, (e) => {
    const features = map.queryRenderedFeatures(e.point);

    // 确保鼠标离开所有图标时才恢复默认光标
    const isCategoryInFeatures = features.some(
      (feature) => feature.layer.id === `category-layer-${categoryId}`
    );
    if (features.length === 0 || isCategoryInFeatures) {
      map.getCanvas().style.cursor = "";
    }
  });

  map.on("click", (e) => {
    // 查询点击位置的图层
    const features = map.queryRenderedFeatures(e.point, {
      layers: Array.from(allDatas.categories.keys()).map(
        (id) => `category-layer-${id}`
      ),
    });

    // 如果点击位置没有找到任何 category-layer 关闭popup
    if (features.length === 0) {
      markerPopup.close();
    }
  });
}

function InitIgnoreMarker(categoryId) {
  allDatas.ignoreMarkers.data.get(categoryId)?.forEach((markerId) => {
    SetIgnoreMarkerOnLayer(markerId, categoryId, true);
  });
}

function doAfterIgnoreClick(markerId, categoryId) {
  const ignore = allDatas.ignoreMarkers.changeState(markerId, categoryId);
  SetIgnoreMarkerOnLayer(markerId, categoryId, ignore);
  UpdateCategoryCountShow(categoryId, true);
}

function SetIgnoreMarkerOnLayer(markerId, categoryId, ignore) {
  map.setFeatureState(
    {
      source: `category-${categoryId}`,
      id: markerId,
    },
    { transparent: ignore }
  );
}

function toggleCategoryLayer(categoryId, visible) {
  const visibility = visible ? "visible" : "none";
  map.setLayoutProperty(
    `category-layer-${categoryId}`,
    "visibility",
    visibility
  );
}

function showIgnoredMarkers() {
  for (const [categoryId, ignoreSet] of allDatas.ignoreMarkers.data.entries()) {
    // 获取数据源
    const source = map.getSource(`category-${categoryId}`);
    if (source) {
      const currentFeatures = source._data.features;

      // 为每个被忽略的标记创建新的特征
      ignoreSet.forEach((markerId) => {
        const marker = allDatas.getMarker(markerId);
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
  }
}

function hiddenIgnoredMarkers() {
  for (const [categoryId, ignoreSet] of allDatas.ignoreMarkers.data.entries()) {
    const oldSource = map.getSource(`category-${categoryId}`);
    if (oldSource) {
      const oldFeatures = oldSource._data.features.filter(
        (feature) => !ignoreSet.has(feature.id)
      );
      oldSource.setData({
        type: "FeatureCollection",
        features: oldFeatures,
      });
    }
  }
}

function addMarkerToCategorySource(marker) {
  // 更新新category的数据源
  const newFeature = {
    type: "Feature",
    id: marker.id,
    geometry: {
      type: "Point",
      coordinates: [marker.lng, marker.lat],
    },
  };
  const newSource = map.getSource(`category-${marker.categoryId}`);
  if (newSource) {
    // const newFeatures = [...newSource._data.features];
    const newFeatures = newSource._data.features;
    newFeatures.push(newFeature);
    newSource.setData({
      type: "FeatureCollection",
      features: newFeatures,
    });
  }
  allDatas.categories.get(marker.categoryId).markersId.add(marker.id);
  UpdateCategoryCountShow(marker.categoryId);
}

function deleteMarkerFromCategorySource(markerId, categoryId) {
  // 更新旧category的数据源
  const oldSource = map.getSource(`category-${categoryId}`);
  if (oldSource) {
    const newFeatures = oldSource._data.features.filter(
      (f) => f.id !== markerId
    );
    oldSource.setData({
      type: "FeatureCollection",
      features: newFeatures,
    });
  }

  allDatas.categories.get(categoryId).markersId.delete(markerId);
  UpdateCategoryCountShow(categoryId);
}
