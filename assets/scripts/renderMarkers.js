let mouseOnCatergorySet = new Set();

let popup = new mapboxgl.Popup({
  offset: [19, 230],
  closeButton: true,
  closeOnClick: false,
  anchor: "left",
});

let popupMarker = 0;
let popupContainer = createPopupDomContent();

function createPopupDomContent() {
  // 创建容器元素
  const container = document.createElement("div");
  container.className = "marker-popup";

  const containerHeader = document.createElement("div");
  containerHeader.className = "marker-popup-header";

  // 创建左侧容器
  const leftContainer = document.createElement("div");
  leftContainer.className = "marker-popup-header-left";

  // 创建标题
  const title = document.createElement("span");
  title.textContent = "Default Title";
  leftContainer.appendChild(title);

  // 创建复制按钮
  const copyBtn = document.createElement("div");
  copyBtn.className = "marker-popup-copy-location-btn";
  leftContainer.appendChild(copyBtn);

  // 创建编辑按钮
  const editBtn = document.createElement("div");
  editBtn.className = "marker-popup-edit-marker-btn";
  editBtn.addEventListener("click", () => {
    showEditMarkerForm(Number(editBtn.dataset.markerId), "edit");
    popup.remove();
  });

  leftContainer.appendChild(editBtn);

  // 创建右侧时间显示
  const updateTime = document.createElement("div");
  updateTime.className = "marker-popup-update-time";

  containerHeader.appendChild(leftContainer);
  containerHeader.appendChild(updateTime);
  container.appendChild(containerHeader);

  const containerBody = document.createElement("div");
  containerBody.className = "marker-popup-body";

  // 创建图片容器
  const imageContainer = document.createElement("div");
  imageContainer.className = "marker-popup-image-container";
  containerBody.appendChild(imageContainer);

  // 创建描述
  const description = document.createElement("p");
  description.className = "marker-popup-description";
  containerBody.appendChild(description);

  container.appendChild(containerBody);

  const containerFooter = document.createElement("div");
  containerFooter.className = "marker-popup-footer";

  // 添加作者信息
  const author = document.createElement("div");
  author.className = "marker-popup-author";
  containerFooter.appendChild(author);

  // 添加视频链接
  const video = document.createElement("div");
  video.className = "marker-popup-video";
  containerFooter.appendChild(video);

  // 添加已找到按钮
  const ignoreControl = document.createElement("label");
  ignoreControl.className = "marker-popup-ignore-control";

  const ignoreText = document.createElement("div");
  ignoreText.className = "marker-popup-ignore-text";
  ignoreText.textContent = "已找到";
  ignoreControl.appendChild(ignoreText);

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "marker-popup-ignore-checkbox";

  checkbox.addEventListener("change", () => {
    console.log("checkbox change");
    const markerId = Number(editBtn.dataset.markerId);
    changeMarkerIgnoreState(markerId);
    setIgnoreMarkerOnLayer(markerId);
    const marker = globalMarkers.get(markerId);
    updateCategoryCountShow(marker.categoryId, true);
  });
  ignoreControl.appendChild(checkbox);
  containerFooter.appendChild(ignoreControl);

  container.appendChild(containerFooter);
  return container;
}

function renderMarkers() {
  map.on("click", (e) => {
    // 查询点击位置的图层
    const features = map.queryRenderedFeatures(e.point, {
      layers: Array.from(globalCategories.keys()).map(
        (id) => `category-layer-${id}`
      ),
    });

    // 如果点击位置没有找到任何 category-layer
    if (features.length === 0) {
      // 关闭所有 popup
      popup.remove();
      popupMarker = 0;
    }
  });
  for (const [categoryId, category] of globalCategories.entries()) {
    initLayerMarkers(categoryId, category);
  }
}

function initLayerMarkers(categoryId, category) {
  // 创建 GeoJSON 数据
  const geojson = {
    type: "FeatureCollection",
    features: Array.from(category.markersId).map((markerId) => {
      const marker = globalMarkers.get(markerId);
      return {
        type: "Feature",
        id: markerId,
        geometry: {
          type: "Point",
          coordinates: [marker.lng, marker.lat],
        },
      };
    }),
  };

  map.loadImage(
    `./assets/icons/markers/${category.icon}.png`,
    (error, image) => {
      if (error) {
        console.warn(`图标 ${category.icon} 加载失败:`, error);
        throw error;
      }

      map.addImage(category.icon, image);

      // 添加数据源
      map.addSource(`category-${categoryId}`, {
        type: "geojson",
        data: geojson,
      });

      // 添加图层
      map.addLayer({
        id: `category-layer-${categoryId}`,
        type: "symbol",
        source: `category-${categoryId}`,
        layout: {
          "icon-image": category.icon,
          "icon-size": 0.5,
          "icon-allow-overlap": true,
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
  );

  // 添加点击事件
  map.on("click", `category-layer-${categoryId}`, (e) => {
    const markerId = e.features[0].id;
    features = map.queryRenderedFeatures(e.point);
    const minCategoryLayerId = Math.min(
      ...features.map((f) => f.layer.id.split("-")[2])
    );
    if (
      (popupMarker === markerId && popup.isOpen()) ||
      (features.length > 1 && minCategoryLayerId !== categoryId)
    ) {
      return;
    }
    popupMarker = markerId;
    popup.remove();
    const marker = globalMarkers.get(markerId);
    const title = popupContainer.querySelector(
      ".marker-popup-header-left span"
    );
    title.textContent = marker.name;

    location_url = `${window.location.origin}${window.location.pathname}?locationId=${markerId}`;

    copyBtn = popupContainer.querySelector(".marker-popup-copy-location-btn");
    copyBtn.setAttribute("data-clipboard-text", location_url);

    editBtn = popupContainer.querySelector(".marker-popup-edit-marker-btn");
    editBtn.setAttribute("data-marker-id", marker.id);

    const updateTime = popupContainer.querySelector(
      ".marker-popup-update-time"
    );
    updateTime.textContent = `(更新时间：${
      marker.updateTime ? marker.updateTime : "未知"
    })`;

    const imageContainer = popupContainer.querySelector(
      ".marker-popup-image-container"
    );
    imageContainer.innerHTML = "";
    if (marker.image && imageContainer) {
      // 清除旧内容
      imageContainer.innerHTML = '<div class="loading-spinner"></div>';

      const img = new Image();
      img.src = marker.image;
      img.alt = marker.name;
      img.className = "marker-popup-image";

      img.onload = () => {
        imageContainer.innerHTML = "";
        imageContainer.appendChild(img);
        // 添加点击放大功能
        img.style.cursor = "pointer"; // 添加手型光标
        img.addEventListener("click", () => {
          // 创建全屏遮罩
          const overlay = document.createElement("div");
          overlay.className = "image-overlay";

          // 创建大图容器
          const imgContainer = document.createElement("div");
          imgContainer.className = "large-image-container";

          // 创建大图
          const largeImg = new Image();
          largeImg.src = marker.image;
          largeImg.className = "large-image";

          // 创建关闭按钮
          const closeBtn = document.createElement("div");
          closeBtn.className = "image-close-btn";
          closeBtn.innerHTML = "×";

          // 点击遮罩或关闭按钮时关闭
          overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
              overlay.remove();
            }
          });

          closeBtn.addEventListener("click", () => {
            overlay.remove();
          });

          imgContainer.appendChild(largeImg);
          imgContainer.appendChild(closeBtn);
          overlay.appendChild(imgContainer);
          document.body.appendChild(overlay);
        });
      };

      // 添加错误处理
      img.onerror = () => {
        imageContainer.innerHTML = "不知道为什么图片没加载成功";
        imageContainer.style.color = "rgba(209, 207, 184, 0.8)";
      };
    }

    const description = popupContainer.querySelector(
      ".marker-popup-description"
    );
    description.textContent = marker.description;

    const videoContainer = popupContainer.querySelector(".marker-popup-video");
    videoContainer.innerHTML = "";
    if (marker.video) {
      // 添加播放按钮
      const videoPlayButton = document.createElement("div");
      videoPlayButton.className = "marker-popup-video-img";
      videoContainer.appendChild(videoPlayButton);

      // 点击事件处理
      videoPlayButton.addEventListener("click", () => {
        // 创建全屏遮罩
        const overlay = document.createElement("div");
        overlay.className = "video-overlay";

        // 创建视频容器，防止点击视频时关闭
        const videoContainer = document.createElement("div");
        videoContainer.className = "video-container";

        // 创建视频播放器
        const videoIframe = document.createElement("iframe");
        videoIframe.src = `//player.bilibili.com/player.html?bvid=${marker.video}`;
        videoIframe.scrolling = "no";
        videoIframe.frameBorder = "no";
        videoIframe.allowFullscreen = "";
        videoIframe.className = "video-iframe";

        // 创建关闭按钮
        const closeBtn = document.createElement("div");
        closeBtn.className = "video-close-btn";
        closeBtn.innerHTML = "×";

        // 点击遮罩层关闭
        overlay.addEventListener("click", (e) => {
          if (e.target === overlay) {
            overlay.remove();
          }
        });

        // 点击关闭按钮关闭
        closeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          overlay.remove();
        });

        videoContainer.appendChild(videoIframe);
        videoContainer.appendChild(closeBtn);
        overlay.appendChild(videoContainer);
        document.body.appendChild(overlay);
      });
    }

    const author = popupContainer.querySelector(".marker-popup-author");
    if (marker.author && marker.authorLink) {
      // 创建链接元素
      const authorLink = document.createElement("a");
      authorLink.href = marker.authorLink;
      authorLink.target = "_blank"; // 新窗口打开
      authorLink.textContent = marker.author;

      // 组装作者信息
      author.textContent = "贡献者： ";
      author.appendChild(authorLink);
    } else if (marker.author) {
      // 无链接时只显示作者名
      author.textContent = "贡献者： " + marker.author;
    } else {
      author.textContent = ""; // 无作者信息时清空
    }

    setIgnoreCheckBoxState(marker.id);

    popup.setLngLat([marker.lng, marker.lat]).setDOMContent(popupContainer);
    popup.addTo(map);
    popupMarker = markerId;
    //移动会产生popup抖动 先注释掉
    //map.easeTo({
    //  center: [marker.lng, marker.lat],
    //  offset: [0, -400 * (map.getZoom() / map.getMaxZoom())], // 根据缩放比例调整偏移
    //  duration: 400,
    //});
  });

  map.on("contextmenu", `category-layer-${categoryId}`, (e) => {
    e.preventDefault();
    const feature = e.features[0];
    changeMarkerIgnoreState(feature.id);
    setIgnoreMarkerOnLayer(feature.id);
    setIgnoreCheckBoxState(feature.id);
    updateCategoryCountShow(categoryId, true);
  });

  map.on("mouseenter", `category-layer-${categoryId}`, () => {
    map.getCanvas().style.cursor = "pointer";
  });

  map.on("mouseleave", `category-layer-${categoryId}`, (e) => {
    const features = map.queryRenderedFeatures(e.point);
    const isCategoryInFeatures = features.some(
      (feature) => feature.layer.id === `category-layer-${categoryId}`
    );
    if (features.length === 0 || isCategoryInFeatures) {
      map.getCanvas().style.cursor = "";
    }
  });
}

function setIgnoreMarkerOnLayer(markerId) {
  const marker = globalMarkers.get(markerId);
  map.setFeatureState(
    {
      source: `category-${marker.categoryId}`,
      id: markerId,
    },
    { transparent: marker.ignore }
  );
}

function changeMarkerIgnoreState(markerId) {
  const marker = globalMarkers.get(markerId);
  const ignore = !marker.ignore;
  marker.ignore = ignore;
  globalCategories
    .get(marker.categoryId)
    .ignoredMarkers[ignore ? "add" : "delete"](markerId);
}

function setIgnoreCheckBoxState(markerId) {
  const marker = globalMarkers.get(markerId);
  const checkbox = popupContainer.querySelector(
    ".marker-popup-ignore-checkbox"
  );
  checkbox.checked = marker.ignore;
}

function InitIgnoreMarker(categoryId) {
  for (markerId of globalCategories.get(categoryId).ignoredMarkers) {
    setIgnoreMarkerOnLayer(markerId);
  }
}
