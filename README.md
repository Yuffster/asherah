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
	                   

Asherah is a Markdown-inspired text format for branching narratives (ie, 
conversations) optimized for human readability and use by nontechnical
stakeholders (voice actors, writers, product managers, etc).

The language is whitespace-sensitive (tabs only).

The output of Asherah's parser is a JSON data structure, and the behavior of
each module is left to the discretion of the engine developers.  In this way,
Asherah-based scripts can be used equally well in text-based games as it could
be for modern first-person shooters, platformers, dating sims, etc.

Leading Symbols
-------------

All data types in Asherah are denoted by leading symbols.  The statement will 
continue indefinitely through linebreaks until another supported leading symbol
is provided.

Comments (`%`)
-------------

Any line lead by `%` will be ignored by the parser.

Text Types
-------------

### Narration (`::`)

Narration blocks serve as the foundation of Asherah texts.

### Example

	:: As you stand in uffish thought, you hear a crash through the woods.
	   The Jabberwock, eyes aflame, burbles towards you!

### Description (`"`)

Descriptions are meant to be used in conjunction with narration blocks to add
context to a particular scene, or serve as notes to game artists and developers
concerning the aesthetics of the level.

Depending on the engine type, descriptions might be output to the end-user in 
the form of text.

#### Example

	" This is a dank, dark cave full of dark and probably grues.
	  It would probably be a good idea to stay away from this place,
	  unless you have some sort of light source.

### Character Speech (`(Any Name):`)

Game characters can be referred to by using a standard speech style.  In more 
graphical engines, character names might correspond to actual objects, whereas
simple text-based engines might simply output the line unchanged or partly 
edited.

#### Example

	Jack: Hello!

You may also pass an optional parenthesized phrase to denote the emotion or
extra details concerning a particular line of speech.  This extra metadata 
could be implemented at the engine level to denote character portraits, or
simply left to provide context to voice actors.

	Jack (angry): What did you do that for?!

### Character Action (`@`)

Like character speech, actions are attributable to a particular actor.  They can
be left as simple line notes for developers, references to specific animations,
or simply output to the user in the form of text.

#### Example

	@Jack falls down and breaks his crown.

### Descriptive Statement

Descriptive statements, when rendered as text, will always be rendered as a full
sentence.  This is useful when dealing with dynamic sentence fragments.

Every `."` in a row (including conditionals) will be concatenated into a single
sentence.

	." You take your hat and
	." coat and
	." shake Jack's hand
	." as you leave 

### Descriptive List

Descriptive lists, when displayed as text, will be concatenated together as a
full English sentence.

#### Example

The below text should render, if displayed, as "You have the following items:
one angry cat, two crumbling crackers, and three rubber bands."

	" You have the following items:
	,"one angry cat"
	,"two crumbling crackers"
	,"three rubber bands"

Control Flows
-------------

### Sequence (`>`) and Link (`#`)

Sequence bookmarks designate a point within the text which can be jumped to
using the related link symbol (`#`).

#### Example

This text will loop forever.

	> neverends
	  this is the song that never ends,
	  It just goes on and on my friend.
	  Some people started singing it,
	  not knowing what it was.
	  And they'll continue singing it
	  forever just because
	# neverends

### Choice (`*`)

Branches form the basis of Asherah narratives, allowing the writer to designate 
conditions based on user selection.

The user will be presented with all choices on the current level which are not
broken up by narratives or descriptive blocks, or a jump statement.  Choices
form the top level of a block; anything nested at an indentation level below
them will become part of the choice's particular branch.

#### Example

	@Jack is standing here.
	* Hello, Jack!
		Jack: Why hello!
	* Goodbye, Jack!
		Jack: Goodbye!
	* What are you up to, Jack?
		Jack: Not much.

### Condition (`?`)

Conditionals act much like choices, except that the branch is created by the
result of a call or the value of a variable.

#### Example

	? has_money
		Jack: Step right up, I think I have a lot of things you'll be interested
		in!

#### Condition Fallback (`|`)

Acts in the same way as an else if statement in traditional languages.

	? has_money
		Jack: Step right up, I think I have a lot of things you'll be interested
		in!
	| has_charisma
		Jack: Hm, you look poor, but maybe I can give you a discount.

### Condition Default (`||`)

Acts in the same way as an else statement.

	? has_money
		Jack: Step right up, I think I have a lot of things you'll be interested
		in!
	| has_charisma
		Jack: Hm, you look poor, but maybe I can give you a discount.
	||
		Jack: Go away, these things are for regular people!

### Call (`!`)

Calls can be used to call methods made available by the engine to make use of
the core engine API features, or get advanced data about the situation.

#### Example

	! unleash_hounds 6, 'extra_angry'

Calls may also be used to kick off conditional blocks.  Any engine method can
return `true` or `false` to determine which conditional to follow.

#### Example

In this example, unleash_hounds will return false if the engine determines that
no more hounds are available.

	Jack: You'll be sorry now!
	! unleash_hounds 6, 'extra angry'
		Jack: Ahahaha!
	|| 
		Jack: Crap! What did you do with my hounds?!

Another example would be to have an engine method which initiates combat and 
returns true or false based on the outcome of the battle.

	Jack: Ah, but you haven't seem my FINAL BOSS FORM yet!
	@Jack transforms into a dragon with human legs and a single, beefy arm.
	! combat Trogdor
		Jack: Noooooo, I have been defeatttttteeeeed!
		@Jack fades into the void which has opened up inexplicably.
		:: You have won the game!
	||
		Jack: Ahaha! I knew you'd never be able to defeat my final form! To
		      the dungeon with all of you!
		> dungeon

### Random (`/`) and Random Block (`//`)

A list of random line items and random blocks will act in the same way as a 
choice or conditional, except that the branch chosen is randomized and not
due to user action or set variables.  Random blocks may also be added to the
list of possible choices, and are the same as single-line random statements
except that they take up an entire block.

#### Example

	/ Jack: I say a new thing each time!
	/ Jack: Hello, back again?
	/ Jack: How is the weather?
	/ Jack: Hey there, it's been a while!
	/ Jack: I hope you're not up to any trouble!
	// 
		@Jack blinks wearily at you before yawning.
		Jack: Man, sorry.  Allergies.

Variables and Assignment
-------------

### Assignment (`=`) and Variables (`<>`)

Assignment begins with a `=` and is followed by the variable name, a space, and
the value to be assigned.  Variable placeholders are designated by `<` and `>`.

#### Example

	=player_name Jim
	Jack: Hello, <player_name>!

### Flag (`~`)

The flag operation simply sets a variable to true, creating it if it doesn't
exist.  You can then use it like a normal variable, for example in conditional
statements.

	Jack: Hello!
	* Hello!
		Jack: Thank you for being nice to me.  Nobody is ever nice to me. :(
		~ nice_to_jack
	* ...
	:: A grue jumps out at you from the darkness!
	* Oh, God, help me, Jack!  Help me!
		? nice_to_jack
			@Jack darts in to save you, scaring the grue off with his mighty
			 Keychain Mini Flashlight of Flashing.
		||
			@Jack watches with disinterest as you're torn apart limb from limb
			 by the grue.

### Increment (`+`) and Decrement (`-`)

Numeric variables may be incremented and decremented using + and - respectively.

	=points 20
	Jack: Would you like an additional point?
	* Yes, please.
		Jack: Too bad, I'm taking one away!
		-points
	* No.
		Jack: Well, I'll give you one anyway!
		Jack: Ahaha!
		+points