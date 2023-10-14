const { World, Engine, Runner, Render, Bodies, Body, Events } = Matter;

// *** BOILERPLATE CODE ***

const cellsHorizontal = 10;                      // No. of Columns
const cellsVertical = 10;                        // No. of Rows
const width = window.innerWidth;
const height = window.innerHeight;

const unitLengthX = width / cellsHorizontal;
const unitLengthY = width / cellsVertical;

const engine = Engine.create();
// Disabling Gravity
engine.world.gravity.y = 0;

const { world } = engine;

const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width,
        height,
        wireframes: false
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);

// creating the border walls
const walls = [
    Bodies.rectangle(width/2, 0, width, 2, { isStatic: true}),
    Bodies.rectangle(width/2, height, width, 2, { isStatic: true}),
    Bodies.rectangle(0, height/2, 2, height, { isStatic: true}),
    Bodies.rectangle(width, height/2, 2, height, { isStatic: true})
];
World.add(world, walls);



// *** MAZE GENERATION ***

// <<< Naive Approach >>>
// const grid = [];

// for(let i=0 ; i<3 ; i++)
// {
//     grid.push([]);
//     for(let j=0 ; j<3 ; j++)
//     {
//         grid[i].push(false);
//     }
// }
// console.log(grid);


//  <<<<< Better Approach >>>>>
// creating an empty array that has 3 possible places in it and then
// initializing it by throwing some default value inside there...
// then, we'll replace these null values with a "Mapping Statement"
// to generate a 2D Grid with all "false" values inside it!!
const grid = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));


// Creating Verticals and Horizontals
const verticals = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal - 1).fill(false));

const horizontals = Array(cellsVertical - 1)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));


// picking a random starting cell inside the Grid
const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);


// randamizing the maze
const shuffle = (arr) => {
    let counter = arr.length;

    while(counter > 0)
    {
        const index = Math.floor(Math.random() * counter);
        counter--;

        // swapping elements at indices "index" and "counter"
        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }

    return arr;
};


const stepThroughCell = (row, column) => {
    // If we have visited the cell at [row,column], then return
    if(grid[row][column])
    {
        return;
    }

    // Mark this cell as being visited
    grid[row][column] = true;

    // Assemble randomly-ordered list of neighbours (neighbour pairs)
    const neighbours = shuffle([
        [row - 1, column, 'up'],
        [row, column + 1, 'right'],
        [row + 1, column, 'down'],
        [row, column - 1, 'left']
    ]);

    // For each neighbour...
    for(let neighbour of neighbours)
    {
        // Array destructuring
        const [nextRow, nextColumn, direction] = neighbour;

        // See if that neighbour is out of bounds
        if(nextRow < 0 || nextRow >= cellsVertical || 
            nextColumn < 0 || nextColumn >= cellsHorizontal)
        {
            continue;
        }

        // If we have visited that neighbour, continue to next neighbour
        if(grid[nextRow][nextColumn])
        {
            continue;
        }

        // Remove a wall from either "horizontals" (or) "verticals"
        if(direction === 'left')
        {
            verticals[row][column - 1] = true;
        }
        else if(direction === 'right')
        {
            verticals[row][column] = true;
        }
        else if(direction === 'up')
        {
            horizontals[row - 1][column] = true;
        }
        else
        {
            horizontals[row][column] = true;
        }

        // recursive call (going for next cells)
        stepThroughCell(nextRow, nextColumn);
    }
};

stepThroughCell(startRow, startColumn);


// Iterating over walls   [Remember: false => wall, true => no wall]
horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if(open)
        {
            return;
        }

        // creating a wall segment
        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX / 2,  // ~ X
            rowIndex * unitLengthY + unitLengthY,         // ~ Y
            unitLengthX,                                 // ~ Width
            5,                                         // ~ Height
            {
                // Options Object
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle: 'red'
                }
            }
        );

        // Adding the wall created above into our "world" Object
        World.add(world, wall);
    });
});


verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if(open)
        {
            return;
        }

        // creating a wall segment
        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX,      // ~ X
            rowIndex * unitLengthY + unitLengthY / 2,     // ~ Y
            5,                                         // ~ Width
            unitLengthY,                                 // ~ Height
            {
                // Options Object
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle: 'red'
                }
            }
        );

        // Adding the wall created above into our "world" Object
        World.add(world, wall);
    });
});
// So, now we have created the maze :)


// Creating the Goal
const goal = Bodies.rectangle(
    width - unitLengthX / 2,         // ~ X
    height - unitLengthY / 2,        // ~ Y
    unitLengthX * 0.7,               // ~ Width
    unitLengthY * 0.7,               // ~ Height
    {
        label: 'goal',
        isStatic: true,
        render: {
            fillStyle: 'green'
        }
    }
);
World.add(world, goal);


// Creating the Playing Ball
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;

const ball = Bodies.circle(
    unitLengthX / 2,                 // ~ X
    unitLengthY / 2,                 // ~ Y
    ballRadius,               // ~ Radius
    {
        // Options Object
        label: 'ball',
        render: {
            fillStyle: 'yellow'
        }
    }
);
World.add(world, ball);


// Handling Keypresses and Adding Keyboard Controls
document.addEventListener('keydown', (event) => {
    // getting the current velocity of the ball
    const { x, y } = ball.velocity;

    if(event.keyCode === 87)
    {
        // updating the velocity of a shape (In "y" direction)
        Body.setVelocity(ball, { x: x, y: y - 1 });
    }
    if(event.keyCode === 68)
    {
        Body.setVelocity(ball, { x: x + 1, y: y });
    }
    if(event.keyCode === 83)
    {
        Body.setVelocity(ball, { x: x, y: y + 1 });
    }
    if(event.keyCode === 65)
    {
        Body.setVelocity(ball, { x: x - 1, y: y });
    }
});


// Win Condition

Events.on(engine, 'collisionStart', (event) => {
    // This callback function will get invoked every time there's a
    // collision between 2 different shapes inside of our "world"
    event.pairs.forEach((collision) => {
        // checking if "bodyA" and "bodyB" are 'ball' and 'goal'...
        const labels = ['ball', 'goal'];

        if(labels.includes(collision.bodyA.label) && 
            labels.includes(collision.bodyB.label))
        {
            // Adding a Win Animation
            document.querySelector('.winner').classList.remove('hidden');

            engine.world.gravity.y = 1;

            world.bodies.forEach((body) => {
                if(body.label === 'wall')
                {
                    Body.setStatic(body, false);
                }
            });
        }
    });
    // Now we get to see what is actually inside the "pairs" array
    // in the "event" object
    // [It is some kind of object that has a lot of properties that
    // describes the collision that just occured!!]
});





// Maze Generation Algorithm :-
// -----------------------------

// 1. Create a grid of 'cells'
// 2. Pick a random starting cell
// 3. For that cell, build a randomly-ordered list of neighbours
// 4. If a neighbour has been visited before, remove it from the list
// 5. For each remaining neighbour, 'move' to it and remove the wall
//    between those two cells
// 6. Repeat for this new neighbour


// If we ever get to a point where we have no possible moves whatsoever,
// then we would essentially Backtrack.

// The purpose of the "grid" array is to record whether (or) not we
// have visited each individual cell.