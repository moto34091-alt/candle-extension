// marteau
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

        // engulfing
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

    setInterval(() => {
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
            navigator.vibrate?.([200, 100, 200]);
            lastSignal = result.signal;
        }
    }, 1500);
})();
