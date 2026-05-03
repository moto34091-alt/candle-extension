(function () {
    if (window.BOUGIE_AI_RUNNING) return;
    window.BOUGIE_AI_RUNNING = true;

    let box = document.createElement("div");
    box.id = "bougie-ai-box";
    box.style.position = "fixed";
    box.style.bottom = "95px";
    box.style.right = "10px";
    box.style.padding = "10px";
    box.style.background = "rgba(15,15,15,0.88)";
    box.style.color = "#fff";
    box.style.fontSize = "12px";
    box.style.fontFamily = "Arial";
    box.style.borderRadius = "12px";
    box.style.zIndex = "999999";
    box.style.minWidth = "155px";
    box.style.textAlign = "center";
    box.style.boxShadow = "0 0 12px rgba(0,0,0,0.4)";
    box.innerHTML = "Loading...";
    document.body.appendChild(box);

    let lastSignal = "";

    function getPrices() {
        let text = document.body.innerText || "";
        let matches = text.match(/\b\d+\.\d{3,5}\b/g);
        if (!matches) return [];
        return matches.slice(-30).map(Number);
    }

    function buildCandles(prices) {
        let candles = [];

        for (let i = 1; i < prices.length; i++) {
            let open = prices[i - 1];
            let close = prices[i];
            let high = Math.max(open, close);
            let low = Math.min(open, close);

            candles.push({
                open: open,
                close: close,
                high: high,
                low: low,
                body: Math.abs(close - open),
                upperWick: high - Math.max(open, close),
                lowerWick: Math.min(open, close) - low,
                bullish: close > open,
                bearish: close < open
            });
        }

        return candles;
    }

    function avgBody(candles) {
        return candles.reduce((sum, c) => sum + c.body, 0) / candles.length;
    }

    function isRange(candles) {
        let recent = candles.slice(-6);
        let avg = avgBody(recent);

        let smallCount = recent.filter(c => c.body < avg * 0.8).length;
        let alternation = recent.filter(
            (c, i) => i > 0 && c.bullish !== recent[i - 1].bullish
        ).length;

        return smallCount >= 4 && alternation >= 3;
    }

    function isHammer(c) {
        return c.lowerWick > c.body * 2;
    }

    function isBearHammer(c) {
        return c.upperWick > c.body * 2;
    }

    function isBullishEngulfing(prev, curr) {
        return (
            prev.bearish &&
            curr.bullish &&
            curr.open <= prev.close &&
            curr.close >= prev.open
        );
    }

    function isBearishEngulfing(prev, curr) {
        return (
            prev.bullish &&
            curr.bearish &&
            curr.open >= prev.close &&
            curr.close <= prev.open
        );
    }

    function analyze(candles) {
        if (candles.length < 8) {
            return {
                signal: "WAIT",
                confidence: 0,
                reason: "Not enough data"
            };
        }

        if (isRange(candles)) {
            return {
                signal: "⚠ WAIT",
                confidence: 25,
                reason: "Range market"
            };
        }

        let c2 = candles[candles.length - 2];
        let c3 = candles[candles.length - 1];

        if (isHammer(c3)) {
            return {
                signal: "🟢 BUY",
                confidence: 78,
                reason: "Hammer"
            };
        }

        if (isBearHammer(c3)) {
            return {
                signal: "🔴 SELL",
                confidence: 78,
                reason: "Shooting star"
            };
        }

        if (isBullishEngulfing(c2, c3)) {
            return {
                signal: "🟢 BUY",
                confidence: 82,
                reason: "Bullish engulfing"
            };
        }

        if (isBearishEngulfing(c2, c3)) {
            return {
                signal: "🔴 SELL",
                confidence: 82,
                reason: "Bearish engulfing"
            };
        }
return {
            signal: "⚠ WAIT",
            confidence: 45,
            reason: "No setup"
        };
    }

    setInterval(function () {
        let prices = getPrices();

        if (!prices.length) {
            box.innerHTML = "❌ No data";
            return;
        }

        let candles = buildCandles(prices);
        let result = analyze(candles);
        let current = prices[prices.length - 1];

        box.innerHTML = 
           <b>BOUGIE AI PRO</b><br>
           ${result.signal}<br>
           ${result.confidence}%<br>
          <small>${result.reason}</small><br>
          <small>${current}</small>
         ;

        if (
            result.signal !== "⚠ WAIT" &&
            result.confidence >= 80 &&
            lastSignal !== result.signal
        ) {
            if (navigator.vibrate) {
                navigator.vibrate([200, 100, 200]);
            }
            lastSignal = result.signal;
        }
    }, 1500);
})();
