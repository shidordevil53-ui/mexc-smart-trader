document.addEventListener("DOMContentLoaded", function () {
  var status = document.getElementById("status");
  var buttons = document.querySelectorAll(".tf");
  var scan = document.getElementById("scan");

  status.textContent = "JavaScript AKTIF.";

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      status.textContent = "Timeframe " + button.dataset.tf + " dipilih.";
    });
  });

  scan.addEventListener("click", function () {
    status.textContent = "TOMBOL SCAN BERFUNGSI.";
  });
});
