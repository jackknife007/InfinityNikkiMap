let giftCollectionPopup = {
  oneDay: 1000 * 60 * 60 * 24,
  activeElement: null,
  render: function () {
    const contentContainer = document.createElement("div");
    contentContainer.className = "map-action-content-container";
    contentContainer.classList.add("gift-collection");

    // 创建总数栏
    this.totalContainer = document.createElement("div");
    this.totalContainer.className = "gift-collection-total";

    this.displayTotalMainGifts();

    // 创建详情栏
    const detailContainer = document.createElement("div");
    detailContainer.className = "gift-collection-detail";

    // 创建详情标签栏
    const detailTabContainer = document.createElement("div");
    detailTabContainer.className = "gift-collection-detail-tab";

    const tabs = ["活动", "世界探索"];
    this.activeTab = 0;
    this.tabButtons = [];
    tabs.forEach((tabName, index) => {
      const tabButton = document.createElement("div");
      tabButton.className = "gift-collection-detail-tab-button";
      tabButton.textContent = tabName;
      if (index === this.activeTab) {
        tabButton.classList.add("active");
      }
      tabButton.onclick = () => {
        this.setActiveTab(index);
      };
      detailTabContainer.appendChild(tabButton);
      this.tabButtons.push(tabButton);
    });

    // 创建详情内容区域
    this.detailContentArea = document.createElement("div");
    this.detailContentArea.className = "gift-collection-detail-content";

    // 创建详情内容左侧区域
    this.detailContentLeft = document.createElement("div");
    this.detailContentLeft.className = "gift-collection-detail-content-left";

    // 创建详情内容右侧区域
    this.detailContentRight = document.createElement("div");
    this.detailContentRight.className = "gift-collection-detail-content-right";

    this.detailMainGift = document.createElement("div");
    this.detailMainGift.className = "gift-collection-detail-main-gift";

    this.detailDate = document.createElement("p");
    this.detailMethod = document.createElement("p");
    this.detailDescription = document.createElement("p");
    this.detailOtherGift = document.createElement("p");

    this.detailImg = document.createElement("img");
    this.detailImg.className = "gift-collection-detail-img";

    this.detailContentRight.appendChild(this.detailMainGift);
    this.detailContentRight.appendChild(this.detailDate);
    this.detailContentRight.appendChild(this.detailMethod);
    this.detailContentRight.appendChild(this.detailDescription);
    this.detailContentRight.appendChild(this.detailOtherGift);
    this.detailContentRight.appendChild(this.detailImg);

    this.detailContentArea.appendChild(this.detailContentLeft);
    this.detailContentArea.appendChild(this.detailContentRight);

    detailContainer.appendChild(detailTabContainer);
    detailContainer.appendChild(this.detailContentArea);

    contentContainer.appendChild(this.totalContainer);
    contentContainer.appendChild(detailContainer);

    this.setActiveTab(0);
    return contentContainer;
  },

  displayTotalMainGifts: function () {
    const totalMainGifts = {
      diamond: 0,
      gongmingCrystal: 0,
      qishiCrystal: 0,
    };

    mapAction.gameEvents.forEach((event) => {
      if (Array.isArray(event.mainGift)) {
        event.mainGift.forEach((gift) => {
          if (totalMainGifts[gift.type]) {
            totalMainGifts[gift.type] += gift.amount;
          } else {
            totalMainGifts[gift.type] = gift.amount;
          }
        });
      }
    });

    this.totalContainer.innerHTML = "<span>共计: </span>";

    const giftsContainer = document.createElement("div");
    giftsContainer.className = "total-gifts-container";

    Object.keys(totalMainGifts).forEach((type) => {
      const giftItem = document.createElement("div");
      giftItem.className = "total-gift-item";

      const giftIcon = document.createElement("img");
      giftIcon.src = `./assets/icons/${type}.png`;
      giftIcon.alt = type;
      giftIcon.className = "total-gift-icon";

      const giftAmount = document.createElement("span");
      giftAmount.textContent = `x${totalMainGifts[type]}`;
      giftAmount.className = "total-gift-amount";

      giftItem.appendChild(giftIcon);
      giftItem.appendChild(giftAmount);
      giftsContainer.appendChild(giftItem);
    });

    this.totalContainer.appendChild(giftsContainer);
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
    if (index === 0) {
      this.showEventsDetailLeft();
    } else if (index === 1) {
      this.showExplorationsDetailLeft();
    }
    if (this.detailContentLeft.firstChild) {
      this.detailContentLeft.firstChild.click();
    } else {
      this.clearEventsDetailRight();
    }
  },

  showEventsDetailLeft: function () {
    while (this.detailContentLeft.firstChild) {
      this.detailContentLeft.removeChild(this.detailContentLeft.firstChild);
    }

    mapAction.gameEvents.forEach((content) => {
      const eventContainer = document.createElement("div");
      eventContainer.className = "gift-collection-detail-element";

      const eventTitle = document.createElement("span");
      eventContainer.appendChild(eventTitle);

      eventContainer.addEventListener("click", () => {
        if (this.activeElement !== eventContainer) {
          if (this.activeElement) {
            this.activeElement.classList.remove("active");
          }
          this.showEventsDetailRight(content.id);
          eventContainer.classList.add("active");
          this.activeElement = eventContainer;
        }
      });

      const currentDate = new Date();
      const beginDate = new Date(content.beginDate);
      const endDate = new Date(content.endDate);
      const notBeginEvent = [];
      const ongoingEvent = [];
      const endEvent = [];

      // 检查当前日期是否在 beginDate 和 endDate 之间
      if (currentDate < beginDate) {
        // 添加“已结束”字样
        eventTitle.textContent = `${content.name}（未开始）`;
        notBeginEvent.push(eventContainer);
      } else if (endDate < currentDate) {
        eventTitle.textContent = `${content.name}（已结束）`;
        endEvent.push(eventContainer);
      } else {
        const timeDiff = endDate - currentDate;
        const daysDiff = Math.ceil(timeDiff / this.oneDay);

        if (daysDiff <= 1) {
          // 添加“最后一天”字样
          eventTitle.textContent = `${content.name}（最后一天）`;
        } else if (daysDiff <= 3) {
          // 添加“即将结束”字样
          eventTitle.textContent = `${content.name}（即将结束）`;
        } else {
          // 添加“进行中”字样
          eventTitle.textContent = `${content.name}（进行中）`;
        }
        ongoingEvent.push(eventContainer);
      }

      ongoingEvent.forEach((event) => {
        this.detailContentLeft.appendChild(event);
      });

      notBeginEvent.forEach((event) => {
        this.detailContentLeft.appendChild(event);
      });

      endEvent.forEach((event) => {
        this.detailContentLeft.appendChild(event);
      });
    });
  },

  showEventsDetailRight: function (id_) {
    const content = mapAction.gameEvents.get(id_);
    this.showEventsDetailMaingift(content);
    this.showEventsDetailDate(content);
    this.detailMethod.textContent = `获取方式：${content.method}`;
    this.detailDescription.textContent = `活动说明：${content.description}`;
    if (content.otherGift) {
      this.detailOtherGift.textContent = `活动奖励：${content.otherGift.join(
        "、"
      )}`;
    } else {
      this.detailOtherGift.textContent = "";
    }
    //this.detailImg.src = content.img;
  },

  showEventsDetailMaingift: function (content) {
    while (this.detailMainGift.firstChild) {
      this.detailMainGift.removeChild(this.detailMainGift.firstChild);
    }

    if (content.mainGift) {
      content.mainGift.forEach((gift) => {
        const giftItem = document.createElement("div");
        giftItem.className = "gift-item";

        const giftIcon = document.createElement("img");
        giftIcon.src = `./assets/icons/${gift.type}.png`; // 确保图标路径正确
        giftIcon.alt = gift.type;
        giftIcon.className = "gift-icon";

        const giftAmount = document.createElement("span");
        giftAmount.textContent = `x${gift.amount}`;
        giftAmount.className = "gift-amount";

        giftItem.appendChild(giftIcon);
        giftItem.appendChild(giftAmount);
        this.detailMainGift.appendChild(giftItem);
      });
    }
  },

  showEventsDetailDate: function (content) {
    const endDateTextMap = {
      "2100-12-31": "永久",
      "2999-12-31": "未知",
    };

    const endDateDisplay = endDateTextMap[content.endDate] || content.endDate;
    this.detailDate.textContent = `活动时间：${content.beginDate} 至 ${endDateDisplay}`;
  },

  showExplorationsDetailLeft: function () {
    while (this.detailContentLeft.firstChild) {
      this.detailContentLeft.removeChild(this.detailContentLeft.firstChild);
    }
  },

  clearEventsDetailRight: function () {
    this.detailMainGift.textContent = "";
    this.detailDate.textContent = "";
    this.detailMethod.textContent = "";
    this.detailDescription.textContent = "";
    this.detailOtherGift.textContent = "";
  },
};
