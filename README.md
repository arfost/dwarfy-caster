# Dwarfy-caster

This project is the result of two weeks of tests with raycasting and dwarf fortress.
It's a very early, buggy, result.

For now it allows you to walk in a mostly correct representation of overall shape of the world, plus a few buildings.
It show the world layer by layer so it work best inside.

## How to test

There is no packed release yet, you just have to download the projet and launch it with nodeJS directly.

Get the last node version from [[nodeJS](https://nodejs.org/en)] and their instructions. 
When node is working just use command line to go in the repository and launch

``node .\server.js``

when the server is running use DFhack to launch Dwarf Fortress and load your game then open
http://localhost:8080/index.html?pos=x,y,z
in your browser it should load your fortress.
x,y and z are your starts coordonates in the DF map. 
You can find them by entering mining mode (m), enabling the keyboard cursor (Alt-k if it's not already visible), moving the cursor to where you want, then running the `position` command from DFhack

In game you can use ZQSD to move around, A and E to go down and up and click on the canvas to capture mouse.

## Technical considerations

### Raycasting and render
The raycasting part is mostly inspired from lodev tutorials [[lodev](https://lodev.org/cgtutor/raycasting.html)] and reading various raycasting projects.

I tried to add multi level rendering but it's not really ready now and it's deactivated on master to save FPS. I will continue to look into it.

The raycasting part is really standard and it return the list of hits to the renderer which will draw them in a simple JS canvas.

### DF connection and read
This part is done thanks to the formidable DFhack [[DFhack](https://docs.dfhack.org/en/stable/)] and this project [[dfhack-remote](https://github.com/alexchandel/dfhack-remote)] 

## Futur plan
I will try to improve multi level render to allow real representation of exteriors and big constructions, and after that find more assets to support all buildings and tiles.

When it's done I will start to think of the real futur of the entier project.

## Contributions and such
If you want to contribute to the project, all PR, ideas and remark are welcome.

## Avertissement
This is an experiment released as is, there is no warranty of anything but I hope it will work for you.