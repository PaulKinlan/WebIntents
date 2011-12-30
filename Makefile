RELEASE := $(shell cat ./src/release.js)
DEBUG := $(shell cat ./src/debug.js)

all: server/webintents/cache.manifest.src production

release: ./src/webintents.js ./src/json2.js ./src/base64.js
	cat ./src/webintents.js ./src/json2.js ./src/base64.js | sed 's|// __WEBINTENTS_ROOT|$(RELEASE)|' > webintents.js
	cp webintents.js server/webintents/static/webintents.js
	cp webintents.js server/webintents/static/webintents.js
	cp webintents.js tools/chrome/extensions/share/webintents.js

debug: ./src/webintents.js ./src/debug.js ./src/json2.js ./src/base64.js
	cat ./src/debug.js ./src/webintents.js ./src/json2.js ./src/base64.js | sed 's|// __WEBINTENTS_ROOT|$(DEBUG)|' | sed 's|//DEBUG(|DEBUG(|' > webintents.js
	cp webintents.js server/webintents/static/webintents.js
	cp webintents.js tools/chrome/extensions/share/webintents.js

production: server/webintents/static/cache.manifest release
	uglifyjs webintents.js > server/webintents/static/webintents.min.js

server/webintents/static/webintents.js:

# Manifest depends on changes to other files, so include them in the dependency chain
server/webintents/static/cache.manifest: server/webintents/cache.manifest.src server/webintents/static/picker.html server/webintents/static/picker.js server/webintents/static/webintents.js server/webintents/static/intents.html server/webintents/static/json2.js server/webintents/static/webintents-server.js server/webintents/static/controller.js server/webintents/static/base64.js
	cat server/webintents/cache.manifest.src > server/webintents/static/cache.manifest
	echo '#' `date` >> server/webintents/static/cache.manifest

clean:
	rm -f webintents.js
	rm -f server/webintents/static/webintents.js
	rm -f server/webintents/static/webintents.min.js
	rm -f server/webintents/static/webintents.min.gz
	rm -f server/webintents/static/cache.manifest
	rm -f tools/chrome/extensions/share/webintents.js
