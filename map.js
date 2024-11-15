// 假设你的图片是 32768x32768 像素
var imageWidth = 32768;
var imageHeight = 32768;

// 设置图片的边界
var bounds = [
  [0, 0],
  [1, 1],
];

// 使用简单坐标系统，并设置图片的边界
var CustomCRS = L.extend({}, L.CRS.Simple, {
  transformation: new L.Transformation(2 ** 8, 0, 2 ** 8, 0),
});

var map = L.map("map", {
  crs: CustomCRS,
  attributionControl: false,
  zoomControl: false,
  minZoom: 2,
  maxZoom: 7,
  maxBounds: bounds,
  zoomAnimation: true, // 启用缩放动画
  markerZoomAnimation: true, // 启用标记缩放动画
  detectRetina: true,
});

L.tileLayer("assets/tiles/{z}/{x}/{y}.jpg", {
  tileSize: 256,
  bounds: bounds,
  minZoom: 2,
  maxZoom: 7,
  zoomOffset: 0,
  noWrap: false, // 防止瓦片重复
  updateWhenZooming: false, // 缩放时不更新瓦片
  updateWhenIdle: false, // 仅在空闲时更新瓦片
  keepBuffer: 2, // 保持缓冲瓦片数
  loadDelay: 100,
  updateInterval: 200,
}).addTo(map);

map.setView([0.5, 0.5], 3);

new L.Control.Zoomslider({
  position: "bottomright", // 放大缩小按钮的位置
  stepHeight: 20,
  knobHeight: 20,
}).addTo(map);

// 创建自定义图标
var customIcon = L.icon({
  iconUrl: "assets/1.png", // 确认此路径正确
  iconSize: [32, 32], // 图标尺寸
  iconAnchor: [16, 32], // 图标锚点（图标底部的点）
  popupAnchor: [0, -32], // 弹出框相对于图标的位置
});

// 存储所有标记的数组
var markers = [];

var markersData = [];

// 加载已保存的标记
function loadMarkers() {
  $.get("/markers", function (savedMarkers) {
    savedMarkers.forEach(function (markerData) {
      var marker = L.marker([markerData.lat, markerData.lng], {
        icon: customIcon,
      })
        .addTo(map)
        .bindPopup(
          `
    <div class="popup-content">
<img src="${markerData.imageUrl}" alt="Image">
<div class="text"><h3>${markerData.text}</h3></div>
<button onclick="removeMarker(${markers.length})">删除标记</button>
    </div>`
        )
        .bindTooltip(markerData.text); // 绑定工具提示
      markers.push(marker);
    });
  });
}

// 保存标记到服务器
function saveMarkers() {
  var markerData = markers
    .map((marker) => {
      if (marker) {
        var popupContent = marker.getPopup().getContent();
        var imageUrl = $(popupContent).find("img").attr("src");
        var text = $(popupContent).find(".text").text();
        return {
          lat: marker.getLatLng().lat,
          lng: marker.getLatLng().lng,
          imageUrl: imageUrl,
          text: text,
        };
      }
      return null;
    })
    .filter((marker) => marker !== null);

  $.post("/markers", JSON.stringify(markerData), null, "json");
}

// 在地图上添加标记并记录坐标和弹出框信息
map.on("contextmenu", function (e) {
  var latlng = e.latlng;
  var imageUrl = prompt("请输入图片URL：");
  var text = prompt("请输入文字信息：");
  var marker = L.marker([latlng.lat, latlng.lng], { icon: customIcon })
    .addTo(map)
    .bindPopup(
      `
    <div class="popup-content">
<img src="${imageUrl}" alt="Image">
<div class="text"><h3>${text}</h3></div>
<div class="text">标记位置：纬度 ${latlng.lat.toFixed(
        2
      )}, 经度 ${latlng.lng.toFixed(2)}</div>
<button onclick="removeMarker(${markers.length})">删除标记</button>
    </div>`
    )
    .bindTooltip(text, { direction: "right", offset: [16, -16] }) // 绑定工具提示
    .openPopup();

  var markerData = {
    lat: latlng.lat,
    lng: latlng.lng,
    imageUrl: imageUrl,
    text: text,
  };
  markersData.push(markerData);

  // 存储标记到数组中
  markers.push(marker);
});
