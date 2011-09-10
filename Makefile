RELEASE := $(shell cat ./src/release.js)
DEBUG := $(shell cat ./src/debug.js)

all: server/cache.manifest production

release: ./src/webintents.js ./src/json2.js ./src/base64.js
	cat ./src/webintents.js ./src/json2.js ./src/base64.js | sed 's|// __WEBINTENTS_ROOT|$(RELEASE)|' > webintents.js
	cp webintents.js webintents/public/webintents.js
	gzip webintents/public/webintents.js
	cp webintents.js webintents/public/webintents.js
	cp webintents.js webintents/app/assets/webintents.js
	cp webintents.js widgets/lib/webintents.js
	cp webintents.js tools/chrome/extensions/share/webintents.js

debug: ./src/webintents.js ./src/debug.js ./src/json2.js ./src/base64.js
	cat ./src/debug.js ./src/webintents.js ./src/json2.js ./src/base64.js | sed 's|// __WEBINTENTS_ROOT|$(DEBUG)|' | sed 's|//DEBUG(|DEBUG(|' > webintents.js
	cp webintents.js webintents/public/webintents.js
	gzip webintents/public/webintents.js
	cp webintents.js webintents/public/webintents.js
	cp webintents.js widgets/lib/webintents.js
	cp webintents.js tools/chrome/extensions/share/webintents.js

production: release
	uglifyjs webintents.js > webintents/public/webintents.min.js
	gzip webintents/public/webintents.min.js
	uglifyjs webintents.js > webintents/public/webintents.min.js

server/webintents.js:

# Manifest depends on changes to other files, so include them in the dependency chain
server/cache.manifest: server/cache.manifest.src server/picker.html server/script/picker.js server/webintents.js server/intents.html server/script/json2.js server/script/webintents-server.js server/script/controller.js server/script/base64.js
	cat server/cache.manifest.src >> webintents/public/cache.manifest
	echo '#' `date` >> webintents/public/cache.manifest

clean:
	rm -f webintents.js
	rm -f webintents/public/cache.manifest
	rm -f webintents/public/webintents.min.js
	rm -f webintents/public/webintents.min.js.gz
	rm -f webintents/public/webintents.js
	rm -f webintents/public/webintents.js.gz
	rm -f widgets/lib/webintents.js
	rm -f tools/chrome/extensions/share/webintents.js
