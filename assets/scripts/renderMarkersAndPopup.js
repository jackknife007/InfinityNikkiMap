class PopupContent {
  constructor() {
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
    copyBtn.title = "复制位置链接";
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
      const markerId = Number(editBtn.dataset.markerId);
      changeMarkerIgnoreState(markerId);
      setIgnoreMarkerOnLayer(markerId);
      const marker = globalMarkers.get(markerId);
      updateCategoryCountShow(marker.categoryId, true);
    });
    ignoreControl.appendChild(checkbox);
    containerFooter.appendChild(ignoreControl);

    container.appendChild(containerFooter);

    this.container = container;
    this.title = title;
    this.copyBtn = copyBtn;
    this.editBtn = editBtn;
    this.updateTime = updateTime;
    this.imageContainer = imageContainer;
    this.description = description;
    this.videoContainer = video;
    this.author = author;
    this.checkbox = checkbox;
  }

  update(marker) {
    this.updateHeader(marker);
    this.updateImage(marker);
    this.updateDescription(marker);
    this.updateVideo(marker);
    this.updateAuthor(marker);
    this.setIgnoreCheckBoxState(marker.id);
  }

  updateHeader(marker) {
    this.title.textContent = marker.name;

    const location_url = `${window.location.origin}${window.location.pathname}?locationId=${markerId}`;
    this.copyBtn.setAttribute("data-clipboard-text", location_url);

    this.editBtn.setAttribute("data-marker-id", marker.id);
    if (marker.categoryId === 26) {
      this.editBtn.classList.remove("develop-inactive");
    } else if (!developmentMode) {
      this.editBtn.classList.add("develop-inactive");
    }

    this.updateTime.textContent = `(更新时间：${
      marker.updateTime ? marker.updateTime : "未知"
    })`;
  }

  updateImage(marker) {
    this.imageContainer.innerHTML = "";
    if (marker.image) {
      // 清除旧内容
      this.imageContainer.innerHTML = '<div class="loading-spinner"></div>';

      const img = new Image();
      var imgUrl = marker.image;
      if ((marker.image.match(/\./g)?.length || 0) === 1) {
        imgUrl = "./assets/images/markers/" + marker.image;
      } else if (marker.image.startsWith("http")) {
        img.crossOrigin = "anonymous";
      }
      img.src = imgUrl;
      img.alt = marker.name;
      img.className = "marker-popup-image";

      img.onload = () => {
        this.imageContainer.innerHTML = "";
        this.imageContainer.appendChild(img);
        // 添加点击放大功能
        img.style.cursor = "pointer"; // 添加手型光标
        img.addEventListener("click", () => {
          // 创建全屏遮罩
          const overlay = document.createElement("div");
          overlay.className = "image-overlay";

          // 创建大图容器
          const largeImgContainer = document.createElement("div");
          largeImgContainer.className = "large-image-container";

          // 创建大图
          const largeImg = new Image();
          largeImg.src = imgUrl;
          largeImg.className = "large-image";

          // 创建关闭按钮
          const closeBtn = document.createElement("div");
          closeBtn.className = "image-close-btn";
          closeBtn.innerHTML = "×";

          // 点击遮罩或关闭按钮时关闭
          overlay.addEventListener("click", (e) => {
            if (e.target === overlay || e.target === largeImg) {
              overlay.remove();
            }
          });

          closeBtn.addEventListener("click", () => {
            overlay.remove();
          });

          largeImgContainer.appendChild(largeImg);
          largeImgContainer.appendChild(closeBtn);
          overlay.appendChild(largeImgContainer);
          document.body.appendChild(overlay);
        });
      };

      // 添加错误处理
      img.onerror = () => {
        this.imageContainer.innerHTML = "不知道为什么图片没加载成功";
        this.imageContainer.style.color = "rgba(209, 207, 184, 0.8)";
      };
    }
  }

  updateDescription(marker) {
    this.description.textContent = marker.description;
  }

  updateVideo(marker) {
    this.videoContainer.innerHTML = "";
    if (marker.video) {
      // 添加播放按钮
      const videoPlayButton = document.createElement("div");
      videoPlayButton.className = "marker-popup-video-img";
      this.videoContainer.appendChild(videoPlayButton);

      // 点击事件处理
      videoPlayButton.addEventListener("click", () => {
        // 创建全屏遮罩
        const overlay = document.createElement("div");
        overlay.className = "video-overlay";

        // 创建视频容器，防止点击视频时关闭
        const fullVideoContainer = document.createElement("div");
        fullVideoContainer.className = "video-container";

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

        fullVideoContainer.appendChild(videoIframe);
        fullVideoContainer.appendChild(closeBtn);
        overlay.appendChild(fullVideoContainer);
        document.body.appendChild(overlay);
      });
    }
  }

  updateAuthor(marker) {
    if (marker.author && marker.authorLink) {
      // 创建链接元素
      const authorLink = document.createElement("a");
      authorLink.href = marker.authorLink;
      authorLink.target = "_blank"; // 新窗口打开
      authorLink.textContent = marker.author;

      // 组装作者信息
      this.author.textContent = "贡献者： ";
      this.author.appendChild(authorLink);
    } else if (marker.author) {
      // 无链接时只显示作者名
      this.author.textContent = "贡献者： " + marker.author;
    } else {
      this.author.textContent = ""; // 无作者信息时清空
    }
  }

  setIgnoreCheckBoxState(marker) {
    this.checkbox.checked = marker.ignore;
  }

  toggleEditBtnState() {
    const markerId = this.editBtn.dataset.markerId;
    const marker = globalMarkers.get(Number(markerId));

    // 只有非自定义类型的图标才切换状态
    if (marker && marker.categoryId !== 26) {
      this.editBtn.classList.toggle("develop-inactive");
    }
  }
}

let popup = new mapboxgl.Popup({
  offset: [19, 230],
  closeButton: true,
  closeOnClick: false,
  anchor: "left",
});

let popupMarker = 0;
let popupContent = new PopupContent();

function renderMarkers() {
  for (const [categoryId, category] of globalCategories.entries()) {
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
    popupContent.update(marker);
    popup
      .setLngLat([marker.lng, marker.lat])
      .setDOMContent(popupContent.container)
      .addTo(map);
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
  localEditedMarkers.set(markerId, marker);
  saveEditedMarkersToStorage();
}

function InitIgnoreMarker(categoryId) {
  for (markerId of globalCategories.get(categoryId).ignoredMarkers) {
    setIgnoreMarkerOnLayer(markerId);
  }
}
