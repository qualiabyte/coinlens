
JSX := ./node_modules/react-tools/bin/jsx

all: build

build:
	mkdir -p js
	$(JSX) -x jsx src js

watch:
	mkdir -p js
	$(JSX) -x jsx --watch src js

clean:
	rm -rf build

.PHONY: all build watch clean
