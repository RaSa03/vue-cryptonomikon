const API_KEY =
  '7655ddeb75bb9b91517c0031ed0b3ad085c7d1021541a1b810998ffbe406c0f1';

const tickersHandlers = new Map();

const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

const AGGREGATE_INDEX = '5';

socket.addEventListener('message', (el) => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice,
  } = JSON.parse(el.data);
  if (type != AGGREGATE_INDEX || newPrice == undefined) return;

  const handlers = tickersHandlers.get(currency) ?? [];
  handlers.forEach((fn) => fn(newPrice));
});

function sendToWebSoccet(message) {
  const stringifyedMessage = JSON.stringify(message);

  if (socket.readyState == WebSocket.OPEN) {
    socket.send(stringifyedMessage);
    return;
  }

  socket.addEventListener(
    'open',
    () => {
      socket.send(stringifyedMessage);
    },
    { once: true }
  );
}

function subscribeToTickerOnWS(ticker) {
  sendToWebSoccet({
    action: 'SubAdd',
    subs: [`5~CCCAGG~${ticker}~USD`],
  });
}

function unsubscribeFromTickerOnWS(ticker) {
  sendToWebSoccet({
    action: 'SubRemove',
    subs: [`5~CCCAGG~${ticker}~USD`],
  });
}

export const subscribeToTiker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) ?? [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
  subscribeToTickerOnWS(ticker);
};
export const unsubscribeFromTicker = (ticker) => {
  tickersHandlers.delete(ticker);
  unsubscribeFromTickerOnWS(ticker);
};

window.tickersHandlers = tickersHandlers;
