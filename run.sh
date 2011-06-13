#! /usr/bin/bash

case $1 in
'start')
  (
    cd server
    python -m SimpleHTTPServer 8080 &
    echo $! > server.pid
  )
  (
    cd examples
    python -m SimpleHTTPServer &
    echo $! > examples.pid
  )
  ;;
'stop')
  kill $(cat server/server.pid) $(cat examples/examples.pid)
  rm server/server.pid examples/examples.pid
  ;;
'restart')
  $0 stop ; $0 start
  ;;
*)
  echo "Usage: $0 { start | stop }"
esac
