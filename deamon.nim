import osproc

var deamon = startProcess(command = "frontend", options = {poDaemon})
echo "[DBG] Frontend started on  http://127.0.0.1:5000/"

proc ctrlc() {.noconv.} =
  kill(deamon)
  echo "  \n[DBG] ControlCHook Kill(\"frontend\")"
  quit(0)
setControlCHook(ctrlc)