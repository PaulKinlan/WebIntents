#!/bin/bash
#
# Copyright 2011 Google Inc. All Rights Reserved.
# Author: tpayne@google.com (Tony Payne)

make production
(
  cd webintents
  rake assets:precompile
)
(
  cd examples
  rake assets:precompile
)
(
  cd demos/twitpic
  rake assets:precompile
)
(
  cd demos/memegen
  rake assets:precompile
)
