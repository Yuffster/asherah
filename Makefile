all: examples

examples: examples/complete_output.json

examples/complete_output.json: examples/complete.ash parser.js asherah.js
	node parser.js examples/complete.ash | python -mjson.tool > examples/complete_output.json

.phony: all
.phony: examples
