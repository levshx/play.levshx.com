# Package

version     = "0.0.0"
author      = "levshx"
description = "GAME"
license     = "MIT"

# Deps

requires "nim >= 1.6.0"
requires "ws"
requires "jester"
requires "pixie"
requires "perlin"

import os

task exec, "Build and execute server":
    exec "nim c -d:release frontend.nim"
    exec "nim c -r -d:release websocket.nim"