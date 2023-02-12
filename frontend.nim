import jester, strutils

import frontend/api/[monster]

router myrouter:
  get "/api/image/monster/@id":
    var seed = 1
    try:
      seed = parseInt(@"id")
    except:
      echo "[DBG] Error parse ID"
    resp Http200, {"Content-Type": "image/png"}, renderMonster(seed)
  error Exception:
    resp Http500, "Something bad happened: " & exception.msg
  error Http404:
    resp "you got 404"

when isMainModule:
  let s = newSettings(
    Port(5000),
    bindAddr="127.0.0.1",
  )
  var jest = initJester(myrouter, s)
  jest.serve()