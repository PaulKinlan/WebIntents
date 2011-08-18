#!/usr/bin/env bash

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
  (
    cd widgets
    python -m SimpleHTTPServer 9001 &
    echo $! > widgets.pid
  )
  ;;
'stop')
  kill $(cat server/server.pid) $(cat examples/examples.pid) $(cat experiments/experiments.pid widgets/widgets.pid)
  rm server/server.pid examples/examples.pid experiments/experiments.pid widgets/widgets.pid
  ;;
'restart')
  $0 stop ; $0 start
  ;;
*)
  echo "Usage: $0 { start | stop }"
esac
