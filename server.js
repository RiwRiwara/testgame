const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files
app.use(express.static("public"));

const clients = new Map();

wss.on("connection", function connection(ws) {
    const clientId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    clients.set(ws, clientId);
    ws.send(JSON.stringify({ type: "init", id: clientId }));

    ws.on("message", function incoming(message) {
        const data = JSON.parse(message);
        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ ...data, id: clients.get(ws) }));
            }
        });
    });

    ws.on("close", () => {
        clients.delete(ws);
    });
});

// Use Render’s PORT or fallback to 3000 locally
const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", function () {
    console.log(`Server listening on port ${PORT}`);
});
