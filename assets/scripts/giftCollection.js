let giftCollectionPopup = {
  oneDay: 1000 * 60 * 60 * 24,
  everydayDiamondNum: 90,

  render: function () {
    const contentContainer = document.createElement("div");
    contentContainer.className = "map-action-content-container";
    contentContainer.classList.add("gift-collection");

    // 创建总数栏
    contentContainer.appendChild(this.total.render());

    // 创建详情栏
    const detailContainer = document.createElement("div");
    detailContainer.className = "gift-collection-detail";

    // 创建详情标签栏
    const detailTabContainer = document.createElement("div");
    detailTabContainer.className = "gift-collection-detail-tab";

    const tabs = ["活动", "世界探索", "其他活动"];
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

    this.detailContentArea.appendChild(this.left.render());
    this.detailContentArea.appendChild(this.right.render());

    detailContainer.appendChild(detailTabContainer);
    detailContainer.appendChild(this.detailContentArea);

    contentContainer.appendChild(detailContainer);

    this.setActiveTab(0);
    return contentContainer;
  },

  total: {
    totalContainer: null,
    mainGifts: {},

    eventTotal: {
      diamond: 0,
      gongmingCrystal: 0,
      qishiCrystal: 0,
    },

    explorationTotal: {
      diamond: 0,
      gongmingCrystal: 0,
      qishiCrystal: 0,
    },

    render: function () {
      // 创建总数栏
      this.totalContainer = document.createElement("div");
      this.totalContainer.className = "gift-collection-total";

      this.totalContainer.innerHTML = "<span>共计: </span>";
      this.mainGifts["diamond"] = new MainGift("diamond", "total-gift-item");
      this.mainGifts["gongmingCrystal"] = new MainGift(
        "gongmingCrystal",
        "total-gift-item"
      );
      this.mainGifts["qishiCrystal"] = new MainGift(
        "qishiCrystal",
        "total-gift-item"
      );

      this.totalContainer.appendChild(this.mainGifts["diamond"].giftItem);
      this.totalContainer.appendChild(
        this.mainGifts["gongmingCrystal"].giftItem
      );
      this.totalContainer.appendChild(this.mainGifts["qishiCrystal"].giftItem);

      // 计算event总数
      mapAction.gameEvents.forEach((event) => {
        if (Array.isArray(event.mainGift)) {
          event.mainGift.forEach((gift) => {
            if (this.eventTotal[gift.type]) {
              this.eventTotal[gift.type] += gift.amount;
            } else {
              this.eventTotal[gift.type] = gift.amount;
            }
          });
        }
      });

      // 计算exploration总数
      mapAction.gameExplorations.forEach((exploration) => {
        exploration.items.forEach((item) => {
          if (Array.isArray(item.mainGift)) {
            item.mainGift.forEach((gift) => {
              if (this.explorationTotal[gift.type]) {
                this.explorationTotal[gift.type] += gift.amount * item.total;
              } else {
                this.explorationTotal[gift.type] = gift.amount * item.total;
              }
            });
          }
        });
      });

      return this.totalContainer;
    },

    setTotal: function (tab) {
      const totalMainGifts =
        tab === "event" ? this.eventTotal : this.explorationTotal;

      Object.keys(giftCollectionPopup.total.mainGifts).forEach((type) => {
        if (totalMainGifts[type]) {
          giftCollectionPopup.total.mainGifts[type].setAmount(
            totalMainGifts[type]
          );
        } else {
          giftCollectionPopup.total.mainGifts[type].setAmount(0, true);
        }
      });
    },
  },

  setActiveTab: function (index) {
    if (index === 2) {
      this.total.totalContainer.style.visibility = "hidden";
    } else if (this.activeTab !== index) {
      this.total.totalContainer.style.removeProperty("visibility");
    }
    this.activeTab = index;
    this.tabButtons.forEach((btn, idx) => {
      if (idx === index) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
    if (index === 0) {
      this.right.renderEventsDetail();
      this.left.show("event");
      this.total.setTotal("event");
    } else if (index === 1) {
      this.right.renderExplorationDetail();
      this.left.show("exploration");
      this.total.setTotal("exploration");
    } else if (index === 2) {
      this.right.renderEventsDetail();
      this.left.show("eventOther");
    }
    if (this.left.element.firstChild) {
      this.left.element.firstChild.click();
    } else {
      this.right.clear();
    }
  },

  left: {
    element: null,
    activeElement: null,
    render: function () {
      // 创建详情内容左侧区域
      this.element = document.createElement("div");
      this.element.className = "gift-collection-detail-content-left";
      return this.element;
    },

    show: function (type) {
      this.clear();
      if (type === "event") {
        this.showEventsElements(mapAction.gameEvents);
      } else if (type === "exploration") {
        this.showExplorationsElements();
      } else if (type === "eventOther") {
        this.showEventsElements(mapAction.gameEventsOther);
      }
    },

    showEventsElements: function (datas) {
      const notBeginEvent = [];
      const ongoingEvent = [];
      const endEvent = [];

      datas.forEach((content) => {
        const eventContainer = document.createElement("div");
        eventContainer.className = "gift-collection-detail-element";

        const eventTitle = document.createElement("span");
        eventContainer.appendChild(eventTitle);

        eventContainer.addEventListener("click", () => {
          if (this.activeElement !== eventContainer) {
            if (this.activeElement) {
              this.activeElement.classList.remove("active");
            }
            giftCollectionPopup.right.showEventsDetailRight(datas, content.id);
            eventContainer.classList.add("active");
            this.activeElement = eventContainer;
          }
        });

        const currentDate = new Date();
        const beginDate = new Date(content.beginDate);
        const endDate = new Date(content.endDate);

        // 检查当前日期是否在 beginDate 和 endDate 之间
        if (currentDate < beginDate) {
          // 添加“已结束”字样
          eventTitle.textContent = `${content.name}（未开始）`;
          eventContainer.style.filter = "opacity(0.8)";
          notBeginEvent.push(eventContainer);
        } else if (endDate < currentDate) {
          eventTitle.textContent = `${content.name}（已结束）`;
          eventContainer.style.filter = "opacity(0.5)";
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
      });

      ongoingEvent.forEach((event) => {
        this.element.appendChild(event);
      });

      notBeginEvent.forEach((event) => {
        this.element.appendChild(event);
      });

      endEvent.forEach((event) => {
        this.element.appendChild(event);
      });
    },

    showExplorationsElements: function () {
      // 创建每日任务
      const everydayContainer = document.createElement("div");
      everydayContainer.className = "gift-collection-detail-element";

      const everydayTitle = document.createElement("span");
      everydayTitle.textContent = "【每日任务】朝夕心愿";
      everydayContainer.appendChild(everydayTitle);

      everydayContainer.addEventListener("click", () => {
        if (this.activeElement !== everydayContainer) {
          if (this.activeElement) {
            this.activeElement.classList.remove("active");
          }
          giftCollectionPopup.right.showExplorationsEverydayDetailRight();
          everydayContainer.classList.add("active");
          this.activeElement = everydayContainer;
        }
      });
      this.element.appendChild(everydayContainer);

      // 创建世界探索
      mapAction.gameExplorations.forEach((content) => {
        const eventContainer = document.createElement("div");
        eventContainer.className = "gift-collection-detail-element";

        const eventTitle = document.createElement("span");
        eventTitle.textContent = content.name;
        eventContainer.appendChild(eventTitle);

        eventContainer.addEventListener("click", () => {
          if (this.activeElement !== eventContainer) {
            if (this.activeElement) {
              this.activeElement.classList.remove("active");
            }
            giftCollectionPopup.right.showExplorationsDetailRight(content.id);
            eventContainer.classList.add("active");
            this.activeElement = eventContainer;
          }
        });

        this.element.appendChild(eventContainer);
      });
    },

    clear: function () {
      while (this.element.firstChild) {
        this.element.removeChild(this.element.firstChild);
      }
      this.activeElement = null;
    },
  },

  right: {
    detailArea: null,
    detailMainGiftItem: {},
    render: function () {
      // 创建详情内容右侧区域
      const container = document.createElement("div");
      container.className = "gift-collection-detail-content-right";

      this.detailMainGift = document.createElement("div");
      this.detailMainGift.className = "gift-collection-detail-main-gift";

      this.detailMainGiftItem["diamond"] = new MainGift("diamond", "gift-item");
      this.detailMainGiftItem["gongmingCrystal"] = new MainGift(
        "gongmingCrystal",
        "gift-item"
      );
      this.detailMainGiftItem["qishiCrystal"] = new MainGift(
        "qishiCrystal",
        "gift-item"
      );
      this.detailMainGift.appendChild(
        this.detailMainGiftItem["diamond"].giftItem
      );
      this.detailMainGift.appendChild(
        this.detailMainGiftItem["gongmingCrystal"].giftItem
      );
      this.detailMainGift.appendChild(
        this.detailMainGiftItem["qishiCrystal"].giftItem
      );

      container.appendChild(this.detailMainGift);

      this.detailArea = document.createElement("div");
      this.detailArea.className = "gift-collection-detail-content-right-area";
      container.appendChild(this.detailArea);

      return container;
    },

    renderEventsDetail: function () {
      this.clear();

      this.detailDate = document.createElement("p");
      this.detailMethod = document.createElement("p");
      this.detailDescription = document.createElement("p");
      this.detailOtherGift = document.createElement("p");

      this.detailArea.appendChild(this.detailDate);
      this.detailArea.appendChild(this.detailMethod);
      this.detailArea.appendChild(this.detailDescription);
      this.detailArea.appendChild(this.detailOtherGift);
    },

    showEventsDetailRight: function (datas, id_) {
      const content = datas.get(id_);

      const mainGiftsMap = new Map();
      if (Array.isArray(content.mainGift)) {
        content.mainGift.forEach((gift) => {
          mainGiftsMap.set(gift.type, gift.amount);
        });
      }
      this._showDetailMainGift(mainGiftsMap);

      const endDateTextMap = {
        "2100-12-31": "永久",
        "2999-12-31": "未知",
      };
      const endDateDisplay = endDateTextMap[content.endDate] || content.endDate;
      this.detailDate.textContent = `活动时间：${content.beginDate} 至 ${endDateDisplay}`;

      this.detailMethod.textContent = `获取方式：${content.method}`;

      this.detailDescription.textContent = `活动说明：${content.description}`;

      if (content.otherGift) {
        this.detailOtherGift.textContent = `活动奖励：${content.otherGift.join(
          "、"
        )}`;
      } else {
        this.detailOtherGift.textContent = "";
      }
    },

    renderExplorationDetail: function () {
      this.clear();
    },

    showExplorationsDetailRight: function (id_) {
      this.clear();
      const content = mapAction.gameExplorations.get(id_);
      const totalMainGifts = {
        diamond: 0,
        gongmingCrystal: 0,
        qishiCrystal: 0,
      };

      const descriptions = [];

      content.items.forEach((item) => {
        const description = document.createElement("div");
        description.className =
          "gift-collection-detail-content-right-exploration";
        if (item.total > 1 || item.total == 0) {
          description.textContent = `${item.content}，${sprintf(
            item.contentTotal,
            item.total
          )}`;
        } else {
          description.textContent = item.content;
        }
        descriptions.push(description);

        if (Array.isArray(item.mainGift)) {
          item.mainGift.forEach((gift) => {
            if (totalMainGifts[gift.type]) {
              totalMainGifts[gift.type] += gift.amount * item.total;
            } else {
              totalMainGifts[gift.type] = gift.amount * item.total;
            }
          });
        }
      });

      const mainGiftsMap = new Map();
      Object.keys(totalMainGifts).forEach((type) => {
        if (totalMainGifts[type] > 0) {
          mainGiftsMap.set(type, totalMainGifts[type]);
        }
      });
      this._showDetailMainGift(mainGiftsMap);

      descriptions.forEach((description) => {
        this.detailArea.appendChild(description);
      });
    },

    showExplorationsEverydayDetailRight: function () {
      this.clear();

      const days = giftCollectionPopup._getGameOpenDays();
      this._showDetailMainGift(
        new Map([["diamond", days * giftCollectionPopup.everydayDiamondNum]])
      );

      const description = document.createElement("div");
      description.className =
        "gift-collection-detail-content-right-exploration";
      description.textContent = `完成每日任务可获得【钻石x90】，开服至今共${days}天。`;
      this.detailArea.appendChild(description);
    },

    _showDetailMainGift: function (mainGiftsMap) {
      Object.keys(this.detailMainGiftItem).forEach((type) => {
        if (mainGiftsMap.has(type)) {
          this.detailMainGiftItem[type].setAmount(mainGiftsMap.get(type));
        } else {
          this.detailMainGiftItem[type].setAmount(0);
        }
      });
    },

    clear: function () {
      while (this.detailArea.firstChild) {
        this.detailArea.removeChild(this.detailArea.firstChild);
      }
    },
  },

  _getGameOpenDays: function () {
    const gameStart = new Date("2024-12-05 05:00:00");
    const today = new Date();
    let days = Math.ceil((today - gameStart) / giftCollectionPopup.oneDay);
    if (days < 0) {
      days = 0;
    }
    return days;
  },
};

class MainGift {
  constructor(type, className) {
    const giftItem = document.createElement("div");
    giftItem.className = className;

    const giftIcon = document.createElement("img");
    giftIcon.src = `./assets/icons/${type}.png`; // 确保图标路径正确
    giftIcon.alt = type;

    this.giftAmount = document.createElement("span");
    this.giftAmount.textContent = `x0`;

    giftItem.appendChild(giftIcon);
    giftItem.appendChild(this.giftAmount);
    this.giftItem = giftItem;
  }

  setAmount(amount, alwaysShow = false) {
    this.giftAmount.textContent = `x${amount}`;
    if (amount > 0) {
      this.giftItem.style.display = "flex";
    } else if (!alwaysShow) {
      this.giftItem.style.display = "none";
    }
  }
}
