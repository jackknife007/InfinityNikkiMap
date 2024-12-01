class QuickPositionForm {
  constructor() {
    // 创建遮罩层
    this.overlay = document.createElement("div");
    this.overlay.className = "quick-position-form-overlay";

    // 创建表单容器
    this.container = document.createElement("div");
    this.container.className = "quick-position-form-container";

    // 创建标题
    const title = document.createElement("div");
    title.textContent = "添加快速定位";
    title.className = "quick-position-form-title";
    this.container.appendChild(title);

    // 创建输入框
    this.titleInput = document.createElement("input");
    this.titleInput.type = "text";
    this.titleInput.placeholder = "请输入标题";
    this.container.appendChild(this.titleInput);

    // 创建按钮容器
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "quick-position-form-buttons";

    // 创建取消按钮
    const cancelButton = document.createElement("button");
    cancelButton.textContent = "取消";
    cancelButton.className = "cancel-btn";
    cancelButton.onclick = () => this.close();
    buttonContainer.appendChild(cancelButton);

    // 创建保存按钮
    const saveButton = document.createElement("button");
    saveButton.textContent = "保存";
    saveButton.className = "save-btn";
    saveButton.onclick = () => this.save();
    buttonContainer.appendChild(saveButton);

    this.container.appendChild(buttonContainer);
    this.overlay.appendChild(this.container);

    // 添加按键监听
    this.titleInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        this.save();
      } else if (e.key === "Escape") {
        this.close();
      }
    });
  }

  open(lng, lat) {
    this.lng = lng;
    this.lat = lat;
    document.getElementById("root").appendChild(this.overlay);
    this.titleInput.focus();
  }

  close() {
    this.overlay.remove();
    this.titleInput.value = "";
  }

  save() {
    const title = this.titleInput.value.trim();
    if (!title) {
      tips.show("请输入地点", "起个好听的名字吧");
      return;
    }

    const position = {
      text: title,
      lng: this.lng,
      lat: this.lat,
      zoom: map.getZoom(),
    };
    allDatas.quickPositions.add(position);
    filterPanel.sider.locationBtn.addLocation(position);
    this.close();
  }
}

// 创建全局实例
const quickPositionForm = new QuickPositionForm();
