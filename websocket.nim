

import asyncdispatch, asynchttpserver, ws, osproc
import websoket/router, deamon

var connections = newSeq[WebSocket]()

proc cb(req: Request) {.async, gcsafe.} =
  if req.url.path == "/ws":
    try:
      var ws = await newWebSocket(req)
      connections.add ws
      #await ws.send("Welcome to simple chat server")
      while ws.readyState == Open:
        let packet = await ws.receiveStrPacket()
        var result = router(packet)
        #echo "Received packet: " & packet
        if result != "":
          asyncCheck ws.send(result)
    except WebSocketClosedError:
      echo "[DBG] Socket closed (client: " & req.hostname & ")"
    except WebSocketProtocolMismatchError:
      echo "[DBG] Socket tried to use an unknown protocol: ", getCurrentExceptionMsg() , " (client: " & req.hostname & ")"
    except WebSocketError:
      echo "[DBG] Unexpected socket error: ", getCurrentExceptionMsg(), "(client: " & req.hostname & ")"
  await req.respond(Http200, "SERVER (WebSoket) on ws://localhost:2222/ws")

var server = newAsyncHttpServer()
echo "[DBG] WebSocket started on ws://127.0.0.1:2222/ws"
waitFor server.serve(Port(2222), cb)