#!/usr/bin/env bash

case $1 in
'start')
  (
    cd server
    python ssl/SimpleSecureHTTPServer.py 8080 &
    echo $! > server.pid
  )
  (
    cd examples
    python ../server/ssl/SimpleSecureHTTPServer.py 8000 &
    echo $! > examples.pid
  )
  (
    cd experiments
    python ../server/ssl/SimpleSecureHTTPServer.py 9000 &
    echo $! > experiments.pid
  )
  (
    cd widgets
    python ../server/ssl/SimpleSecureHTTPServer.py 9001 &
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
