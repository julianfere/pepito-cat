import express from "express";
import cors from "cors";
import EventSource from "eventsource";
import fs from "fs";

const app = express();

app.use(cors());

function store(img, time) {
  const newData = {
    img,
    time,
  };

  fs.writeFileSync("./src/data.json", JSON.stringify(newData));
}

function get() {
  const data = fs.readFileSync("./src/data.json");
  return JSON.parse(data);
}

/*
  Adapts the response from the original server to the client
  
  {"event":"pepito", "time":1725714575,"img":"https://storage.thecatdoor.com/assets/1725714575-in-799154526.jpg"}
*/
const adaptReponse = (payload) => {
  console.log(payload);
  if (payload.event === "heartbeat") {
    const data = get();

    return JSON.stringify({
      event: "heartbeat",
      time: payload.time,
      img: data.img,
    });
  }

  return JSON.stringify(payload);
};

app.get("/sse-proxy", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sseUrl = "https://api.thecatdoor.com/sse/v1/events";
  const eventSource = new EventSource(sseUrl);

  eventSource.onmessage = (event) => {
    const payload = JSON.parse(event.data);

    if (payload.event === "pepito") {
      if (payload.type === "in" || payload.type === "out") {
        store(payload.img, payload.time);
      }
    }

    const data = adaptReponse(payload);
    console.log(data);
    res.write(`data: ${data}\n\n`);
  };

  eventSource.onerror = (err) => {
    console.error("Error en la conexión SSE:", err);
    res.write("data: Error en la conexión SSE\n\n");
    eventSource.close();
  };

  req.on("close", () => {
    eventSource.close();
    res.end();
  });
});

app.listen(3000, () => {
  console.log("Proxy escuchando en http://localhost:3000");
});
