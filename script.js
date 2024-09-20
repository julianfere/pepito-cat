// Create a new EventSource
const source = new EventSource(
  "https://cors-anywhere.herokuapp.com/https://api.thecatdoor.com/sse/v1/events"
);

//{"event":"pepito","type":"in","time":1725714575,"img":"https://storage.thecatdoor.com/assets/1725714575-in-799154526.jpg"}

const lastUpdate = document.getElementById("lastUpdate");
const pepitoImg = document.getElementById("pepitoImg");

const parseTime = (time) => {
  return new Date(time * 1000).toTimeString();
};

const handleHeartbeat = (payload) => {
  console.log("Heartbeat received");

  lastUpdate.innerHTML = `Ultima actualizacion: ${parseTime(payload.time)}`;
};

const handlePepito = (event) => {
  console.log("Pepito received");

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
