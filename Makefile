all: webintents.min.js server/cache.manifest debug

debug: webintents.debug.js

webintents.debug.js: webintents.js debug.js
	cat debug.js webintents.js > webintents.debug.js
	rm examples/lib/webintents.debug.js
	ln webintents.debug.js examples/lib/webintents.debug.js

webintents.min.js: webintents.js
	uglifyJs $^ > $@
	rm examples/lib/webintents.js
	ln webintents.js examples/lib/webintents.js

# Manifest depends on changes to other files, so include them in the dependency chain
server/cache.manifest: server/cache.manifest.src server/picker.html server/picker.js server/webintents.js server/intents.html
	cat server/cache.manifest.src >> server/cache.manifest
	echo '#' `date` >> server/cache.manifest

clean:
	rm webintents.min.js webintents.debug.js server/cache.manifest
