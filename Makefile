RELEASE := $(shell cat ./src/release.js)
DEBUG := $(shell cat ./src/debug.js)

all: server/webintents/cache.manifest.src production

release: ./src/webintents.js ./src/json2.js ./src/base64.js
	cat ./src/webintents.js ./src/json2.js ./src/base64.js | sed 's|// __WEBINTENTS_ROOT|$(RELEASE)|' > webintents.js
	cp webintents.js webintents/webintents.js
	gzip -f webintents/webintents.js
	cp webintents.js /server/webintents/webintents.js
	cp webintents.js tools/chrome/extensions/share/webintents.js

debug: ./src/webintents.js ./src/debug.js ./src/json2.js ./src/base64.js
	cat ./src/debug.js ./src/webintents.js ./src/json2.js ./src/base64.js | sed 's|// __WEBINTENTS_ROOT|$(DEBUG)|' | sed 's|//DEBUG(|DEBUG(|' > webintents.js
	cp webintents.js server/webintents/webintents.js
	gzip -f server/webintents/webintents.js
	cp webintents.js tools/chrome/extensions/share/webintents.js

production: webintents/public/cache.manifest release
	uglifyjs webintents.js > server/webintents/webintents.min.js
	gzip -f server/webintents/webintents.min.js

webintents/webintents.js:

# Manifest depends on changes to other files, so include them in the dependency chain
server/webintents/cache.manifest: server/webintents/cache.manifest.src server/webintents/picker.html server/webintents/picker.js server/webintents/webintents.js server/webintents/intents.html server/webintents/json2.js server/webintents/webintents-server.js server/webintents/controller.js server/webintents/base64.js
	cat server/webintents/cache.manifest.src >> server/webintents/cache.manifest
	echo '#' `date` >> server/webintents/cache.manifest

clean:
	rm -f webintents.js
	rm -f server/webintents/webintents.js
	rm -f server/webintents/webintents.min.js
	rm -f server/webintents/webintents.min.gz
	rm -f server/webintents/cache.manifest
	rm -f tools/chrome/extensions/share/webintents.js
