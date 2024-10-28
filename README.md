# Dwarfy-caster

This project is the result of two weeks of tests with raycasting and dwarf fortress.
It's a very early, buggy, result.

I didn't take time to work on assets and representation, still mostly working on the renderer so their is many issues, assets are a bundle of sprites generated with chatGPT, some free textures and crudely done procedural placeholders.


For now it render the tile layout, buildings, and water, magma, flow (like mist and miasma), and some creatures in real time.

## How to test
You can download one of the zip file in the release directory, extract it somewhere, and just run the file "server-xxx" (depending on your system) to launch it.

The release was done quickly and is unsigned so antivirus and such will probably be upset. I will look into it later.

Alternatively you can install nodeJS, and run the project as a node project (npm install, node ./index.js)

You first need to launch the game with DFHack
https://store.steampowered.com/app/2346660/DFHack__Dwarf_Fortress_Modding_Engine/
It's a modding engine for DF
When the game is running with DFHack, simply load a fort then launch the server and follow the menus

Once the server is up, go to a browser and visit either
http://localhost:8080/indexGL.html to see the openGL version, or
http://localhost:8080/index.html?cast=10,5 to see the raycasting version (I will let it live as long as it stay compatible)
it should load your fortress.

The "10,5" parameters for raycasting are the rendering distance in tiles for horizontal and height view, if fps are low you can reduce them (especially the second) to reduce it and if the FPS are high you can try to increase it.

Your start position will be either the center of your game view or the position of the keyboard cursor, after that if you move them in your game, you can teleport to it by pressing "x" in the viewer.

To enable the keyboard cursor, enter mining mode and press (Alt-k)

In game you can use ZQSD to move around, A and E to go down and up and click on the canvas to capture mouse.

You can pause/unpause your DF game by pressing "space" in the viewer.

The P key switch to QWERTY control scheme.

## Technical considerations

### Raycasting and render
I discovered the principe of raycasting thanks to this video https://www.youtube.com/watch?v=HEb2akswCcw
then implemented it with help from lodev tutorials [[lodev](https://lodev.org/cgtutor/raycasting.html)] and reading various raycasting projects on github.

I added a layer to render multilevel maps, it's not the most elegant things but seems to work mostly ok for now, beside that the raycasting part is really standard and it return the list of hits to the renderer which will draw them in a simple JS canvas.

### DF connection and read
This part is done thanks to the formidable DFhack [[DFhack](https://docs.dfhack.org/en/stable/)] and this project [[dfhack-remote](https://github.com/alexchandel/dfhack-remote)] 


## Futur plan
It seems that i'm beginning to hit the max of what i'm able to get from JS in term of FPS. Raycasting is not used in real software for a reason and it probably won't get very much further.


## Contributions and such
If you want to contribute to the project, all PR, ideas and remark are welcome.
An optimisation of the rendering could give a second life to this project, and replacing placeholders assets with real ones (or even existing ones with nicer version) can really improve apparence without hitting performance since they already technically exist.


## Avertissement
This is an experiment released as is, there is no warranty of anything but I hope it will work for you.