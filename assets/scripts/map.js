// 初始化地图
let map;


// 创建自定义滑块控件
class ZoomSliderControl {
  onAdd(map) {
    this._map = map;
    this._container = document.createElement("div");
    this._container.className =
      "mapboxgl-ctrl mapboxgl-ctrl-zoom-slider costom-ctrl";

    // 创建放大按钮
    this._zoomInButton = document.createElement("div");
    this._zoomInButton.className = "mapboxgl-ctrl-icon mapboxgl-ctrl-zoom-in";
    this._zoomInButton.addEventListener("click", () => {
      map.setZoom(Math.min(map.getMaxZoom(), map.getZoom() + 1));
    });

    // 创建缩小按钮
    this._zoomOutButton = document.createElement("div");
    this._zoomOutButton.className = "mapboxgl-ctrl-icon mapboxgl-ctrl-zoom-out";
    this._zoomOutButton.addEventListener("click", () => {
      map.setZoom(Math.max(map.getMinZoom(), map.getZoom() - 1));
    });

    // 创建滑块容器
    this._sliderContainer = document.createElement("div");
    this._sliderContainer.className = "mapboxgl-ctrl-slider-container";

    // 创建滑块轨道
    this._sliderTrack = document.createElement("div");
    this._sliderTrack.className = "mapboxgl-ctrl-slider-track";

    // 创建滑块按钮
    this._sliderThumb = document.createElement("div");
    this._sliderThumb.className = "mapboxgl-ctrl-slider-thumb";

    // 添加拖拽功能
    let isDragging = false;

    this._sliderThumb.addEventListener("mousedown", (e) => {
      isDragging = true;
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });

    this._sliderThumb.addEventListener("touchstart", (e) => {
      isDragging = true;
      document.addEventListener("touchmove", onTouchMove);
      document.addEventListener("touchend", onTouchEnd);
    });

    const onMouseMove = (e) => {
      if (!isDragging) return;

      const trackRect = this._sliderTrack.getBoundingClientRect();
      const y = Math.max(
        0,
        Math.min(trackRect.bottom - e.clientY, trackRect.height)
      );

      const percentage = y / trackRect.height;

      const zoom =
        this._map.getMinZoom() +
        percentage * (this._map.getMaxZoom() - this._map.getMinZoom());
      this._map.setZoom(zoom);
      //this._sliderThumb.style.bottom = `${y}px`;
    };

    const onTouchMove = (e) => {
      if (!isDragging) return;

      const trackRect = this._sliderTrack.getBoundingClientRect();
      const touch = e.touches[0];
      const y = Math.max(
        0,
        Math.min(trackRect.bottom - touch.clientY, trackRect.height)
      );

      const percentage = y / trackRect.height;

      const zoom =
        this._map.getMinZoom() +
        percentage * (this._map.getMaxZoom() - this._map.getMinZoom());
      this._map.setZoom(zoom);
    };

    const onMouseUp = () => {
      isDragging = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    const onTouchEnd = () => {
      isDragging = false;
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };

    // 监听地图缩放更新滑块位置
    map.on("zoom", () => {
      const zoom = map.getZoom();
      const percentage =
        (zoom - map.getMinZoom()) / (map.getMaxZoom() - map.getMinZoom());
      const y = percentage * 110;
      this._sliderThumb.style.bottom = `${y - 25}px`;
    });

    // 组装控件
    this._container.appendChild(this._zoomInButton);
    this._sliderTrack.appendChild(this._sliderThumb);
    this._sliderContainer.appendChild(this._sliderTrack);
    this._container.appendChild(this._sliderContainer);
    this._container.appendChild(this._zoomOutButton);

    // 添加：设置滑块初始位置
    const initialZoom = map.getZoom();
    const initialPercentage =
      (initialZoom - map.getMinZoom()) / (map.getMaxZoom() - map.getMinZoom());
    const initialY = initialPercentage * 110;
    this._sliderThumb.style.bottom = `${initialY - 25}px`;

    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }

  hide() {
    this._container.style.visibility = "hidden";
  }

  show() {
    this._container.style.visibility = "visible";
  }
}

let zoomSliderControl = new ZoomSliderControl();

function InitMap() {
  map = new mapboxgl.Map({
    container: "map",
    style: {
      version: 8,
      background: {
        type: "background",
        paint: {
          "background-color": "#000000",
        },
      },
      sources: {
        "custom-tiles": {
          type: "raster",
          tiles: [resourceControl.getTilesFilePath()],
          tileSize: 256,
          attributionControl: false,
          minZoom: 1,
          maxZoom: resourceControl.getTilesMaxZoom(),
          keepBuffer: 8,

          bounds: resourceControl.getTilesBounds(), // 全球范围
        },
      },
      layers: [
        {
          id: "custom-layer",
          type: "raster",
          source: "custom-tiles",
          paint: {
            "raster-fade-duration": 100,
          },
        },
      ],
    },
    zoom: 2,
    minZoom: 1,
    maxZoom: resourceControl.getTilesMaxZoom(),
    maxBounds: [
      [-360, -90], // 西南角坐标 [经度, 纬度]
      [360, 90], // 东北角坐标 [经度, 纬度]
    ],
    renderWorldCopies: false, // 关闭地图重复
    doubleClickZoom: false, // 禁用双击缩放
    dragRotate: true,
    touchPitch: false,
    touchZoomRotate: true,
  });

  // 添加缩放控件到地图
  map.addControl(zoomSliderControl, "bottom-right");
}


class MapActionBtn {
  renderBtn(name, iconImgSrc) {
    this.btn = document.createElement("div");
    this.btn.className = "map-action-btn";
    this.btn.onclick = () => {
      this.openPopup();
    };

    const iconImg = document.createElement("img");
    iconImg.src = `./assets/icons/${iconImgSrc}.png`;
    iconImg.className = "map-action-btn-icon";
    this.btn.appendChild(iconImg);

    const tipContainer = document.createElement("div");
    tipContainer.className = "map-action-btn-tip-container";

    const tip = document.createElement("div");
    tip.className = "map-action-btn-tip";

    const tipText = document.createElement("span");
    tipText.textContent = name;

    tipContainer.appendChild(tip);
    tipContainer.appendChild(tipText);
    this.btn.appendChild(tipContainer);

    return this.btn;
  }

  renderPopup(header) {
    this.overlay = document.createElement("div");
    this.overlay.className = "screen-popup-overlay";

    this.container = document.createElement("div");
    this.container.className = "screen-popup-container";

    this.header = document.createElement("div");
    this.header.className = "screen-popup-header";

    this.title = document.createElement("h3");
    this.title.textContent = header;

    this.closeBtn = document.createElement("div");
    this.closeBtn.className = "screen-popup-close-btn";
    this.closeBtn.innerHTML = "×";

    this.header.appendChild(this.title);
    this.header.appendChild(this.closeBtn);

    this.content = document.createElement("div");
    this.content.className = "screen-popup-content";

    this.footer = document.createElement("div");
    this.footer.className = "screen-popup-footer";

    const footerText = document.createElement("span");
    footerText.textContent = "可以转载，请注明出处哟 @黄大胖不胖";
    this.footer.appendChild(footerText);

    this.container.appendChild(this.header);
    this.container.appendChild(this.content);
    this.container.appendChild(this.footer);

    this.overlay.appendChild(this.container);

    this.overlay.addEventListener("click", (e) => {
      if (e.target === this.overlay) {
        this.closePopup();
      }
    });

    this.closeBtn.addEventListener("click", () => {
      this.closePopup();
    });

    this.overlay.style.visibility = "hidden";
    document.getElementById("root").appendChild(this.overlay);
  }

  setPopupContent(content) {
    this.content.innerHTML = "";
    this.content.appendChild(content);
  }

  openPopup() {
    this.overlay.style.visibility = "visible";
  }

  closePopup() {
    this.overlay.style.visibility = "hidden";
  }
}

// 创建按钮容器
let mapAction = {
  announcements: [],
  functionalUpdates: [],
  gameEvents: new Map(),
  gameExplorations: new Map(),
  gameEventsOther: new Map(),

  element: null,

  init: async function () {
    try {
      const [
        announcements,
        functionalUpdates,
        gameEvents,
        gameExplorations,
        gameEventsOther,
      ] = await Promise.all([
        fetch(resourceControl.getAnouncementsJsonFilePath()).then((res) =>
          res.json()
        ),
        fetch(resourceControl.getFunctionalUpdatesJsonFilePath()).then((res) =>
          res.json()
        ),
        fetch(resourceControl.getGameEventsJsonFilePath()).then((res) =>
          res.json()
        ),
        fetch(resourceControl.getGameExplorationsJsonFilePath()).then((res) =>
          res.json()
        ),
        fetch(resourceControl.getGameEventsOtherJsonFilePath()).then((res) =>
          res.json()
        ),
      ]);

      this.announcements = announcements;
      this.functionalUpdates = functionalUpdates;

      this.gameEvents = new Map(gameEvents.map((event) => [event.id, event]));
      this.gameExplorations = new Map(
        gameExplorations.map((event) => [event.id, event])
      );
      this.gameEventsOther = new Map(
        gameEventsOther.map((event) => [event.id, event])
      );
    } catch (error) {
      console.error("加载数据失败:", error);
    }

    const btnContainer = document.createElement("div");
    btnContainer.className = "map-action-buttons";

    // pc加载全屏按钮
    if (!resourceControl.isMobile()) {
      btnContainer.appendChild(this.fullScreenBtn.render());
    }

    // 更新说明按钮
    btnContainer.appendChild(this.updateDialogBtn.render());

    // 奖励介绍按钮
    btnContainer.appendChild(this.giftBtn.render());

    this.element = btnContainer;

    // 将按钮容器添加到地图容器
    document.querySelector(".map-container").appendChild(btnContainer);
  },

  hide: function () {
    this.element.style.visibility = "hidden";
  },

  show: function () {
    this.element.style.visibility = "visible";
  },

  fullScreenBtn: {
    render: function () {
      this.element = new MapActionBtn();
      const btn = this.element.renderBtn("全屏", "elf");
      btn.onclick = () => {
        if (!document.fullscreenElement) {
          // 进入全屏
          const mapContainer = document.getElementById("root");
          if (mapContainer.requestFullscreen) {
            mapContainer.requestFullscreen();
          } else if (mapContainer.webkitRequestFullscreen) {
            mapContainer.webkitRequestFullscreen();
          } else if (mapContainer.msRequestFullscreen) {
            mapContainer.msRequestFullscreen();
          }
        } else {
          // 退出全屏
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
          }
        }
      };
      return btn;
    },
  },

  updateDialogBtn: {
    render: function () {
      this.element = new MapActionBtn();
      const btn = this.element.renderBtn("公告板", "board");

      this.element.renderPopup("公告板");
      this.element.setPopupContent(this.content.render());
      return btn;
    },

    content: {
      render: function () {
        return updateLogPopup.render();
      },
    },
  },

  giftBtn: {
    render: function () {
      this.element = new MapActionBtn();
      const btn = this.element.renderBtn("福利&奖励", "gift");

      this.element.renderPopup("福利 & 奖励");
      this.element.setPopupContent(this.content.render());
      return btn;
    },

    content: {
      render: function () {
        return giftCollectionPopup.render();
      },
    },
  },
};
