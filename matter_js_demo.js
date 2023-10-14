// extracting relevant values from "Matter-js" library
const { World, Engine, Runner, Render, Bodies, MouseConstraint, Mouse } = Matter;

// *** BOILERPLATE CODE ***

const width = 800;
const height = 600;

// creating a new engine
const engine = Engine.create();

// we're then going to get access to a 'world' that got created along
// with that engine
const { world } = engine;

// creating the render object
const render = Render.create({
    // here, we tell the render where we want to show our representation
    // of everything inside of our HTML document
    element: document.body,
    // It's going to add in a new ADDITIONAL element to the body 
    // element inside of HTML

    // specifying what engine to use
    engine: engine,

    // passing in an "Options" object
    options: {
        // here, we'll specify the "height" and "width" of our CANVAS
        // ELEMENT that's going to be used to display all this content
        width,
        height,

        // Ajdusting the Wireframes Mode of the Canvas
        wireframes: false
    }
});


// telling the "render" object to start working to draw all the updates
// of our 'world' onto the screen
Render.run(render);

// The runner here is what coordinates all these changes from state
// A to state B of our engine
Runner.run(Runner.create(), engine);



// Clicking and Dragging in Matter.js

// creating a 'Constraint' and adding it to the "World"
World.add(world, MouseConstraint.create(engine, {
    // Options Object here...
    mouse: Mouse.create(render.canvas)
}));


// Walls (so that the shapes don't go off the Canvas due to gravity)
const walls = [
    Bodies.rectangle(400, 0, 800, 40, { isStatic: true}),
    Bodies.rectangle(400, 600, 800, 40, { isStatic: true}),
    Bodies.rectangle(0, 300, 40, 600, { isStatic: true}),
    Bodies.rectangle(800, 300, 40, 600, { isStatic: true})
];
World.add(world, walls);


// Random Shapes
for(let i=0 ; i<20 ; i++)
{
    // generating random distribution about the entire Canvas
    let randX = Math.random() * width;
    let randY = Math.random() * height;

    if(Math.random() > 0.5)
    {
        World.add(world, Bodies.rectangle(randX, randY, 50, 50));
    }
    else
    {
        World.add(world, Bodies.circle(randX, randY, 35, {
            // Options Object
            render: {
                // Customizing how the circle gets rendered onto the screen
                fillStyle: 'green'
            }
        }));
    }
}