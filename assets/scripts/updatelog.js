let updateLogPopup = {
  render: function () {
    const contentContainer = document.createElement("div");
    contentContainer.className = "map-action-content-container";
    // 创建标签栏
    const tabContainer = document.createElement("div");
    tabContainer.className = "update-dialog-tab";

    const tabs = ["说明", "功能更新"];
    this.tabContents = [
      mapActionBtns.announcements,
      mapActionBtns.functionalUpdates,
    ];

    this.activeTab = 0;
    this.tabButtons = [];
    tabs.forEach((tabName, index) => {
      const tabButton = document.createElement("div");
      tabButton.className = "update-dialog-tab-button";
      tabButton.textContent = tabName;
      if (index === this.activeTab) {
        tabButton.classList.add("active");
      }
      tabButton.onclick = () => {
        this.setActiveTab(index);
      };
      tabContainer.appendChild(tabButton);
      this.tabButtons.push(tabButton);
    });
    contentContainer.appendChild(tabContainer);

    // 创建内容区域
    this.contentArea = document.createElement("div");
    this.contentArea.className = "update-dialog-text";
    this.showContent();

    contentContainer.appendChild(this.contentArea);
    return contentContainer;
  },

  setActiveTab: function (index) {
    this.activeTab = index;
    this.tabButtons.forEach((btn, idx) => {
      if (idx === index) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
    this.showContent(this.activeTab);
  },

  showContent: function () {
    while (this.contentArea.firstChild) {
      this.contentArea.removeChild(this.contentArea.firstChild);
    }

    const contents = this.tabContents[this.activeTab];

    contents.forEach((content) => {
      const contentElement = document.createElement("p");
      const contentSpan = document.createElement("span");
      if (content.content) {
        contentSpan.textContent = content.content;
      } else {
        contentElement.style.minHeight = "1.5em";
      }

      contentElement.appendChild(contentSpan);
      this.contentArea.appendChild(contentElement);
    });
  },
};
