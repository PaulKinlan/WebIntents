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
  (
    cd experiments
    python -m SimpleHTTPServer 9000 &
    echo $! > experiments.pid
  )
  ;;
'stop')
  kill $(cat server/server.pid) $(cat examples/examples.pid) $(cat experiements/experiments.pid)
  rm server/server.pid examples/examples.pid experiements/experiments.pid
  ;;
'restart')
  $0 stop ; $0 start
  ;;
*)
  echo "Usage: $0 { start | stop }"
esac
