const source = new EventSource("http://localhost:3000/sse-proxy");

const lastUpdate = document.getElementById("lastUpdate");
const pepitoImg = document.getElementById("pepitoImg");

const parseTime = (time) => {
  return new Date(time * 1000).toTimeString();
};

const handleHeartbeat = (payload) => {
  console.log("Heartbeat received");
  pepitoImg.src = payload.img;
  lastUpdate.innerHTML = `Ultima actualizacion: ${parseTime(payload.time)}`;
};

const handlePepito = (event) => {
  console.log("Pepito received", event);

  pepitoImg.src = event.img;
  lastUpdate.innerHTML = `Ultima actualizacion: ${parseTime(event.time)}`;
};

source.onmessage = function (event) {
  const payload = JSON.parse(event.data);

  switch (payload.event) {
    case "heartbeat":
      handleHeartbeat(payload);
      break;
    case "pepito":
      handlePepito(payload);
      break;
    default:
      console.log("Unknown event type", payload.type);
  }
};

source.onerror = function (event) {
  console.error("SSE Error:", event);
};

source.onopen = function (event) {
  console.log("SSE connection opened.");
};
