Asherah, the Platform-Agnostic Narrative Language
========


Asherah is a narrative language that allows you to write interactive fiction in a language that is both human-readable and easy for a computer to execute.

Asherah parses to an intermediate JSON format, which can then be interpreted by a number of different engines; including web-based frontends and command-line interpreters.


Writing Narrative in Asherah
========

Types of statements:
--------
 * Text: narration, actions and speech
 * Links
 * Choices
 * Random choices
 * Conditionals
 * Comments


Text:
-----
Text can be narration, description, actions or speech by a character. In the command-line interpreter, all text is treated equally and printed to the screen. In other interpreters, the text type may dictate which actor reads the text or where it is placed on the screen.

Narrative adds flavor to the story. In Asherah, narrative is depicted by `::`.

Example:

    :: You walk into a bar

Will add the following to the narration track:

    You walk into a bar


Description describes the scene or the room. In Asherah, description is depicted by `"`.

Example:

    " The bar is dark and full of unsavory types

Will add the following to the description track:

    The bar is dark and full of unsavory types


Actions describe what the player character does. In Asherah, actions are depicted by `@`. Actions are usually, but not always, the result of a choice (described later).

Example:

    @ You order a glass of scotch

Will add the following to describe the user's actions:

    You order a glass of scotch


Speech describes something said by one of the characters. In Asherah, speech is ... TODO: describe exactly where speed can occur. In speech, the first part is the actor's name, follow by a colon, and then whatever words that actor should say.

Example:

    :: Scotch: Aye, yah can't order me around lak that!

Will add speech by `Scotch` like:

    Aye, yah can't order me around lak that!


Links
-----

Choices
-------

Random Choices
--------------

Conditionals
------------

Comments
--------
