# Dwarfy-caster

This project is the result of two weeks of tests with raycasting and dwarf fortress.
It's a very early, buggy, result.

For now it allow you to walk in a mostly correct representation of overall shape of the world, plus a few buildings.

## How to test

There is no packed release yet, you just have to download the projet and launch it with nodeJS directly.

Get the last node version from [link] and their instructions. 
When node is working just use command line to go in the repository and launch

node .\server.js

when the server is running use DFhack to launch Dwarf Fortress and load your game then open
http://localhost:8080/index.html
in your browser it should load your fortress.

## Technical considerations

### Raycasting and render
The raycasting part is mostly inspired from lodev tutorials [link] and reading various JS raycasting projects like 
[link]
[link]
and some others.

I tried to add multi level rendering but it's not really ready now and it's deactivated on master to save FPS. I will continue to look into it.

The raycasting part is really standard and it return the list of hits to the renderer which will draw them in a simple JS canvas.

### DF connection and read
This part is done thanks to the formidable DFhack [link] and this project [link] 

## Futur plan
I will try to improve multi level render to allow real representation of exteriors and big constructions, and after that find more assets to support all buildings and tiles.

When it's done I will start to think of the real futur of the whole project.

## Contributions and such
If you want to contribute to the project, all PR, ideas and remarques are welcome.
