RELEASE := $(shell cat ./src/release.js)
DEBUG := $(shell cat ./src/debug.js)

all: webintents.js webintents.min.js server/cache.manifest examples tools widgets

release: ./src/webintents.js ./src/json2.js ./src/base64.js
	cat ./src/webintents.js ./src/json2.js ./src/base64.js | sed 's|// __WEBINTENTS_ROOT|$(RELEASE)|' > webintents.js
	cp webintents.js server/webintents.js
	cp webintents.js widgets/lib/webintents.js
	cp webintents.js examples/lib/webintents.js
	cp webintents.js tools/chrome/extensions/share/webintents.js

debug: ./src/webintents.js ./src/debug.js ./src/json2.js ./src/base64.js
	cp webintents.js server/webintents.js
	cp webintents.js widgets/lib/webintents.js
	cp webintents.js examples/lib/webintents.js
	cp webintents.js tools/chrome/extensions/share/webintents.js

production: release
	uglifyJs $^ > $@

# Manifest depends on changes to other files, so include them in the dependency chain
server/cache.manifest: server/cache.manifest.src server/picker.html server/script/picker.js server/webintents.js server/intents.html server/script/json2.js server/script/webintents-server.js server/webintents.min.js server/script/controller.js server/script/base64.js
	cat server/cache.manifest.src >> server/cache.manifest
	echo '#' `date` >> server/cache.manifest

clean: webintents.js webintents.min.js webintents.js server/cache.manifest examples/lib/webintents.js examples/lib/webintents.min.js examples/lib/webintents.js server/webintents.js server/webintents.min.js server/webintents.js
	rm $^
