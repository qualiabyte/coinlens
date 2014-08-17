
all: build

build:
	mkdir -p js
	jsx -x jsx src build

watch:
	mkdir -p js
	jsx -x jsx --watch src js

clean:
	rm -rf build

.PHONY: all build watch clean
