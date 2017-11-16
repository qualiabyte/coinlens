
JSX := ./node_modules/react-tools/bin/jsx

all: build dist

build:
	mkdir -p js
	node $(JSX) -x jsx src js

watch:
	mkdir -p js
	node $(JSX) -x jsx --watch src js

dist: build
	cp js/coinlens.js coinlens.js

clean:
	rm -rf js

.PHONY: all build watch dist clean
