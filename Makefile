
all: build

build:
	mkdir -p build
	jsx -x jsx src build

watch:
	mkdir -p build
	jsx -x jsx --watch src build

clean:
	rm -rf build

.PHONY: all build watch clean
