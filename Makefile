RELEASE := $(shell cat ./src/release.js)
DEBUG := $(shell cat ./src/debug.js)

all: server/webintents/cache.manifest.src production

release: ./src/webintents.js ./src/json2.js ./src/base64.js
	cat ./src/webintents.js ./src/json2.js ./src/base64.js | sed 's|// __WEBINTENTS_ROOT|$(RELEASE)|' > webintents.js
	cp webintents.js server/webintents/pages/webintents.js
	gzip -f server/webintents/pages/webintents.js
	cp webintents.js server/webintents/pages/webintents.js
	cp webintents.js tools/chrome/extensions/share/webintents.js

debug: ./src/webintents.js ./src/debug.js ./src/json2.js ./src/base64.js
	cat ./src/debug.js ./src/webintents.js ./src/json2.js ./src/base64.js | sed 's|// __WEBINTENTS_ROOT|$(DEBUG)|' | sed 's|//DEBUG(|DEBUG(|' > webintents.js
	cp webintents.js server/webintents/pages/webintents.js
	gzip -f server/webintents/pages/webintents.js
	cp webintents.js tools/chrome/extensions/share/webintents.js

production: server/webintents/pages/cache.manifest release
	uglifyjs webintents.js > server/webintents/pages/webintents.min.js
	gzip -f server/webintents/pages/webintents.min.js

server/webintents/pages/webintents.js:

# Manifest depends on changes to other files, so include them in the dependency chain
server/webintents/pages/cache.manifest: server/webintents/cache.manifest.src server/webintents/pages/picker.html server/webintents/pages/picker.js server/webintents/pages/webintents.js server/webintents/pages/intents.html server/webintents/pages/json2.js server/webintents/pages/webintents-server.js server/webintents/pages/controller.js server/webintents/pages/base64.js
	cat server/webintents/cache.manifest.src >> server/webintents/pages/cache.manifest
	echo '#' `date` >> server/webintents/pages/cache.manifest

clean:
	rm -f webintents.js
	rm -f server/webintents/pages/webintents.js
	rm -f server/webintents/pages/webintents.min.js
	rm -f server/webintents/pages/webintents.min.gz
	rm -f server/webintents/pages/cache.manifest
	rm -f tools/chrome/extensions/share/webintents.js
