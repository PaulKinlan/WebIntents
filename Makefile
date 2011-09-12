RELEASE := $(shell cat ./src/release.js)
DEBUG := $(shell cat ./src/debug.js)

all: webintents/public/cache.manifest production

release: ./src/webintents.js ./src/json2.js ./src/base64.js
	cat ./src/webintents.js ./src/json2.js ./src/base64.js | sed 's|// __WEBINTENTS_ROOT|$(RELEASE)|' > webintents.js
	cp webintents.js webintents/public/webintents.js
	gzip -f webintents/public/webintents.js
	cp webintents.js webintents/public/webintents.js
	cp webintents.js webintents/app/assets/javascripts/webintents.js
	cp webintents.js examples/app/assets/javascripts/webintents.js
	cp webintents.js widgets/lib/webintents.js
	cp webintents.js tools/chrome/extensions/share/webintents.js

debug: ./src/webintents.js ./src/debug.js ./src/json2.js ./src/base64.js
	cat ./src/debug.js ./src/webintents.js ./src/json2.js ./src/base64.js | sed 's|// __WEBINTENTS_ROOT|$(DEBUG)|' | sed 's|//DEBUG(|DEBUG(|' > webintents.js
	cp webintents.js webintents/public/webintents.js
	gzip -f webintents/public/webintents.js
	cp webintents.js webintents/public/webintents.js
	cp webintents.js widgets/lib/webintents.js
	cp webintents.js tools/chrome/extensions/share/webintents.js

production: webintents/public/cache.manifest release
	uglifyjs webintents.js > webintents/public/webintents.min.js
	cp webintents/public/webintents.min.js webintents/app/assets/javascripts/
	cp webintents/public/webintents.min.js examples/app/assets/javascripts/
	gzip -f webintents/public/webintents.min.js
	uglifyjs webintents.js > webintents/public/webintents.min.js

webintents/public/webintents.js:

# Manifest depends on changes to other files, so include them in the dependency chain
webintents/public/cache.manifest: server/cache.manifest.src webintents/public/picker.html webintents/public/picker.js webintents/public/webintents.js webintents/public/intents.html webintents/public/json2.js webintents/public/webintents-server.js webintents/public/controller.js webintents/public/base64.js
	cat server/cache.manifest.src >> webintents/public/cache.manifest
	echo '#' `date` >> webintents/public/cache.manifest

clean:
	rm -f webintents.js
	rm -f webintents/app/assets/javascripts/webintents.js
	rm -f webintents/app/assets/javascripts/webintents.min.js
	rm -f examples/app/assets/javascripts/webintents.js
	rm -f examples/app/assets/javascripts/webintents.min.js
	rm -f webintents/public/cache.manifest
	rm -f webintents/public/webintents.min.js
	rm -f webintents/public/webintents.min.js.gz
	rm -f webintents/public/webintents.js
	rm -f webintents/public/webintents.js.gz
	rm -f widgets/lib/webintents.js
	rm -f tools/chrome/extensions/share/webintents.js
