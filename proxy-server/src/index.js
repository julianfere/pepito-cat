import express from "express";
import cors from "cors";
import EventSource from "eventsource";
import fs from "fs";

//region DataHandler
class DataHandler {
  constructor() {
    if (DataHandler.instance) {

      return DataHandler.instance;
    }

    this.data = JSON.parse(fs.readFileSync("./src/data.json"));
    this.newData = false;
    DataHandler.instance = this;
    return this;
  }

  store(img, time) {
    console.log('Storing new data', { img, time })
    const newData = {
      img,
      time,
    };

    fs.writeFileSync("./src/data.json", JSON.stringify(newData));
    this.newData = true;
    this.data = newData;
  }

  get() {
    if (!this.newData) {
      return this.data;
    }

    const data = fs.readFileSync("./src/data.json");
    this.newData = false;
    return JSON.parse(data);
  }

  hasNewData() {
    return this.newData;
  }
}
//endregion
//region EventHandler
class EventHandler {
  constructor(dataHandler = new DataHandler()) {
    this.dataHandler = dataHandler;
  }

  handle(event) {
    console.log('NEW EVENT RECEIVED', event.data)
    const payload = JSON.parse(event.data);


    if (payload.event === "pepito") {
      if (payload.type === "in" || payload.type === "out") {
        this.dataHandler.store(payload.img, payload.time);
      }
    }
  }
}
//endregion
//region Constants

const SSE_URL = "https://api.thecatdoor.com/sse/v1/events";
const app = express();
const dataHandler = new DataHandler();
const eventHandler = new EventHandler(dataHandler);


//endregion
//region Server
app.use(cors());



app.get("/sse-proxy", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");


  const interval = setInterval(() => {
    const data = dataHandler.get();

    res.write(`data: ${JSON.stringify(data)}\n\n`);
    return

  }, 8000);


  req.on("close", () => {
    res.end();
    clearInterval(interval);
  });
});

app.get("/health", (_, res) => res.send('im alive'))


app.listen(3001, () => {

  console.log("Server listening on port 3000");
  const eventSource = new EventSource(SSE_URL);

  eventSource.onopen = () => {
    console.log("Connected to EventSource");
  }

  eventSource.onerror = (err) => {
    console.error("Error en la conexión SSE:", err);
  }

  eventSource.onmessage = (event) => {
    eventHandler.handle(event);
  }
});
