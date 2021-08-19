.PHONY: all run clean fmt test

all: run

run:
	@wrangler dev

clean:
	@rm -rf dist/

fmt:
	@npm run format

test:
	@npm run test