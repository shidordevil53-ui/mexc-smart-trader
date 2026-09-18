document.addEventListener("DOMContentLoaded", function () {

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
    }

    /*
      TREND
    */

    if (current > ema20) {
      score += 5;
      tags.push("Di atas EMA20");
    }

    if (ema20 > ema50) {
      score += 5;
      tags.push("EMA20 > EMA50");
    }

    /*
      RSI
    */

    if (rsi14 >= 45 && rsi14 <= 70) {
      score += 5;
      tags.push("RSI sehat");
    }

    /*
      MACD
    */

    if (macd > 0) {
      score += 5;
      tags.push("MACD positif");
    }

    if (score > 100) score = 100;

    var stage = "WATCH";

    if (
      breakout &&
      volumeRatio >= 1.5 &&
      current > ema20
    ) {
      stage = "BREAKOUT → MARKUP";
    } else if (
      current > ema20 &&
      ema20 >= ema50
    ) {
      stage = "RETEST → MARKUP";
    } else if (
      baseRange <= 25
    ) {
      stage = "BASE → BREAKOUT";
    } else if (
      drop >= 40
    ) {
      stage = "DROP → BASE";
    }

    return {
      score: score,
      drop: drop,
      baseRange: baseRange,
      volumeRatio: volumeRatio,
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
