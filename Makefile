
all: build

build:
	jsx -x jsx src build

watch:
	jsx -x jsx --watch src build

clean:
	rm -rf build/*

.PHONY: all build watch clean
