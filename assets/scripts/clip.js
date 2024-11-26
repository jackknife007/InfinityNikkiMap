var clipboardBtn = new ClipboardJS(".clipboard-btn");

clipboardBtn.on("success", function (e) {
  e.clearSelection();

  tips.show(`复制成功<br>${e.text}`);
});
clipboardBtn.on("error", function (e) {
  console.error("Action:", e.action);
  console.error("Trigger:", e.trigger);
  //showTooltip(e.trigger, fallbackMessage(e.action));
});

let tips = {
  render: function () {
    this.element = document.createElement("div");
    this.element.className = "tips";
    document.body.appendChild(this.element);
  },

  show(text) {
    this.element.innerHTML = text;
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
