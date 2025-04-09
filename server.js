const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files
app.use(express.static("public"));

const clients = new Map(); // Map to store client IDs

wss.on("connection", function connection(ws) {
	// Assign a unique ID to the client
	const clientId =
		Date.now().toString() + Math.random().toString(36).substr(2, 5);
	clients.set(ws, clientId);

	// Send initial connection message with ID
	ws.send(JSON.stringify({ type: "init", id: clientId }));

	ws.on("message", function incoming(message) {
		const data = JSON.parse(message);
		// Broadcast to everyone except the sender
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

server.listen(3000, function () {
	console.log("Server listening on http://localhost:3000");
});
