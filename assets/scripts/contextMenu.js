let contextMenu = {
  render: function () {
    // 创建菜单元素
    this.element = document.createElement("div");
    this.element.className = "context-menu";
    this.close();

    addNewMarkerBtn = this.addItem("添加新标记");
    addNewMarkerBtn.addEventListener("click", () => {
      this.close();
      editForm.open(0, 0, "add");
    });

    addQuickPositionBtn = this.addItem("添加快速定位");
    addQuickPositionBtn.addEventListener("click", () => {
      this.close();
      quickPositionForm.open(this.getLngLat().lng, this.getLngLat().lat);
    });

    copyLocationUrlBtn = this.addItem("复制坐标url");
    copyLocationUrlBtn.classList.add("clipboard-btn");
    copyLocationUrlBtn.addEventListener("click", () => {
      this.close();
      copyLocationUrlBtn.setAttribute(
        "data-clipboard-text",
        `${window.location.origin}${window.location.pathname}?lng=${
          this.getLngLat().lng
        }&lat=${this.getLngLat().lat}&zoom=${map.getZoom().toFixed(0)}`
      );
    });

    document.body.appendChild(this.element);

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
        //console.log(e.lngLat.lng, e.lngLat.lat);
        contextMenu.setLngLat(e.lngLat.lng.toFixed(4), e.lngLat.lat.toFixed(4));
        contextMenu.open(e.point.x, e.point.y);

        // 添加全局点击事件关闭菜单
        document.addEventListener("click", closeMenu);
      }
    });

    // 点击其他地方关闭菜单
    const closeMenu = (e) => {
      if (!contextMenu.element.contains(e.target)) {
        contextMenu.close();
        document.removeEventListener("click", closeMenu);
      }
    };
  },

  addItem: function (title) {
    const item = document.createElement("div");
    item.className = "context-menu-item";
    item.textContent = title;
    this.element.appendChild(item);
    return item;
  },

  open: function (x, y) {
    this.element.style.left = `${x}px`;
    this.element.style.top = `${y}px`;
    this.element.style.visibility = "visible";
  },

  close: function () {
    this.element.style.visibility = "hidden";
  },

  setLngLat: function (lng, lat) {
    this.element.dataset.lng = lng;
    this.element.dataset.lat = lat;
  },

  getLngLat: function () {
    return {
      lng: this.element.dataset.lng,
      lat: this.element.dataset.lat,
    };
  },
};


