class MarkerPopupContent {
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
    copyBtn.classList.add("clipboard-btn");
    copyBtn.title = "复制位置链接";
    leftContainer.appendChild(copyBtn);

    // 创建编辑按钮
    const editBtn = document.createElement("div");
    editBtn.className = "marker-popup-edit-marker-btn";

    editBtn.addEventListener("click", () => {
      editForm.open(
        parseInt(editBtn.dataset.markerId),
        parseInt(editBtn.dataset.categoryId),
        "edit"
      );
      markerPopup.close();
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
      const markerId = parseInt(editBtn.dataset.markerId);
      const categoryId = parseInt(editBtn.dataset.categoryId);
      doAfterIgnoreClick(markerId, categoryId);
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
    this.updateHeader(
      marker.name,
      marker.updateTime,
      marker.id,
      marker.categoryId
    );
    this.updateImage(marker.image);
    this.updateDescription(marker.description);
    this.updateVideo(marker.video);
    this.updateAuthor(marker.author, marker.authorLink);
    this.setIgnoreCheckBoxState(marker.id, marker.categoryId);
  }

  updateHeader(name, updateTime, markerId, categoryId) {
    this.title.textContent = name || `Marker ${markerId}`;

    const location_url = `${window.location.origin}${window.location.pathname}?locationId=${markerId}`;
    this.copyBtn.setAttribute("data-clipboard-text", location_url);

    this.editBtn.setAttribute("data-marker-id", markerId);
    this.editBtn.setAttribute("data-category-id", categoryId);
    this.setEditBtnState();

    this.updateTime.textContent = `(更新时间：${updateTime || "未知"})`;
  }

  updateImage(image) {
    this.imageContainer.innerHTML = "";
    if (image) {
      // 清除旧内容
      this.imageContainer.innerHTML = '<div class="loading-spinner"></div>';

      const img = new Image();
      var imgUrl = image;
      if ((image.match(/\./g)?.length || 0) === 1) {
        imgUrl = resourceControl.getMarkerImageFilePath(image);
      } else if (!image.startsWith("https://image.nikkimomo.cc")) {
        img.crossOrigin = "Anonymous";
      }
      img.src = imgUrl;
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

  updateDescription(description) {
    this.description.textContent = description || "暂无描述";
  }

  updateVideo(video) {
    this.videoContainer.innerHTML = "";
    if (video) {
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
        videoIframe.src = `//player.bilibili.com/player.html?bvid=${video}`;
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

  updateAuthor(author, authorLink) {
    let authorWrapper = author
      ? author === "default"
        ? "黄大胖不胖"
        : author
      : "佚名";
    if (author === "default" || authorLink) {
      const authorLinkElement = document.createElement("a");
      authorLinkElement.target = "_blank"; // 新窗口打开
      authorLinkElement.href =
        author === "default"
          ? "https://space.bilibili.com/619196/"
          : authorLink;

      authorLinkElement.textContent = authorWrapper;

      // 组装作者信息
      this.author.textContent = "贡献者： ";
      this.author.appendChild(authorLinkElement);
    } else {
      this.author.textContent = "贡献者： " + authorWrapper;
    }
  }

  setIgnoreCheckBoxState(markerId, categoryId) {
    const ignore =
      allDatas.ignoreMarkers.data.get(categoryId)?.has(markerId) || false;
    this.checkbox.checked = ignore;
  }

  setEditBtnState() {
    const categoryId = this.editBtn.dataset.categoryId;
    if (!developmentMode && !allDatas.isPersonalCategory(categoryId)) {
      this.editBtn.classList.add("develop-inactive");
    } else {
      this.editBtn.classList.remove("develop-inactive");
    }
  }
}
