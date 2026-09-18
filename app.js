const demo = [
  {
    symbol: "IOST/USDT",
    score: 86,
    drop: 91,
    stage: "RETEST → MARKUP",
    tags: ["Base panjang", "Breakout volume", "Retest"]
  },
  {
    symbol: "POWR/USDT",
    score: 82,
    drop: 78,
    stage: "BREAKOUT → RETEST",
    tags: ["Akumulasi", "Volume naik", "Breakout"]
  },
  {
    symbol: "NEAR/USDT",
    score: 76,
    drop: 61,
    stage: "BASE → BREAKOUT",
    tags: ["Base", "Momentum", "Volume"]
  }
];

let timeframe = "1H";

const results = document.getElementById("results");
const status = document.getElementById("status");

function render() {
  results.innerHTML = demo.map(function(c) {
    return `
      <div class="coin">
        <div class="row">
          <strong>${c.symbol}</strong>
          <span class="score">${c.score}/100</span>
        </div>

        <div>
          ${c.stage} • Drop ${c.drop}%
        </div>

        <div class="bar">
          <div class="fill" style="width:${c.score}%"></div>
        </div>

        <div>
          ${c.tags.map(function(t) {
            return `<span class="tag">${t}</span>`;
          }).join("")}
        </div>
      </div>
    `;
  }).join("");
}

document.querySelectorAll(".tf").forEach(function(button) {
  button.addEventListener("click", function() {

    document.querySelectorAll(".tf").forEach(function(x) {
      x.classList.remove("active");
    });

    button.classList.add("active");

    timeframe = button.dataset.tf;

    status.textContent =
      "Timeframe " + timeframe + " dipilih.";
  });
});

document.getElementById("scan").addEventListener("click", function() {

  status.textContent =
    "Scanning demo " + timeframe + "...";

  setTimeout(function() {

    status.textContent =
      "Scan selesai (" + timeframe +
      "). Data masih DEMO, belum data live MEXC.";

    render();

  }, 600);
});

render();
