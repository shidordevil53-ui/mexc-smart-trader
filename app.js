document.addEventListener("DOMContentLoaded", function () {

  var status = document.getElementById("status");
  var results = document.getElementById("results");
  var scanButton = document.getElementById("scan");

  var timeframe = "1H";

  var intervalMap = {
    "1H": "60m",
    "4H": "4h",
    "1D": "1d"
  };

  function setStatus(text) {
    status.textContent = text;
  }

  function average(values) {
    if (!values.length) return 0;

    var total = 0;

    for (var i = 0; i < values.length; i++) {
      total += values[i];
    }

    return total / values.length;
  }

  function calculateScore(candles) {

    if (candles.length < 50) {
      return {
        score: 0,
        stage: "DATA KURANG",
        tags: []
      };
    }

    var closes = [];
    var volumes = [];

    for (var i = 0; i < candles.length; i++) {
      closes.push(Number(candles[i][4]));
      volumes.push(Number(candles[i][5]));
    }

    var current = closes[closes.length - 1];

    var lookback = Math.min(100, closes.length - 1);
    var oldPrice = closes[closes.length - 1 - lookback];

    var drop = ((oldPrice - current) / oldPrice) * 100;

    if (drop < 0) {
      drop = 0;
    }

    var recentVolumes =
      volumes.slice(Math.max(0, volumes.length - 20));

    var previousVolumes =
      volumes.slice(
        Math.max(0, volumes.length - 40),
        Math.max(0, volumes.length - 20)
      );

    var recentVolume = average(recentVolumes);
    var previousVolume = average(previousVolumes);

    var volumeRatio = 0;

    if (previousVolume > 0) {
      volumeRatio = recentVolume / previousVolume;
    }

    var recentHigh = -Infinity;
    var recentLow = Infinity;

    var start = Math.max(0, closes.length - 20);

    for (var j = start; j < closes.length; j++) {

      if (closes[j] > recentHigh) {
        recentHigh = closes[j];
      }

      if (closes[j] < recentLow) {
        recentLow = closes[j];
      }
    }

    var range = recentHigh - recentLow;

    var position = 0;

    if (range > 0) {
      position =
        (current - recentLow) / range;
    }

    var score = 0;
    var tags = [];

    if (drop >= 50) {
      score += 20;
      tags.push("Drop besar");
    } else if (drop >= 30) {
      score += 12;
      tags.push("Drop");
    }

    if (range > 0) {
      var baseRange =
        (recentHigh - recentLow) / recentLow * 100;

      if (baseRange <= 20) {
        score += 20;
        tags.push("Base");
      }
    }

    if (volumeRatio >= 1.5) {
      score += 20;
      tags.push("Volume breakout");
    } else if (volumeRatio >= 1.2) {
      score += 10;
      tags.push("Volume naik");
    }

    if (position >= 0.75) {
      score += 15;
      tags.push("Breakout");
    }

    if (
      position >= 0.45 &&
      position <= 0.75
    ) {
      score += 10;
      tags.push("Retest");
    }

    if (current > oldPrice) {
      score += 10;
      tags.push("Momentum");
    }

    if (score > 100) {
      score = 100;
    }

    var stage = "WATCH";

    if (
      score >= 80 &&
      position >= 0.75
    ) {
      stage = "BREAKOUT → MARKUP";
    } else if (
      score >= 70 &&
      position >= 0.40
    ) {
      stage = "RETEST → MARKUP";
    } else if (
      score >= 55
    ) {
      stage = "BASE → BREAKOUT";
    } else if (
      drop >= 50
    ) {
      stage = "DROP → BASE";
    }

    return {
      score: score,
      drop: drop,
      stage: stage,
      tags: tags
    };
  }

  function renderCoin(symbol, analysis) {

    return (
      '<div class="coin">' +

      '<div class="row">' +
      '<strong>' + symbol + '</strong>' +
      '<span class="score">' +
      analysis.score +
      '/100</span>' +
      '</div>' +

      '<div>' +
      analysis.stage +
      ' • Drop ' +
      analysis.drop.toFixed(1) +
      '%' +
      '</div>' +

      '<div class="bar">' +
      '<div class="fill" style="width:' +
      analysis.score +
      '%"></div>' +
      '</div>' +

      '<div>' +
      analysis.tags.join(" • ") +
      '</div>' +

      '</div>'
    );
  }

  async function getSymbols() {

    var response = await fetch(
      "https://api.mexc.com/api/v3/exchangeInfo"
    );

    if (!response.ok) {
      throw new Error(
        "Gagal mengambil daftar pair MEXC."
      );
    }

    var data = await response.json();

    var symbols = [];

    if (data.symbols) {

      for (var i = 0; i < data.symbols.length; i++) {

        var s = data.symbols[i];

        if (
          s.quoteAsset === "USDT" &&
          s.status === "1" &&
          s.isSpotTradingAllowed === true
        ) {
          symbols.push(s.symbol);
        }
      }
    }

    return symbols;
  }

  async function getKlines(symbol) {

    var interval =
      intervalMap[timeframe];

    var url =
      "https://api.mexc.com/api/v3/klines" +
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

    setStatus(
      "Mengambil daftar pair MEXC..."
    );

    try {

      var symbols =
        await getSymbols();

      setStatus(
        "Ditemukan " +
        symbols.length +
        " pair USDT. Memulai scan..."
      );

      /*
       * Untuk pengujian awal HP,
       * kita scan maksimal 30 pair.
       *
       * Setelah sistem stabil,
       * jumlah ini kita naikkan secara
       * bertahap agar tidak membebani
       * browser/API.
       */

      var scanSymbols =
        symbols.slice(0, 30);

      var resultsArray = [];

      for (
        var i = 0;
        i < scanSymbols.length;
        i++
      ) {

        var symbol =
          scanSymbols[i];

        setStatus(
          "Scanning " +
          (i + 1) +
          "/" +
          scanSymbols.length +
          " : " +
          symbol
        );

        try {

          var candles =
            await getKlines(symbol);

          var analysis =
            calculateScore(candles);

          resultsArray.push({
            symbol: symbol,
            analysis: analysis
          });

        } catch (error) {

          console.log(
            "Skip " + symbol,
            error
          );
        }

        /*
         * jeda kecil agar HP/API
         * tidak dibanjiri request
         */

        await new Promise(
          function(resolve) {
            setTimeout(
              resolve,
              100
            );
          }
        );
      }

      resultsArray.sort(
        function(a, b) {
          return (
            b.analysis.score -
            a.analysis.score
          );
        }
      );

      var html = "";

      for (
        var j = 0;
        j < resultsArray.length;
        j++
      ) {

        var item =
          resultsArray[j];

        html += renderCoin(
          item.symbol,
          item.analysis
        );
      }

      results.innerHTML =
        html ||
        "<p>Tidak ada data yang berhasil dianalisis.</p>";

      setStatus(
        "SCAN LIVE SELESAI • " +
        timeframe +
        " • " +
        resultsArray.length +
        " pair dianalisis."
      );

    } catch (error) {

      console.error(error);

      setStatus(
        "ERROR: " +
        error.message
      );

      results.innerHTML =
        "<p>Gagal mengambil data MEXC. " +
        "Coba Scan lagi.</p>";
    }

    scanButton.disabled = false;
  }

  document
    .querySelectorAll(".tf")
    .forEach(function(button) {

      button.addEventListener(
        "click",
        function() {

          document
            .querySelectorAll(".tf")
            .forEach(
              function(x) {
                x.classList.remove(
                  "active"
                );
              }
            );

          button.classList.add(
            "active"
          );

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
