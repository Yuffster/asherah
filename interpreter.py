#!/usr/bin/env python

import json
import sys

def run_conditionals(sequence, state):
   for condition in sequence:
      pass
   return 1
#   if len(conditionals) > 0:
#      for c in conditionals:
#         print "Should evaluate '%s' as a conditional"%(c['content'])
#         if c['content'] in state and state[c['content']]:
#            run_section(c['children'], state)
#
#   print

def run_choices(sequence, state):
   i = 0
   choices = []
   while i < len(sequence) and sequence[i]['type'] == 'choice':
      choices.append(sequence[i])
      i += 1

   for i,c in enumerate(choices):
      print "%d) %s"%(i+1, c['content'])

   print

   i = None
   while i is None:
      try:
         i = int(raw_input('> '))
      except ValueError:
         i = 0
      if i < 1 or i > len(choices):
         print "Please enter a number between 1 and %d"%(len(choices))
         i = None

      ret = run_section(choices[i-1]['children'], state)
      if ret:
         return ret
   return len(choices)

def run_section(sequence, state):
   i = 0
   while i < len(sequence):
      j = 1
      part = sequence[i]

      if part['type'] == 'descriptive':
         print part['content']
         print

      elif part['type'] == 'conditional':
         ret = run_conditionals(sequence[i:], state)
         if type(ret) == int:
            j = ret
         else:
            return ret

      elif part['type'] == 'sequence':
         if 'children' in part:
            ret = run_section(part['children'])
            if ret:
               return ret

      elif part['type'] == 'choice':
         ret = run_choices(sequence[i:], state)
         if type(ret) == int:
            j = ret
         else:
            return ret

      elif part['type'] == 'link':
         return part['jump']

      elif part['type'] == 'narration':
         print part['content']
         print

      elif part['type'] == 'action':
         print part['content']
         print

      else:
         print "Unknown type %s"%(part['type'])
      
      i += j

   return None

def add_jumps(block, jumps):
   for i, b in enumerate(block):
      if b['type'] == 'sequence':
         jumps[b['content']] = block[i:]
      if 'children' in b:
         add_jumps(b['children'], jumps)


if __name__ == '__main__':
   if len(sys.argv) != 2:
      print "Usage: interpreter.py <json>"
      sys.exit(0)

   f = sys.argv[1]
   data = json.load(open(f))

   # build a jump table
   jump = {}

   add_jumps(data['main'], jump)

   if not 'main' in jump:
      print "No main section found; aborting"
      sys.exit(1)

   state = {}

   try:
      n = run_section(jump['main'], state)
      while n:
         n = run_section(jump[n], state)
   except KeyboardInterrupt:
      print "Done"
