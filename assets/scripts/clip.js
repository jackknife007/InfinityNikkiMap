var clipboardBtn = new ClipboardJS(".clipboard-btn");

// 处理触摸事件
document.querySelectorAll('.clipboard-btn').forEach(function(btn) {
  btn.addEventListener('touchstart', function(e) {
    e.preventDefault();
    clipboardBtn.onClick(e);
  });
});

clipboardBtn.on("success", function (e) {
  e.clearSelection();

  tips.show("复制成功", e.text);
});
clipboardBtn.on("error", function (e) {
  console.error("Action:", e.action);
  console.error("Trigger:", e.trigger);
  tips.show("复制失败", fallbackMessage(e.action));
});

let tips = {
  render: function () {
    this.element = document.createElement("div");
    this.element.className = "tips";

    this.title = document.createElement("div");
    this.className = "tips-title";
    this.element.appendChild(this.title);

    this.content = document.createElement("div");
    this.className = "tips-content";
    this.element.appendChild(this.content);

    document.body.appendChild(this.element);
  },

  show(title, content) {
    this.title.textContent = title;
    this.content.textContent = content;
    this.element.style.visibility = "visible";
    this.element.style.opacity = "1";

    // 3秒后隐藏提示框
    setTimeout(() => {
      this.element.style.opacity = "0";
      setTimeout(() => {
        this.element.style.visibility = "hidden";
      }, 500);
    }, 3000);
  },
};
