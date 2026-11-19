import { createServer } from "node:http";
import next from "next";
import { WebSocket, WebSocketServer } from "ws";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.SERVER_HOST || "127.0.0.1";
const port = Number(process.env.PORT || 3000);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

await app.prepare();

const webSocketServer = new WebSocketServer({ noServer: true });

globalThis.__broadcastContentUpdate = (content) => {
  const message = JSON.stringify({ type: "content-updated", content });

  for (const client of webSocketServer.clients) {
    if (client.readyState === WebSocket.OPEN) client.send(message);
  }
};

const server = createServer((request, response) => handle(request, response));

server.on("upgrade", (request, socket, head) => {
  const pathname = new URL(request.url || "/", `http://${request.headers.host || hostname}`).pathname;

  if (pathname !== "/content-updates") {
    socket.destroy();
    return;
  }

  webSocketServer.handleUpgrade(request, socket, head, (webSocket) => {
    webSocketServer.emit("connection", webSocket, request);
  });
});

server.listen(port, hostname, () => {
  console.log(`Wild42 ready on http://${hostname}:${port}`);
});

function shutDown() {
  globalThis.__broadcastContentUpdate = undefined;
  for (const client of webSocketServer.clients) client.close(1001, "Server restarting");
  webSocketServer.close();
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutDown);
process.on("SIGTERM", shutDown);
