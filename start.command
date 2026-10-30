#!/bin/bash
# Double-click to start the study app (needs Node.js). Closes with Ctrl+C.
cd "$(dirname "$0")"
exec node serve.js
