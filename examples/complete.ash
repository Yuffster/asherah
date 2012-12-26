> main
" You find yourself in an empty room.
? rainbows
	" A rainbow has formed in the center.
* Wait for something to happen.
	:: Nothing happens.
	# main
* Cry.
	:: You start to cry.
	= crying: true
	? use_magic crying
		:: Since you have magical crying powers, a rainbow forms before your
	  	   eyes.
		= rainbows: true
		! with_ally
			~ revealed_rainbow_powers
	||
		:: Nothing happens.
	# main
* Leave the room.
	:: You step outside.
	@Jack is standing outside.
	? crying
		%Jack (supicious): Were you crying?
		* No!
		* It's just all this cat dander...
		* Maybe.
	? not crying
		Jack: Whoah, you're awesome!
	= paperclips: 0
> takeclips
	:: There are a bunch of paperclips on the ground.
	? no paperclips
		* Take paperclip
			:: You take one of the paperclips.
			+ paperclips
			# takeclips
	? paperclips
		* Eat paperclip
			:: Mmm. Metaly.
			- paperclips
			# takeclips
		* Take another paperclip
			:: You take another paperclip.
			+ paperclips
			= pcs: expand_int <paperclips> paperclip
			:: You now have <pcs> paperclips.
			# takeclips
	* Talk to Jack
		\ Jack: Oh, hello.
		\ Jack: What's up?
		\ Jack: Huh?
		\ Jack: Uh, hi.
		\ Jack: What do you want?
		\ Jack: I say a random thing every time!
		\\ 
			Jack: And sometimes I can say multiple things.
			Jack: Or whatever, since this is a whole block.
		\ Jack: Huzzah.
	* Leave.
:: The game is now over. 
Your final score is <paperclips,0>.
Play again?
* Yes
	= paperclips: 0
	# main
* No
