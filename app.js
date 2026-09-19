alert("APP.JS FILE TERBACA");
document.addEventListener("DOMContentLoaded", function () {
alert("APP.JS AKTIF");
  var status = document.getElementById("status");
  var results = document.getElementById("results");
  var scanButton = document.getElementById("scan");

  var timeframe = "1H";

  var WORKER =
    "https://mexc-smart-proxysolitary-night-616a.shidordevil53.workers.dev";

  var intervalMap = {
    "1H": "60m",
    "4H": "4h",
    "1D": "1d"
  };

  function setStatus(text) {
    status.textContent = text;
  }

  function avg(arr) {
    if (!arr.length) return 0;

    var sum = 0;

    for (var i = 0; i < arr.length; i++) {
      sum += Number(arr[i]);
    }

    return sum / arr.length;
  }

  function ema(values, period) {
    if (values.length < period) return 0;

    var multiplier = 2 / (period + 1);
    var result = avg(values.slice(0, period));

    for (var i = period; i < values.length; i++) {
      result =
        (values[i] - result) * multiplier + result;
    }

    return result;
  }

  function rsi(values, period) {
    if (values.length <= period) return 50;

    var gains = 0;
    var losses = 0;

    for (var i = 1; i <= period; i++) {
      var diff = values[i] - values[i - 1];

      if (diff >= 0) {
        gains += diff;
      } else {
        losses += Math.abs(diff);
      }
    }

    var avgGain = gains / period;
    var avgLoss = losses / period;

    for (var j = period + 1; j < values.length; j++) {
      var change = values[j] - values[j - 1];

      var gain = change > 0 ? change : 0;
      var loss = change < 0 ? Math.abs(change) : 0;

      avgGain =
        ((avgGain * (period - 1)) + gain) / period;

      avgLoss =
        ((avgLoss * (period - 1)) + loss) / period;
    }

    if (avgLoss === 0) return 100;

    var rs = avgGain / avgLoss;

    return 100 - (100 / (1 + rs));
  }

  function analyze(candles) {

    if (!Array.isArray(candles) || candles.length < 60) {
  return {
    score: 0,
    drop: 0,
    baseRange: 0,
    volumeRatio: 0,
    rsi: 0,
    ema20: 0,
    ema50: 0,
    stage: "DATA KURANG",
    tags: []
      };
    }

    var close = [];
    var volume = [];

    for (var i = 0; i < candles.length; i++) {
      close.push(Number(candles[i][4]));
      volume.push(Number(candles[i][5]));
    }

    var current = close[close.length - 1];

    var ema20 = ema(close, 20);
    var ema50 = ema(close, 50);

    var rsi14 = rsi(close, 14);

    var macdFast = ema(close, 12);
    var macdSlow = ema(close, 26);
    var macd = macdFast - macdSlow;

    var recentVol =
      avg(volume.slice(-5));

    var oldVol =
      avg(volume.slice(-25, -5));

    var volumeRatio =
      oldVol > 0 ? recentVol / oldVol : 0;

    var lookback =
      Math.min(100, close.length - 1);

    var oldPrice =
      close[close.length - 1 - lookback];

    var drop =
      ((oldPrice - current) / oldPrice) * 100;

    if (drop < 0) drop = 0;

    var baseClose =
      close.slice(-30);

    var baseHigh =
      Math.max.apply(null, baseClose);

    var baseLow =
      Math.min.apply(null, baseClose);

    var baseRange =
      baseLow > 0
        ? ((baseHigh - baseLow) / baseLow) * 100
        : 999;

    var previousHigh =
      Math.max.apply(
        null,
        close.slice(-21, -1)
      );

    var breakout =
      current > previousHigh;

    var score = 0;
    var tags = [];

    /*
      DROP
    */

    if (drop >= 80) {
      score += 25;
      tags.push("Drop >80%");
    } else if (drop >= 60) {
      score += 20;
      tags.push("Drop >60%");
    } else if (drop >= 40) {
      score += 12;
      tags.push("Drop >40%");
    }

    /*
      BASE
    */

    if (baseRange <= 15) {
      score += 20;
      tags.push("Base rapat");
    } else if (baseRange <= 25) {
      score += 12;
      tags.push("Base");
    }

    /*
      BREAKOUT
    */

    if (breakout) {
      score += 20;
      tags.push("Breakout");
    }

    /*
      VOLUME
    */

    if (volumeRatio >= 2) {
      score += 20;
      tags.push("Volume x2");
    } else if (volumeRatio >= 1.5) {
      score += 15;
      tags.push("Volume kuat");
    } else if (volumeRatio >= 1.2) {
      score += 8;
      tags.push("Volume naik");
function analyze(candles) {

  if (!Array.isArray(candles) || candles.length < 60) {
    return {
      score: 0,
      drop: 0,
      baseRange: 0,
      volumeRatio: 0,
      rsi: 0,
      ema20: 0,
      ema50: 0,
      stage: "DATA KURANG",
      tags: []
    };
  }

  var close = [];
  var volume = [];

  for (var i = 0; i < candles.length; i++) {
    if (!Array.isArray(candles[i]) || candles[i].length < 6) {
      continue;
    }

    var c = Number(candles[i][4]);
    var v = Number(candles[i][5]);

    if (Number.isFinite(c) && Number.isFinite(v) && c > 0) {
      close.push(c);
      volume.push(v);
    }
  }

  if (close.length < 60) {
    return {
      score: 0,
      drop: 0,
      baseRange: 0,
      volumeRatio: 0,
      rsi: 0,
      ema20: 0,
      ema50: 0,
      stage: "DATA KURANG",
      tags: []
    };
  }

  var current = close[close.length - 1];

  /* =========================
     TREND
  ========================= */

  var ema20 = ema(close, 20);
  var ema50 = ema(close, 50);
  var rsi14 = rsi(close, 14);

  var macdFast = ema(close, 12);
  var macdSlow = ema(close, 26);
  var macd = macdFast - macdSlow;

  /* =========================
     HISTORICAL DROP
  ========================= */

  var peakEnd = Math.max(20, close.length - 30);
  var historicalPrices = close.slice(0, peakEnd);

  var peakPrice = Math.max.apply(null, historicalPrices);

  var drop = 0;

  if (peakPrice > 0 && current < peakPrice) {
    drop = ((peakPrice - current) / peakPrice) * 100;
  }

  /* =========================
     BASE 40 CANDLE
  ========================= */

  var baseClose = close.slice(-40);

  var baseHigh = Math.max.apply(null, baseClose);
  var baseLow = Math.min.apply(null, baseClose);

  var baseRange = 999;

  if (baseLow > 0) {
    baseRange =
      ((baseHigh - baseLow) / baseLow) * 100;
  }

  /* =========================
     BASE VOLUME CONTRACTION
  ========================= */

  var baseEarlyVol =
    avg(volume.slice(-40, -20));

  var baseLateVol =
    avg(volume.slice(-20));

  var volumeContracting =
    baseEarlyVol > 0 &&
    baseLateVol < baseEarlyVol * 0.90;

  /* =========================
     BREAKOUT RESISTANCE
  ========================= */

  var previousCloses =
    close.slice(-21, -1);

  var resistance =
    Math.max.apply(null, previousCloses);

  var breakout =
    current > resistance * 1.002;

  /* =========================
     BREAKOUT VOLUME
  ========================= */

  var previousVolume =
    avg(volume.slice(-21, -1));

  var breakoutVolumeRatio =
    previousVolume > 0
      ? volume[volume.length - 1] / previousVolume
      : 0;

  /* =========================
     RECENT BREAKOUT
  ========================= */

  var recentBreakout = false;

  var breakoutIndex = -1;

  for (
    var b = Math.max(20, close.length - 15);
    b < close.length;
    b++
  ) {

    var prior20 =
      close.slice(Math.max(0, b - 20), b);

    if (prior20.length < 20) {
      continue;
    }

    var priorResistance =
      Math.max.apply(null, prior20);

    if (close[b] > priorResistance * 1.002) {
      recentBreakout = true;
      breakoutIndex = b;
    }
  }

  /* =========================
     RETEST DETECTION
  ========================= */

  var retest = false;

  if (recentBreakout && breakoutIndex >= 0) {

    var retestStart =
      Math.max(breakoutIndex + 1, close.length - 8);

    for (
      var r = retestStart;
      r < close.length;
      r++
    ) {

      var candleLow =
        Number(candles[r] && candles[r][3]);

      if (!Number.isFinite(candleLow)) {
        continue;
      }

      if (
        candleLow <= resistance * 1.02 &&
        close[r] >= resistance * 0.98
      ) {
        retest = true;
      }
    }
  }

  /* =========================
     HIGHER LOW
  ========================= */

  var recentLow =
    Math.min.apply(null, close.slice(-8));

  var previousLow =
    Math.min.apply(null, close.slice(-16, -8));

  var higherLow =
    recentLow > previousLow;

  /* =========================
     SCORING
  ========================= */

  var score = 0;
  var tags = [];

  /* DROP */

  if (drop >= 90) {
    score += 25;
    tags.push("Drop >90%");
  } else if (drop >= 80) {
    score += 23;
    tags.push("Drop >80%");
  } else if (drop >= 70) {
    score += 20;
    tags.push("Drop >70%");
  } else if (drop >= 50) {
    score += 15;
    tags.push("Drop >50%");
  } else if (drop >= 30) {
    score += 8;
    tags.push("Drop >30%");
  }

  /* BASE */

  if (baseRange <= 10) {
    score += 20;
    tags.push("Base sangat rapat");
  } else if (baseRange <= 15) {
    score += 17;
    tags.push("Base rapat");
  } else if (baseRange <= 25) {
    score += 12;
    tags.push("Base");
  } else if (baseRange <= 35) {
    score += 5;
    tags.push("Base lebar");
  }

  /* VOLUME BASE */

  if (volumeContracting) {
    score += 8;
    tags.push("Volume base mengecil");
  }

  /* BREAKOUT */

  if (breakout) {
    score += 18;
    tags.push("Breakout");
  }

  /* BREAKOUT VOLUME */

  if (breakoutVolumeRatio >= 3) {
    score += 15;
    tags.push("Volume breakout x3");
  } else if (breakoutVolumeRatio >= 2) {
    score += 12;
    tags.push("Volume breakout x2");
  } else if (breakoutVolumeRatio >= 1.5) {
    score += 8;
    tags.push("Volume breakout kuat");
  }

  /* TREND */

  if (current > ema20) {
    score += 5;
    tags.push("Di atas EMA20");
  }

  if (ema20 > ema50) {
    score += 5;
    tags.push("EMA20 > EMA50");
  }

  /* HIGHER LOW */

  if (higherLow) {
    score += 4;
    tags.push("Higher Low");
  }

  /* RSI */

  if (rsi14 >= 45 && rsi14 <= 70) {
    score += 5;
    tags.push("RSI sehat");
  } else if (rsi14 > 70 && rsi14 <= 78) {
    score += 2;
    tags.push("RSI mulai panas");
  } else if (rsi14 > 78) {
    score -= 0;
    tags.push("RSI tinggi");
  }

  /* MACD */

  if (macd > 0) {
    score += 5;
    tags.push("MACD positif");
  }

  /* RETEST BONUS */

  if (retest) {
    score += 15;
    tags.push("Retest valid");
  }

  if (score > 100) {
    score = 100;
  }

  /* =========================
     STAGE
  ========================= */

  var stage = "WATCH";

  if (
    retest &&
    current >= ema20 &&
    ema20 >= ema50
  ) {

    stage = "RETEST → MARKUP";

  } else if (
    breakout &&
    breakoutVolumeRatio >= 1.5 &&
    current > ema20
  ) {

    stage = "BREAKOUT → MARKUP";

  } else if (
    baseRange <= 25 &&
    volumeContracting
  ) {

    stage = "BASE → SIAP BREAKOUT";

  } else if (
    drop >= 50 &&
    baseRange <= 35
  ) {

    stage = "DROP → BASE";

  } else if (
    current > ema20 &&
    ema20 > ema50
  ) {

    stage = "MARKUP";

  }

  return {
    score: score,
    drop: drop,
    baseRange: baseRange,
    volumeRatio: breakoutVolumeRatio,
    rsi: rsi14,
    ema20: ema20,
    ema50: ema50,
    stage: stage,
    tags: tags
  };
}

  function render(item) {
  var a = item && item.analysis ? item.analysis : {};

  function n(v) {
    var x = Number(v);
    return Number.isFinite(x) ? x : 0;
  }

  var score = n(a.score);
  var drop = n(a.drop);
  var baseRange = n(a.baseRange);
  var rsi = n(a.rsi);
  var volumeRatio = n(a.volumeRatio);
  var stage = a.stage || "WATCH";
  var tags = Array.isArray(a.tags) ? a.tags : [];

  return (
    '<div class="coin">' +
      '<div class="row">' +
        '<strong>' + (item.symbol || "UNKNOWN") + '</strong>' +
        '<span class="score">' + score.toFixed(0) + '/100</span>' +
      '</div>' +

      '<div>' + stage + '</div>' +

      '<div>' +
        'Drop: ' + drop.toFixed(1) +
        '% • Base: ' + baseRange.toFixed(1) + '%' +
      '</div>' +

      '<div>' +
        'RSI: ' + rsi.toFixed(1) +
        ' • Vol: x' + volumeRatio.toFixed(2) +
      '</div>' +

      '<div class="bar">' +
        '<div class="fill" style="width:' + score + '%"></div>' +
      '</div>' +

      '<div>' + tags.join(" • ") + '</div>' +
    '</div>'
  );
  }
  async function getSymbols() {

    var response = await fetch(
      WORKER +
      "/api/v3/ticker/24hr"
    );

    if (!response.ok) {
      throw new Error(
        "Gagal mengambil ticker MEXC."
      );
    }

    var data =
      await response.json();

    var list = [];

    for (var i = 0; i < data.length; i++) {

      var item = data[i];

      if (
        item.symbol &&
        item.symbol.endsWith("USDT")
      ) {

        var volume =
          Number(item.quoteVolume || 0);

        if (volume > 0) {

          list.push({
            symbol: item.symbol,
            volume: volume
          });

        }
      }
    }

    list.sort(function (a, b) {
      return b.volume - a.volume;
    });

    /*
      Batasi pair agar HP tidak terlalu berat.
      Nanti bisa kita naikkan.
    */

    return list
      .slice(0, 40)
      .map(function (x) {
        return x.symbol;
      });
  }

  async function getKlines(symbol) {

    var interval =
      intervalMap[timeframe];

    var url =
      WORKER +
      "/api/v3/klines" +
      "?symbol=" +
      encodeURIComponent(symbol) +
      "&interval=" +
      interval +
      "&limit=120";

    var response =
      await fetch(url);

    if (!response.ok) {
      throw new Error(
        "Kline gagal: " + symbol
      );
    }

    return await response.json();
  }

  async function scanMarket() {

    scanButton.disabled = true;

    results.innerHTML = "";

    try {

      setStatus(
        "Mengambil daftar pair MEXC..."
      );

      var symbols =
        await getSymbols();

      setStatus(
        "Ditemukan " +
        symbols.length +
        " pair. Memulai scan..."
      );

      var resultList = [];

      for (
        var i = 0;
        i < symbols.length;
        i++
      ) {

        var symbol = symbols[i];

        setStatus(
          "Scanning " +
          (i + 1) +
          "/" +
          symbols.length +
          " • " +
          symbol
        );

        try {

          var candles =
            await getKlines(symbol);

          var analysis =
            analyze(candles);

          resultList.push({
            symbol: symbol,
            analysis: analysis
          });

        } catch (error) {

          console.log(
            "Skip " + symbol,
            error
          );

        }

        await new Promise(
          function (resolve) {
            setTimeout(resolve, 150);
          }
        );
      }

      resultList.sort(
        function (a, b) {
          return (
            b.analysis.score -
            a.analysis.score
          );
        }
      );

      var html = "";

      for (
        var j = 0;
        j < resultList.length;
        j++
      ) {

        html +=
          render(resultList[j]);

      }

      results.innerHTML =
        html ||
        "<p>Tidak ada data.</p>";

      setStatus(
        "SCAN LIVE SELESAI • " +
        timeframe +
        " • " +
        resultList.length +
        " pair."
      );

    } catch (error) {

      console.error(error);

      setStatus(
        "ERROR: " +
        error.message
      );

      results.innerHTML =
        "<p>Gagal mengambil data MEXC.</p>";
    }

    scanButton.disabled = false;
  }

  document
    .querySelectorAll(".tf")
    .forEach(function (button) {

      button.addEventListener(
        "click",
        function () {

          document
            .querySelectorAll(".tf")
            .forEach(function (x) {
              x.classList.remove("active");
            });

          button.classList.add("active");

          timeframe =
            button.dataset.tf;

          setStatus(
            "Timeframe " +
            timeframe +
            " dipilih."
          );
        }
      );

    });

  scanButton.addEventListener(
    "click",
    scanMarket
  );

  setStatus(
    "LIVE MEXC siap. Tekan Scan."
  );

});
