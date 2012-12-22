/*                                                                        
        ##                     /                                       /       
     /####                   #/                                      #/        
    /  ###                   ##                                      ##        
       /##                   ##                                      ##        
      /  ##                  ##                                      ##        
      /  ##          /###    ##  /##      /##  ###  /###     /###    ##  /##   
     /    ##        / #### / ## / ###    / ###  ###/ #### / / ###  / ## / ###  
     /    ##       ##  ###/  ##/   ###  /   ###  ##   ###/ /   ###/  ##/   ###
    /      ##     ####       ##     ## ##    ### ##       ##    ##   ##     ##
    /########       ###      ##     ## ########  ##       ##    ##   ##     ##
   /        ##        ###    ##     ## #######   ##       ##    ##   ##     ##
   #        ##          ###  ##     ## ##        ##       ##    ##   ##     ##
  /####      ##    /###  ##  ##     ## ####    / ##       ##    /#   ##     ## 
 /   ####    ## / / #### /   ##     ##  ######/  ###       ####/ ##  ##     ##
/     ##      #/     ###/     ##    ##   #####    ###       ###   ##  ##    ##
#                                   /                                       /  
 ##                                                                        /   
                           
 Ashera, the Platform-Agnostic Narrative Language.

 (c) 2012 Michelle Steigerwalt <msteigerwalt.com>

 */

function Asherah() {

	/* If we find any of these symbols at the beginning of a line (ignoring
	   leading whitespace), we'll parse it as a statement of the type 
       indicated by the corresponding object key. */
	var types = {
		'sequence'    : '>',
		'link'        : '#',
		'decrement'   : '-',
		'increment'   : '+',
		'assignment'  : '=',
		'comment'     : '%',
		'action'      : '@',
		'choice'      : '*',
		'condition' : '?',
		'call'        : '!',
		'random_block': '\\\\',
		'random'      : '\\',
		'descriptive' : '"',
		'narration'   : '::',
		'speech'      : /(\w+):/,
		'flag'        : '~',
		'condition_default'  : '||',
		'condition_fallback' : '|',
		'descriptive_list_item': ',"',
		'descriptive_statement': '."'
	},
	/* Type attributes define which handler methods should handle which
	   statements. */
	type_atts = {
		/* These types can define the start of blocks.  Any depth position
		   will be in relation to one of these parent elements.  */
		block: [
			'choice',
			'condition',
			'condition_fallback',
			'condition_default',
			'call',
			'random_block',
			'file',
			'sequence'
		],
		/* These types might to be expanded to method calls due to
		   syntactic sugar. */
		callable: [
			'condition', 
			'condition_fallback',
			'assignment'
		],
		/* We have to account for each comparison operation type and
		   linked conditions. */
		condition: [
			'condition',
			'condition_fallback',
			'condition_default',
		],
		descriptive: [
			'descriptive',
			'descriptive_statement',
			'descriptive_list_item'
		],
		/* If any of these types are followed by a line (or lines) without
		   valid leading symbols, indentation level is ignored and said line
	       will be appened to the content of the previous multiline
	       statement. */
		multiline: [
			'action', 'narration', 'speech', 'choice', 'descriptive',
			'descriptive_statement'
		],
		skippable: [
			'comment'
		],
		mathable: [
			'increment', 'decrement'
		],
		output: [
			'action', 'narration', 'speech', 'descriptive'
		]
	}, handlers = {
		skippable: function(s) {
			return null;
		}, random: function(s) {
			return {
				type: 'random_block',
				children: [parse_line(s.content).format()]
			}
		}, link: function(s) {
			s.jump = s.content;
		}, speech: function(s) {
			return {
				actor: s.symbol.match(/^(\w+):/)[1],
				content: s.content
			}
		}, assignment: function(s) {
			var m = s.content.split(':');
			if (m.length>1) {
				return {
					variable: m[0],
					value: m[1].trim()
				}
			}
		}, mathable: function(s) {
			return {
				variable: s.content
			}
		}, condition: function(s) {
			var l = {};
			if (s.content.match(/^otherwise\b/)) {
				s.type = 'condition_default';
				s.content = s.content.replace(/^otherwise\b/, '');
			} 
			if (s.content.match(/^unless\b/)) {
				s.type = 'condition_negative';
				s.content = s.content.replace(/^unless\b/, '');
			} 
			if (s.type=='condition_default'&&s.content) {
				if (s.content.length) {
					bork("Conditional default can't have condition; "
						+"use | or ? instead", s);
				}
			}
			if (s.content.split(/\s/)) {
				l = parse_line('!'+s.content).format();
			}
			return l;
		}, flag: function(s) {
			return {
				variable: s.content,
				value: s.true
			}
		}, call: function(s) {
			var l = {}, words = s.content.trim().split(/\s/);
			if (s.children) l.type = "condition_call";
			l.call = words.shift();
			l.arguments = words;
			return l;
		}, callable: function(s) {
			var call, m = s.content.split('!');
			if (m.length>1) return parse_line('!'+m[1], s.line).format();
			return {};
		}
	//A variable for holding a copy of the original types with escaped regexen.
	//This allows us to use the original patterns for argument expansion.
	}, esc_types = [];

	function bork(mess, n, line) {
		if (!line) {
			line = n.full;
			n    = n.line;
		}
		throw "Syntax error, line "+n+" ("+mess+"): "+line.trim();
	}

	/* Basically a self-important map() operation.  We go through the symbol
	   table and incorporate our symbols into a regular expression that checks
	   the beginning of each line. */
	esc_types = (function(sms) {
		var tmpsyms = {};
		for (var k in sms) {
			tmpsyms[k] = (typeof(sms[k])=="string") ? 
				  sms[k].replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1") 
				//We're storing the statements as RegExp literals, so
				//we need to convert them to strings to make them components
				//of the larger syntax regexp.  We also want to escape any
				//matching blocks so nobody can inadvertently muck with the
				//matching order.
			 	: (sms[k]+'').replace(/[\(\)\/]/g, '');
		} return tmpsyms;
	})(types);


	function Statement(type, match, last, line) {

		var self = {
			type      :  type,
			symbol    :  match[2],
			depth     : ((match[1]||'').length||0),
			indent    :  (match[1]||'')+'',
			content   : (match[3]||'').trim(),
			children  : [],
			prev      : last,
			parent    : null,
			next      : null,
			prevSib   : null,
			nextSib   : null,
			rdepth    : 0,
			line      : line,
			full      : match[0]
		};

		self.is_a = function(type) {
			if (type_atts[type]) {
				return (type_atts[type].indexOf(self.type)>-1);
			} else return type==self.type;
		};

		self.push = function(statement) {
			if (statement) self.children.push(statement);
		};

		self.format = function() {
			var l = {type:self.type,content:self.content}, tl, k;
			for (type in handlers) {
				if (self.is_a(type)) tl = handlers[type](self);
				for (k in tl) l[k] = tl[k];
			}
			var kids = [];
			self.children.forEach(function(c) {
				var l = c.format();
				if (l) kids.push(l);
			});
			if (kids.length>0) l.children = kids;
			return l;
		};

		if (self.indent==-1) self.indent = '';

		//Important when we're dealing with significant whitespace.
		if (self.indent.match(' ') && self.indent.match('\t')) {
			throw "mixed spaces and tabs";
		}

		self.rdepth = (self.prev) ? self.depth - self.prev.depth : 0;

		//This is indented further; create a new sequence.
		if (self.rdepth>0) {
			if (last && !last.is_a('block')) {
				throw "can't start a block under a statement "
				     +"of the type "+last.type;
			} self.parent = last;
		//This is no longer indented; find the preceding parent.
		} else if (self.rdepth<0) {
			var node = last;
			while(node && self.depth - node.depth < 0) {
				node = (node) ? node.parent : false;
				self.rdepth = self.depth - (node) ? node.depth : 1;
			} self.parent = (node) ? node.parent : false;
		//If we're at zero, then our parent is our sibling's parent.
		} else {
			self.prevSib = last;
			if (last) self.parent = last.parent || false;
		}

		if (self.is_a('sequence')) self.depth = 0;

		if (self.parent) self.rdepth = self.depth - self.parent.depth;
		else self.rdepth = 0;

		return self;

	};

	function parse_line(l,last,n) {
		for (var t in esc_types) {
			match = new RegExp('^(\\s*)?'+'('+esc_types[t]+')(.*)').exec(l);
			if (match) return new Statement(t, match, last, n+1);
		}
	};

	function parse(data) {

		var  BREAK = '\n';

		var statements = [], blocks = [];

		data.split(BREAK).forEach(function(l,n) {
			current_line = n+1;
			try {
				var last = statements[statements.length-1],
				    statement = parse_line(l,last,n);
				//If the statement doesn't match any syntax we know of, it's
				//probably a continuation of a preceding multiline statement.
				if (!statement) {
					if (last&&last.is_a('multiline')) {
						last.content += BREAK+l.trim();
					} else throw "invalid statement";
				} else {
					if (statement.parent) statement.parent.push(statement);
					else blocks.push(statement);
					statements.push(statement);
				}
			} catch(e) {
				if (typeof e == 'string') {
					bork (e, n, l);
				} throw e;
			}
		});

		var seqs = {main:[]}, seq = seqs.main, vars = [], calls = [];

		blocks.forEach(function(s) {

			if (s.is_a('sequence')) {
				if (seqs[s.content]&&seqs[s.content].length) {
					bork("Sequence can't be duplicated", s);
				}
				seqs[s.content] = [];
				seq = seqs[s.content];
			}

			var l = s.format();
			if (!l) return;

			seq.push(l);

			(function walk(c) {
				c.forEach(function(l) {
					if (l.variable&&vars.indexOf(l.variable)==-1) {
						vars.push(l.variable);
					}
					if (l.call&&calls.indexOf(l.call)==-1) {
						calls.push(l.call)
					}
					if (l.children) walk(l.children);
				});
			})([l]);

		});

		return {
			sequences: seqs,
			calls: calls,
			variables: vars
		};

	}

	return {
		parse: parse
	};

};

module.exports = new Asherah();