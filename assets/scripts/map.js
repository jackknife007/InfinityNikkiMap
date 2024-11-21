// 初始化地图
const map = new mapboxgl.Map({
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
        tiles: ["./assets/tiles/{z}/{x}/{y}.jpg"],
        tileSize: 256,
        attributionControl: false,
        minZoom: 1,
        maxZoom: 6,
        keepBuffer: 8,
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
  maxZoom: 6,
  maxBounds: [
    [-360, -90], // 西南角坐标 [经度, 纬度]
    [360, 90], // 东北角坐标 [经度, 纬度]
  ],
  renderWorldCopies: false, // 关闭地图重复
  doubleClickZoom: false, // 禁用双击缩放
  dragRotate: false, // 禁用拖拽旋转
  touchRotate: false, // 禁用触摸缩放旋转
});

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

    const onMouseUp = () => {
      isDragging = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    // 监听地图缩放更新滑块位置
    map.on("zoom", () => {
      const zoom = map.getZoom();
      const percentage =
        (zoom - map.getMinZoom()) / (map.getMaxZoom() - map.getMinZoom());
      const y = percentage * 130;
      this._sliderThumb.style.bottom = `${y - 20}px`;
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
    const initialY = initialPercentage * 130;
    this._sliderThumb.style.bottom = `${initialY - 20}px`;

    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}

// 添加控件到地图
map.addControl(new ZoomSliderControl(), "bottom-right");

// 创建全屏控件
class FullscreenControl {
  onAdd(map) {
    this._map = map;
    this._container = document.createElement("div");
    this._container.className = "mapboxgl-ctrl";

    this._fullscreenButton = document.createElement("div");
    this._fullscreenButton.className = "mapboxgl-ctrl-fullscreen";

    this._fullscreenButton.addEventListener("click", () => {
      if (!document.fullscreenElement) {
        // 进入全屏
        const mapContainer = document.getElementById("map");
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
    });

    this._container.appendChild(this._fullscreenButton);
    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}

// 添加到地图
map.addControl(new FullscreenControl(), "top-right");
