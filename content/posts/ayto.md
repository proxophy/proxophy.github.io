+++
date = '2025-08-12T16:18:19+02:00'
draft = true
title = 'Solving Reality TV Shows with code'
+++

One of my guilty pleasures is watching reality shows, especially German ones. Two years ago, I watched the show "Are You The One?" and thought about how I could write code to solve the problem that the show is about. 

The premise of "Are You The One?", short "AYTO" is the following: 20 contestants, 10 women and 10 men are secretly paired into 10 pairs or perfect matches according to some matchmaking by "experts" and during the show, they have to find these pairs. If they succeed, they win money, in the German version it's about 10k per person. There are two ways to gain information: Every other episode a pair can go into a "match box" or "truth booth", where the group finds out if they're a match. The episode after the matchbox there is the "matching night", where the contestants match up in ten pairs, and learn how many of those are perfect matches, but not which ones. There are 10 match boxes and 10 matching nights, in the last matching nights they have to find all the pairs to win the money. To make it more difficult, after some episodes a 11th woman or 11th man comes in, who is the second match or double match to a certain person.

So, my goal was to write code that gives you all the possibilities left using the information gained on the matching nights and in the match boxes. If you're not counting the double match, there are 10! = 3628800 possibilities for the ten matches in the start. A perfect match found out with a match box elimates a lot of possibilities early. 

The first approach was to generate all the possibilities left considering the match boxes.