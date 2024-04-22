# Dwarfy-caster

This project is the result of two weeks of tests with raycasting and dwarf fortress.
It's a very early, buggy, result.

I didn't take time to work on assets and representation, still mostly working on the renderer so their is many issues, assets are a bundle of sprites generated with chatGPT, some free textures and crudely done procedural placeholders.


For now it render the tile layout, buildings, and water, flow (like mist and miasma), dwarves in real time.


## How to test
You can download one of the zip file in the release directory, extract it somewhere, and just run the file "server-xxx" (depending on your system) to launch it.

The release was done quickly and is unsigned so antivirus and such will probably be upset. I will look into it later.

Alternatively you can install nodeJS, and run the project as a node project (npm install, node ./server.js)

When the server is running use DFhack to launch Dwarf Fortress and load your game then open
http://localhost:8080/index.html?cast=10,5
in your browser it should load your fortress.

The 12,5 parameters are the rendering distance in tiles for horizontal and height view, if fps are low you can reduce them (especially the second to reduce it)

Your start position will be either the center of your game view or the position of the keyboard cursor, after that if you move them in your game, you can teleport to it by pressing "x" in the viewer.

To enable the keyboard cursor, enter mining mode and press (Alt-k)

In game you can use ZQSD to move around, A and E to go down and up and click on the canvas to capture mouse.

The P key switch to QWERTY control scheme.

Sometimes world chunk fail to load or load in the wrong place, you can reset the world around you with the 'C' key. It will also update the tiles around you if they have changed.


## Technical considerations

### Raycasting and render
I discovered the principe of raycasting thanks to this video https://www.youtube.com/watch?v=HEb2akswCcw
then implemented it with help from lodev tutorials [[lodev](https://lodev.org/cgtutor/raycasting.html)] and reading various raycasting projects on github.

I added a layer to render multilevel maps, it's not the most elegant things but seems to work mostly ok for now, beside that the raycasting part is really standard and it return the list of hits to the renderer which will draw them in a simple JS canvas.

### DF connection and read
This part is done thanks to the formidable DFhack [[DFhack](https://docs.dfhack.org/en/stable/)] and this project [[dfhack-remote](https://github.com/alexchandel/dfhack-remote)] 


## Futur plan
It seems that i'm beginning to hit the max of what i'm able to get from JS in term of FPS. This project was intended as proof of concept and I will now look into more performant langage to reimplement it.


## Contributions and such
If you want to contribute to the project, all PR, ideas and remark are welcome.


## Avertissement
This is an experiment released as is, there is no warranty of anything but I hope it will work for you.