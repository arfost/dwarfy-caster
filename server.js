'use strict';

const express = require('express');
const net = require('net');
const url = require('url');
const path = require('path');
const fs = require('fs');
const mime = require('mime');
const WebSocketServer = require('ws').Server;

let webServer, wsServer, source_host, source_port, target_host, target_port, onConnectedCallback = null, onDisconnectedCallback = null;

const app = express();

// Handle new WebSocket client
const new_client = function (client, req) {
  const clientAddr = client._socket.remoteAddress;
  let log;
  console.log(req ? req.url : client.upgradeReq.url);
  log = function (msg) {
    console.log(' ' + clientAddr + ': ' + msg);
  };
  log('WebSocket connection from : ' + clientAddr);
  log('Version ' + client.protocolVersion + ', subprotocol: ' + client.protocol);
  const target = net.createConnection(target_port, target_host, function () {
    log('connected to target');
    if (onConnectedCallback) {
      try {
        onConnectedCallback(client, target);
      } catch (e) {
        log("onConnectedCallback failed, cleaning up target");
        target.end();
      }
    }
  });
  target.on('data', function (data) {
    try {
      client.send(data);
    } catch (e) {
      log("Client closed, cleaning up target");
      target.end();
    }
  });
  target.on('end', function () {
    log('target disconnected');
    client.close();
  });
  target.on('error', function () {
    log('target connection error');
    target.end();
    client.close();
  });

  client.on('message', function (msg) {
    target.write(msg);
  });
  client.on('close', function (code, reason) {
    if (onDisconnectedCallback) {
      try {
        onDisconnectedCallback(client, code, reason);
      } catch (e) {
        log("onDisconnectedCallback failed");
      }
    }
    log('WebSocket client disconnected: ' + code + ' [' + reason + ']');
    target.end();
  });
  client.on('error', function (a) {
    log('WebSocket client error: ' + a);
    target.end();
  });
};

// Send an HTTP error response
const http_error = function (response, code, msg) {
  response.writeHead(code, { "Content-Type": "text/plain" });
  response.write(msg + "\n");
  response.end();
  return;
}


function initWsServer() {
  source_host = "127.0.0.1";
  source_port = parseInt("8080");
  target_host = "127.0.0.1";
  target_port = parseInt("5000");

  console.log("Starting WebSocket proxy server (source: " + source_host + ":" + source_port + ", target: " + target_host + ":" + target_port + ")");
  console.log("You can see your fortress at http://localhost:" + source_port + "/index.html?cast=12,5");
  console.log("Use zqsd to move around, a and e to go up and down. You can switch to qwerty mode with the 'p' key.");
  console.log("You can also teleport to the in game view/keyboard cursor with the 'x' key.")
  console.log("Press Ctrl+C to exit.");

  const app = express();

  app.get('*', (req, res) => {
    console.log("Serving " + req.url);
    // if (!argv.web) {
    //     return http_error(res, 403, "403 Permission Denied");
    // }

    const uri = url.parse(req.url).pathname;
    let filename = path.join('./client', uri);
    fs.readFile(filename, "binary", function (err, file) {
      if (err) {
        console.log("File not found: " + uri);
        console.error(err);
        return http_error(res, 500, "nop");
      }

      res.setHeader('Content-type', mime.getType(path.parse(uri).ext));
      res.writeHead(200);
      res.write(file, "binary");
      res.end();
    });
  });

  webServer = app.listen(source_port, function () {
    wsServer = new WebSocketServer({ server: webServer });
    wsServer.on('connection', new_client);
  });
}

initWsServer()