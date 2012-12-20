#!/usr/bin/env python

import json
import sys
import random

def run_conditionals(sequence, state):
   i = 0
   ret = None
   match = False
   while i < len(sequence) and (
         sequence[i]['type'] == 'condition_call' or 
         sequence[i]['type'] == 'condition'):
      if not match:
         c = sequence[i]['content']
         if sequence[i]['type'] == 'condition':
            if c in state and state[c]:
               match = True
               ret = run_section(sequence[i]['children'], state)
         else:
            print "ERROR: Can't evaluate calls in conditionals yet"
      i += 1

   if i < len(sequence) and sequence[i]['type'] == 'condition_default':
      if not match:
         ret = run_section(sequence[i]['children'], state)
      i += 1

   if ret:
      return ret
   return i

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

   if 'children' in choices[i-1]:
      ret = run_section(choices[i-1]['children'], state)
      if ret:
         return ret
   return len(choices)

def run_random(sequence, state):
   i = 0
   choices = []
   while i < len(sequence) and sequence[i]['type'] == 'random_block':
      choices.append(sequence[i]['children'])
      i += 1

   c = random.choice(choices)

   ret = run_section(c, state)
   if ret:
      return ret
   return len(choices)


def run_section(sequence, state):
   i = 0
   while i < len(sequence):
      j = 1
      part = sequence[i]

      if part['type'] in ['descriptive', 'narration', 'action', 'comment']:
         print part['content']
         print

      elif part['type'] == 'speech':
         print "%s: %s"%(part['actor'], part['content'])
         print

      elif part['type'] == 'random_block':
         ret = run_random(sequence[i:], state)
         if type(ret) == int:
            j = ret
         else:
            return ret

      elif part['type'].startswith('condition'):
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

      elif part['type'] == 'assignment':
         var = None
         value = None

         if 'variable' in part and 'value' in part:
            var = part['variable']
            value = part['value']
         else:
            parts = part['content'].split(' ')
            var = parts[0]
            if var.endswith(':'):
               var = var[:-1]
            value = parts[1]

         try:
            value = int(value)
         except ValueError:
            pass
         state[var] = value


      else:
         print "ERROR: Unknown type %s"%(part['type'])
      
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
