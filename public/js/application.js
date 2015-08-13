$(document).ready(function() {
    //Board stuff
    // if player 1 not active powerup goes to wrong place
    // fix egg gfx
    // check many scenarios
    // fix nagini pictures
    // lose points when cut in pieces check?
    // work on player display

    var gameSpeed = 120;
    var powerUpTimer = 40;
    var decayTime = 300;
    var eggTimer = 20;
    var typesOfPowerUps = ["portal", "fireball", "bite", "egg"];

    var board = document.getElementById("board_canvas");
    var context = board.getContext("2d");
    var width = $("#board_canvas").width();
    var height = $("#board_canvas").height();
    var cellWidth = 20;
    var countdown = 0;
    var finished = false;

    // arrays holding types of objects
    var players = [];
    var fireballs = [];
    var eggs = [];
    var portals = [];
    var powerUps = [];
    var winner;
    var titleScreenNo = 1;
    var started = false;

    var startingPositions = [{x:0,   y:0,  direction:"right"}, // mara
                             {x:23,   y:1, direction:"left"}, // nagini
                             {x:0,  y:30,  direction:"right"}, // unicorn
                             {x:23,  y:31, direction:"left"}, // chuck
                             {x: 0, y:15,  direction:"right"}, //sss hyda
                             {x: 23, y:16, direction:"left"}, // kaa
                             {x: 16,  y:0, direction:"down"}, // toothpick
                             {x: 15, y:25, direction:"up"} // benj
    ];

    function Egg(name, x, y, direction) {
        this.name = name;
        this.timer = eggTimer;
        this.x = x;
        this.y = y;
        this.direction = direction;

        if (this.direction == "up")
        {
            this.y += 1;
            this.direction = "down";
        }
        else if (this.direction == "down")
        {
            this.y -= 1;
            this.direction = "up";
        }
        else if (this.direction == "right")
        {
            this.x -= 1;
            this.direction = "left";
        }
        else if (this.direction == "left")
        {
            this.x += 1;
            this.direction = "right";
        }
        console.log("egg created " + this.name + " " + this.position)
    }

    Egg.prototype.hatch = function() {
        var snakeIndex = players.map(function(snake) {
            return snake.name;
        }).indexOf(this.name);
        var oldSnake = new Snake(players[snakeIndex].name, players[snakeIndex].foodType, players[snakeIndex].color, players[snakeIndex].id, players[snakeIndex].gameId, players[snakeIndex].body.length)
        oldSnake.body = players[snakeIndex].body;
        oldSnake.alive = false;
        oldSnake.old = true;
        oldSnake.score = -1000;
        players.push(oldSnake);
        if (this.direction == "up")
            players[snakeIndex].body = [{x: this.x, y: this.y-1, direction: this.direction}];
        else if (this.direction == "down")
            players[snakeIndex].body = [{x: this.x, y: this.y+1, direction: this.direction}];
        else if (this.direction == "right")
            players[snakeIndex].body = [{x: this.x+1, y: this.y, direction: this.direction}];
        else if (this.direction == "left")
            players[snakeIndex].body = [{x: this.x-1, y: this.y, direction: this.direction}];
        players[snakeIndex].body = [{x: this.x, y: this.y, direction: this.direction}];
        players[snakeIndex].direction = this.direction;
        players[snakeIndex].score /= 2;
        players[snakeIndex].alive = true;
        players[snakeIndex].head = {};
        players[snakeIndex].decayCounter = decayTime;
        players[snakeIndex].advanceOne();
        players[snakeIndex].toGrow = 1;
        $('#player_powerup_image_' + players[snakeIndex].id).css('background-image', '');
        $('#player_snake_' + players[snakeIndex].id + '_score').html(players[snakeIndex].score);
        eggs.shift();
    }

    Egg.prototype.age = function () {
        if (this.timer > 1)
        {
            this.timer -= 1;
        }
        if (this.timer == 1)
        {
            this.hatch();
            this.timer -=1;
        }
    }

    function findWithAttr(array, attr, value) {
        for(var i = 0; i < array.length; i += 1) {
            if(array[i][attr] === value) {
                return i;
            }
        }
    }

    function Fireball(direction, x, y) {
        this.direction = direction;
        this.body = [{x: x,y: y}, {x: x, y: y}];
        if (direction == "up")
        {
            this.body[0].y -= 2;
            this.body[1].y -= 1;
        }
        if (direction == "down")
        {
            this.body[0].y += 2;
            this.body[1].y += 1;
        }
        if (direction == "right")
        {
            this.body[0].x += 2;
            this.body[1].x += 1;
        }
        if (direction == "left")
        {
            this.body[0].x -= 2;
            this.body[1].x -= 1;
        }
    }

    function paintFireballs() {
        fireballs.forEach (function(fireball) {
            fireball.paint();
        })
    }

    Fireball.prototype.paint = function() {
        var path = '/fireball/' + this.direction + '.png';
        var imageObj = new Image();
        imageObj.src = path;
        var pattern = context.createPattern(imageObj, 'repeat');
        paintCell(this.body[0], pattern);
        context.fillStyle = pattern;
        if (this.direction == "right")
            context.drawImage(imageObj, (this.body[0].x*cellWidth)-cellWidth, this.body[0].y*cellWidth);
        if (this.direction == "left")
            context.drawImage(imageObj, this.body[0].x*cellWidth, this.body[0].y*cellWidth);
        if (this.direction == "up")
            context.drawImage(imageObj, this.body[0].x*cellWidth, this.body[0].y*cellWidth);
        if (this.direction == "down")
            context.drawImage(imageObj, this.body[0].x*cellWidth, (this.body[0].y*cellWidth)-cellWidth);
    }

    Fireball.prototype.checkForCollision = function() {
        for(var playersIndex = 0; playersIndex < players.length; playersIndex++)
        {
            for(var bodyIndex = 0; bodyIndex < players[playersIndex].body.length; bodyIndex++)
            {
                if ((players[playersIndex].body[bodyIndex].x == this.body[0].x && players[playersIndex].body[bodyIndex].y == this.body[0].y) || (players[playersIndex].body[bodyIndex].x == this.body[1].x && players[playersIndex].body[bodyIndex].y == this.body[1].y) )
                {
                    players[playersIndex].loseTail(players[playersIndex].body[bodyIndex]);
                }

            }
        }
    }

    Fireball.prototype.moveOne = function() {
        if (this.direction == "up")
        {
            this.body[0].y -= 2;
            this.body[1].y -= 2;
        }
        if (this.direction == "down")
        {
            this.body[0].y += 2;
            this.body[1].y += 2;
        }
        if (this.direction == "right")
        {
            this.body[0].x += 2;
            this.body[1].x += 2;
        }
        if (this.direction == "left")
        {
            this.body[0].x -= 2;
            this.body[1].x -= 2;
        }
    };

    function PowerUp() {
        this.name = randomPowerUpType();
        this.location = {x: Math.round(Math.random()*(width-cellWidth)/cellWidth),
                         y: Math.round(Math.random()*(height-cellWidth)/cellWidth)};
    }

    function randomPowerUpType() {
        return typesOfPowerUps[Math.floor(Math.random() * typesOfPowerUps.length)];
    }

    function Portal(x, y, direction) {
        this.blue = {x: x, y: y};
        this.orange = {};
        this.direction = direction;
        if (direction == "up")
        {
            this.orange = {x: x, y: y+33}
        }
        if (direction == "down")
        {
            this.orange = {x: x, y: y-33}
        }
        if (direction == "right")
        {
            this.orange = {x: x-33, y: y}
        }
        if (direction == "left")
        {
            this.orange = {x: x+33, y: y}
        }
    }

    //Player
    function Snake(name, foodType, color, id, gameId, length) {

        this.powerUp = {name: ""}
        this.old = false;
        this.startingPosition = startingPositions.shift();
        this.name = name;
        this.id = id;
        this.gameId = gameId;
        this.color = color;
        this.score = 0;
        this.foodType = foodType;
        this.direction = this.startingPosition.direction;
        this.body = [];
        this.alive = true;
        this.food = {};
        this.head = {};
        this.toGrow = 0;
        this.toShrink = 0;
        this.decayCounter = decayTime;
        this.color = this.getColor();

        if (this.direction == "right")
        {
            for(var i = this.startingPosition.x+length-1; i>=this.startingPosition.x; i--)
            {
                this.body.push({x: i, y:this.startingPosition.y, direction:this.direction});
            }
        }
        else if (this.direction == "left")
        {
            for(var i = this.startingPosition.x; i<=this.startingPosition.x+length-1; i++)
            {
                this.body.push({x: i, y:this.startingPosition.y, direction:this.direction});
            }
        }
        else if (this.direction == "down")
        {
            for(var i = this.startingPosition.y+length-1; i>=this.startingPosition.y; i--)
            {
                this.body.push({x: this.startingPosition.x, y:i, direction:this.direction});
            }
        }
        else if (this.direction == "up")
        {
            for(var i = this.startingPosition.y; i<=this.startingPosition.y+length-1; i++)
            {
                this.body.push({x: this.startingPosition.x, y:i, direction:this.direction});
            }
        }

        $('#player_snake_' + this.id + '_score').html(this.score);
    }

    Snake.prototype.usePowerUp = function() {
        if(this.powerUp.name != "egg" || this.powerUp.name != "portal")
        {
            this.powerUp.use(this);
            this.powerUp = {};
            $('#player_powerup_image_' + this.id).css('background-image', '');
        }
    }

    PowerUp.prototype.use = function(snake) {
        if (this.name == "fireball")
            this.fireball(snake);
        if (this.name == "bite")
            this.bite(snake);
    }

    Snake.prototype.loseTail = function(part) {
        this.score -= 3
        $('#player_snake_' + this.id + '_score').html(this.score);
        var index = this.body.indexOf(part);
        index += 1;
        this.body.splice(index, this.body.length - index);
    }

    PowerUp.prototype.fireball = function(user) {
        fireballs.push(new Fireball(user.direction, user.head.x, user.head.y));

    }

    PowerUp.prototype.bite = function(snake) {
        snake.biteTimer = 5;
    }

    PowerUp.prototype.portal = function(snake) {
    }

    Snake.prototype.getColor = function() {
        if (this.name == "mara")
            return "pink";
        if (this.name == "benjy")
            return "orange";
        if (this.name == "nagini")
            return "darkgreen";
        if (this.name == "kaa")
            return "lightgreen";
        if (this.name == "toothpick")
            return "brown";
        if (this.name == "unicorn")
            return "purple";
        if (this.name == "chuck")
            return "red";
        if (this.name == "hydra")
            return "blue";
    };

    Snake.prototype.win = function() {
        $.ajax({
            type: 'post',
            url: '/game/' + this.gameId + '/snake/' + this.name + '/win'
        })
    };

    Snake.prototype.hasHighestScore = function() {
        for(var playerIndex = 0; playerIndex < players.length; playerIndex++)
        {
            if(this.id != playerIndex)
            {
                if (this.score <= players[playerIndex].score)
                {
                    return false;
                }
            }
        }
        return true;
    };

    // Snake Image helpers

    Snake.prototype.findBodyPartImage = function(index) {
        var path = '/snakes/' + this.name + '/' + this.getDirection(index) + '/' + this.getBodyPart(index) + '.png';
        var imageObj = new Image();
        imageObj.src = path;
        return imageObj;
    };

    Snake.prototype.findSkeletonPartImage = function(index) {
        var path = '/snakes/skeleton/' + this.getDirection(index) + '/' + this.getBodyPart(index) + '.png';
        var imageObj = new Image();
        imageObj.src = path;
        return imageObj;
    }

    Snake.prototype.getDirection = function(index) {
        if (index == 0)
            return this.body[index].direction;
        if (index == this.body.length - 1)
        {
            return this.body[index - 1].direction;
        }
        else
        {
            return this.body[index].direction;
        }
    }


    Snake.prototype.getBodyPart = function(index) {
        var thisPart = this.body[index];
        var nextPart;
        if (index == 0)
        {
            return "head";
        }
        nextPart = this.body[index - 1];

        if (index == this.body.length - 1)
        {
            return "tail";
        }

        if (thisPart.direction == nextPart.direction)
        {

            return "straight";

        }
        else
        {
            if (isRightTurn(thisPart, nextPart))
            {
                return "turnRight";
            }
            else
            {
                return "turnLeft";
            }
        }
    }

    function findBodyPartPath(name, part) {
        var path = '/snakes/' + name + '/left/' + part + '.png';
        return path;
    }

    function isRightTurn(thisPart, nextPart)
    {
        if (thisPart.direction == "up" && nextPart.direction == "right" ||
            thisPart.direction == "down" && nextPart.direction == "left" ||
            thisPart.direction == "left" && nextPart.direction == "up" ||
            thisPart.direction == "right" && nextPart.direction == "down")
        {
            return true;
        }
        return false;

    }

    // Moving
    Snake.prototype.move = function() {
        if (this.alive)
        {
            this.moveOne();
        }
        else
        {
            if (this.decayCounter > 0)
                this.decayCounter -= 1;
        }
        if (this.biteTimer > 0)
            this.biteTimer -= 1;
    };

    Snake.prototype.advanceOne = function() {
        this.head.x = this.body[0].x;
        this.head.y = this.body[0].y;

        if(this.direction == "right") this.head.x++;
        else if(this.direction == "left") this.head.x--;
        else if(this.direction == "up") this.head.y--;
        else if(this.direction == "down") this.head.y++;

        this.checkForFood();
        this.checkForPowerUp();
        if (this.toShrink > 0)
        {
            this.body.pop();
            this.toShrink = false;
            this.toShrink -= 1;
        }
        if (this.toGrow == 0)
        {
            this.body.pop();
        }
        else
        {
            this.toGrow -= 1;
        }

        this.body.unshift({x:this.head.x, y:this.head.y, direction:this.direction});
    };

    Snake.prototype.moveOne = function() {
        this.head.x = this.body[0].x;
        this.head.y = this.body[0].y;

        if(this.direction == "right") this.head.x++;
        else if(this.direction == "left") this.head.x--;
        else if(this.direction == "up") this.head.y--;
        else if(this.direction == "down") this.head.y++;
        hasCollision = this.hasCollision()
        if (hasCollision === true)
        {
            portalIndex = this.findPortal();
            if (portalIndex != undefined)
            {
                this.hitPortal(portalIndex);
            }
            else if (this.powerUp.name == "portal" && !this.checkSnakeCollision())
            {
                this.usePortal();
            }
            else
            {
                this.kill();
            }
        }
        else if (hasCollision === false)
        {
            this.checkForFood();
            this.checkForPowerUp();
            if (this.toShrink > 0)
            {
                this.body.pop();
                this.toShrink = false;
                this.toShrink -= 1;
            }
            if (this.toGrow == 0)
            {
                this.body.pop();
            }
            else
            {
                this.toGrow -= 1;
            }

            this.body.unshift({x:this.head.x, y:this.head.y, direction:this.direction});
        }
    };

    Snake.prototype.adjustHeadFromPortal = function() {

        if (this.direction == "up")
        {
            this.head.y += 33;
        }
        if (this.direction == "down")
        {
            this.head.y -= 33;
        }
        if (this.direction == "right")
        {
            this.head.x -= 33;
        }
        if (this.direction == "left")
        {
            this.head.x += 33;
        }
    }

    Portal.prototype.findColor = function(snakeHead) {
        if (snakeHead.x == this.blue.x && snakeHead.y == this.blue.y )
            return "blue";
        else
            return "orange";
        console.log("color find fail");
    }

    // Food
    Snake.prototype.checkForFood = function() {
        if(this.head.x == this.food.x && this.head.y == this.food.y)
        {
            //this.growOtherPlayers();
            this.toGrow += 4;
            this.score++;
            $('#player_snake_' + this.id + '_score').html(this.score);
            this.createFood();
        }
    };

    Snake.prototype.checkForPowerUp = function() {
        for(var index = 0; index < powerUps.length; index++)
        {
            if (this.head.x == powerUps[index].location.x && this.head.y == powerUps[index].location.y)
            {
                this.powerUp = powerUps[index];
                powerUps.splice(index, 1);
                var path = '/powerups/' + this.powerUp.name + '.png';
                $('#player_powerup_image_' + this.id).css('background-image', 'url(' + path + ')');
            }
        }
    };

    Snake.prototype.createFood = function() {
        this.food = {
            x: Math.round(Math.random()*(width-cellWidth)/cellWidth),
            y: Math.round(Math.random()*(height-cellWidth)/cellWidth)
        };
    };

    Snake.prototype.foodTypeImage = function() {

        var path = '/foods/' + this.foodType + '.png';
        var imageObj = new Image();
        imageObj.src = path;
        return imageObj;
    }

    Snake.prototype.growOtherPlayers = function() {
        players.forEach(function(player) {
            if (player.name != this.name)
            {
                player.toGrow += 1;
            }
        });
    };

    Snake.prototype.shrinkOtherPlayers = function() {
        players.forEach(function(player) {
            if (player != this)
            {
                player.toShrink += 1;
            }
        });
    };

    // Collision
    Snake.prototype.kill = function() {
        this.alive = false;
        $('#player_powerup_image_' + this.id).css('background-image', '')
        if (this.powerUp.name == "egg")
        {
            this.powerUp.name = "";
            eggs.push(new Egg(this.name, this.body[this.body.length-1].x, this.body[this.body.length-1].y, this.body[this.body.length-1].direction));
        }
    };

    Snake.prototype.hasCollision = function() {
        if(this.checkBorderCollision() || this.checkSnakeCollision())
        {
            return true;
        }
        return false;
    };

    Snake.prototype.findPortal = function() {
        var index;
        for(index = 0; index < portals.length; index++)
        {
            if((portals[index].blue.x == this.head.x && portals[index].blue.y == this.head.y) || (portals[index].orange.x == this.head.x && portals[index].orange.y == this.head.y))
                return index;
        }
    };

    Snake.prototype.hitPortal = function(portalIndex) {
        this.adjustHeadFromPortal();
        this.checkForFood();
        this.checkForPowerUp();
        if (this.toShrink > 0)
        {
            this.body.pop();
            this.toShrink = false;
            this.toShrink -= 1;
        }
        if (this.toGrow == 0)
        {
            this.body.pop();
        }
        else
        {
            this.toGrow -= 1;
        }
        this.body.unshift({x:this.head.x, y:this.head.y, direction:this.direction});
    }

    Snake.prototype.usePortal = function() {
        $('#player_powerup_image_' + this.id).css('background-image', '');
        this.powerUp.name = "";
        var portal = new Portal(this.head.x, this.head.y, this.direction);
        portals.push(portal);
        this.hitPortal(portals.length - 1);
    }

    Snake.prototype.checkBorderCollision = function() {
        if (this.head.x == -1 || this.head.x == width/cellWidth || this.head.y == -1 || this.head.y == height/cellWidth)
        {
            return true;
        }
        return false;
    };

    Snake.prototype.checkSnakeCollision = function() {
        for(var playerIndex = 0; playerIndex < players.length; playerIndex++)
        {
            for(var index = 0; index < players[playerIndex].body.length; index++)
            {
                if((players[playerIndex].body[index].x == this.head.x && players[playerIndex].body[index].y == this.head.y) && players[playerIndex].decayCounter > 0)
                {
                    if (this.biteTimer > 0)
                    {
                        players[playerIndex].loseTail(players[playerIndex].body[index]);
                        return false;
                    }
                    return true;
                }
            }
        }
        return false;
    }

    // Painting
    function paintWinBoard()
    {
        paintBoard();
        var output;
        if (winner == "tie")
        {
            paintSnakes();
            paintFood();
            context.fillStyle = "black";
            output = "Tie!";
        }
        else
        {
            output = winner.name.capitalize() + ' wins!';
            paintSnake(winner);
            context.fillStyle = winner.color;
        }
        context.font="62px arial";
        context.fillText(output,200,320);
    }

    function paintBoard()
    {
        bg = new Image();
        bg.src = '/body-bg.gif';
        var pattern = context.createPattern(bg, "repeat");
        context.fillStyle = pattern;
        context.fillRect(0, 0, width, height);
    }

    function paintSnakes()
    {

        for(var playerIndex = 0; playerIndex < players.length; playerIndex++)
        {
            paintSnake(players[playerIndex]);
        }

    }

    function paintBite(head)
    {
        biteImage = new Image();
        biteImage.src = '/body-bg.gif';
        var pattern = context.createPattern(biteImage, "repeat");
        paintCell(head, pattern);
    }

    function paintSnake(player)
    {
        for(var index = 0; index < player.body.length; index++)
        {
            if (player.alive)
            {
                var pattern = context.createPattern(player.findBodyPartImage(index), "repeat");
                var cell = player.body[index];
                paintCell(cell, pattern);
                if (player.biteTimer > 0 && index == 0)
                    paintBite(player.body[0])
            }
            else
            {
                context.save();
                context.globalAlpha = ((player.decayCounter) * 2) / decayTime; // refactor
                var pattern = context.createPattern(player.findSkeletonPartImage(index), "repeat");
                var cell = player.body[index];
                paintCell(cell, pattern);
                context.restore();
                if (player.decayCounter > (decayTime / 2))
                {
                    context.save();
                    context.globalAlpha = ((player.decayCounter - (decayTime / 2)) * 2) / decayTime;
                    var pattern = context.createPattern(player.findBodyPartImage(index), "repeat");
                    var cell = player.body[index];
                    paintCell(cell, pattern);
                    context.restore();
                }
            }
        }
    }

    function paintSkeletonPart(direction, part)
    {
            var pattern = context.createPattern(findSkeletonImage(direction, part), "repeat");
            var cell = player.body[index];
            paintCell(cell, pattern);
    }

    function paintControlBoard()
    {
        var path = '/snakes/controls.png';
        var controls = new Image();
        controls.src = path;
        var pattern = controlsContext.createPattern(controls, "repeat");
        controlsContext.fillStyle = pattern;
        controlsContext.fillRect(0, 0, width, height);
    }

    function paintFood()
    {
        players.forEach(function(player) {
            if (player.alive)
            {
                var path = '/foods/' + player.foodType + '.png';
                var foodImage = new Image();
                foodImage.src = path;
                var pattern = context.createPattern(foodImage, "repeat");
//                paintCell(player.food, pattern);
                context.fillStyle = pattern;
                context.fillRect(player.food.x*cellWidth, player.food.y*cellWidth, cellWidth, cellWidth);
                context.strokeStyle = player.color;
                context.strokeRect(player.food.x*cellWidth-1, player.food.y*cellWidth-1, cellWidth+2, cellWidth+2);
            }
        });
    }


    function paintCell(cell, pattern)
    {
        context.fillStyle = pattern;
        context.fillRect(cell.x*cellWidth, cell.y*cellWidth, cellWidth, cellWidth);

    }

    function paintEggs() {
        eggs.forEach( function(egg) {
            var imageObj = new Image();
            imageObj.src = '/snakes/egg.png'
            var pattern = context.createPattern(imageObj, 'repeat');
            paintCell({x: egg.x, y: egg.y}, pattern);
        });
    }

    function init(players)
    {
        finished = false;
        winner = null;
        if (players)
        {
            startingPositions = [{x:0,   y:0,  direction:"right"}, // mara
                {x:23,   y:1, direction:"left"}, // nagini
                {x:0,  y:30,  direction:"right"}, // unicorn
                {x:23,  y:31, direction:"left"}, // chuck
                {x: 0, y:15,  direction:"right"}, // hyda
                {x: 23, y:16, direction:"left"}, // kaa
                {x: 16,  y:0, direction:"down"}, // toothpick
                {x: 15, y:25, direction:"up"}]; // benj

            players.forEach(function(player) {
                player.createFood();
            });
            if(typeof game_loop != "undefined") clearInterval(game_loop);
            game_loop = setInterval(round, gameSpeed);
        }
        else
        {
            if(typeof title_loop != "undefined")
                clearInterval(title_loop);
            title_loop = setInterval(paintTitleScreen, 220);
        }
    }

    function paintTitleScreen() {
        if (started)
            clearInterval(title_loop);
        var path = '/finalstage' + titleScreenNo + '.png';
        if (titleScreenNo == 1)
            titleScreenNo = 2;
        else
            titleScreenNo = 1;
        var bgImage = new Image();
        bgImage.src = path;
        bgImage.onload = function(){
            var pattern = context.createPattern(this, "repeat");
            context.fillStyle = pattern;
            context.rect(0,0,width,height);
            context.fill();
        };
    }

    function paintCountDownBoard() {
        paintBoard();
        paintSnakes();
        paintCountDown();
    }

    function paintCountDown() {
        var output;
        var fontsize;

        if (countdown > 12)
        {
            output = "3"; // 13 14 15 16
        }
        else if (countdown > 7)
        {
            output = "2"; // 8 9 10 11
        }
        else if (countdown > 3)
        {
            output = "1"; // 4 5 6 7
        }

        if (countdown % 4 == 0)
            fontsize = "150";
        if (countdown % 4 == 3)
            fontsize = "120";
        if (countdown % 4 == 2)
            fontsize = "90";
        if (countdown % 4 == 1)
            fontsize = "60";
        if (countdown < 4)
        {
            output = "Go!";
            fontsize = "150";
        }
        context.font= fontsize + "px arial";
        context.fillStyle = "black";
        context.fillText(output,280,320);
    }

    function createPowerUp()
    {
        powerUps.push(new PowerUp());
    }

    function paintPowerUps()
    {
        powerUps.forEach(function(powerUp) {
            var path = '/powerups/' + powerUp.name + '.png';
            var powerupImage = new Image();
            powerupImage.src = path;
            var pattern = context.createPattern(powerupImage, "repeat");
            context.fillStyle = pattern;
            context.fillRect((powerUp.location.x*cellWidth), (powerUp.location.y*cellWidth), cellWidth, cellWidth);
        });
    }

    function paintPortals()
    {
        portals.forEach(function(portal) {
            var path = '/portal/blue-' + portal.direction + '.png';
            var bluePortal = new Image();
            bluePortal.src = path;
            path = '/portal/orange-' + portal.direction + '.png';
            var orangePortal = new Image();
            orangePortal.src = path;
            var bluePattern = context.createPattern(bluePortal, "repeat");
            var orangePattern = context.createPattern(orangePortal, "repeat");

            if (portal.direction == "up")
            {
                context.fillStyle = bluePattern;
                context.fillRect((portal.blue.x)*cellWidth, (portal.blue.y+1)*cellWidth, cellWidth, cellWidth);
                context.fillStyle = orangePattern;
                context.fillRect((portal.orange.x)*cellWidth, (portal.orange.y-1)*cellWidth, cellWidth, cellWidth);
            }
            if (portal.direction == "down")
            {
                context.fillStyle = bluePattern;
                context.fillRect((portal.blue.x)*cellWidth, (portal.blue.y-1)*cellWidth, cellWidth, cellWidth);
                context.fillStyle = orangePattern;
                context.fillRect((portal.orange.x)*cellWidth, (portal.orange.y+1)*cellWidth, cellWidth, cellWidth);
            }
            if (portal.direction == "right")
            {
                context.fillStyle = bluePattern;
                context.fillRect((portal.blue.x-1)*cellWidth, (portal.blue.y)*cellWidth, cellWidth, cellWidth);
                context.fillStyle = orangePattern;
                context.fillRect((portal.orange.x+1)*cellWidth, (portal.orange.y)*cellWidth, cellWidth, cellWidth);
            }
            if (portal.direction == "left")
            {
                context.fillStyle = bluePattern;
                context.fillRect((portal.blue.x+1)*cellWidth, (portal.blue.y)*cellWidth, cellWidth, cellWidth);
                context.fillStyle = orangePattern;
                context.fillRect((portal.orange.x-1)*cellWidth, (portal.orange.y)*cellWidth, cellWidth, cellWidth);
            }

        })
    }

    function round()
    {
        if (countdown < 4)
        {
            if (winner)
            {
                players.forEach(function(player) {
                    if (player.alive)
                    {
                        player.kill();
                    }
                });
                paintWinBoard();
            }
            else
            {
                if (powerUpTimer == 0)
                {
                    createPowerUp();
                    powerUpTimer = Math.floor(Math.random() * 120) + 30;
                }

                paintBoard();
                paintPortals();
                paintEggs();
                paintSnakes();
                if (powerUps.length > 0)
                    paintPowerUps();
                paintFood();

                paintFireballs();


                fireballs.forEach(function(fireball) {
                    fireball.checkForCollision();
                });
                players.forEach(function(player) {
                    player.move();
                });
                fireballs.forEach(function(fireball) {
                    fireball.moveOne();
                });
                eggs.forEach(function(egg) {
                    egg.age();
                });
                if (checkForWin())
                {
                    winner = findWinner();
                    if (winner != "tie")
                        winner.win();
                }
                powerUpTimer -= 1;

            }
            if (countdown != 0)
            {

                paintCountDown();
                countdown -= 1;
            }
        }
        else
        {
            paintCountDownBoard();
            countdown -= 1;
        }
    }

    function checkForWin()
    {
        realPlayers = [];
        players.forEach(function(player) {
            if(player.old == false)
                realPlayers.push(player)
        });
        if (realPlayers.length > 1)
        {
            var alivePlayer = {};
            var aliveCount = 0;
            realPlayers.forEach(function(player) {
                if (player.alive)
                {
                    alivePlayer = player;
                    aliveCount++;
                }
            });
            if ((aliveCount == 0 && eggs.length == 0) || (aliveCount == 1 && alivePlayer.hasHighestScore()) && eggs.length == 0)
                return true;
            return false;
        }
        else
        {
            return !realPlayers[0].alive && eggs.length == 0;
        }
    }

    function findWinner()
    {
        var highest;
        players.forEach(function(player) {
            if (player.hasHighestScore())
            {
                highest = player;
            }
        });
        if (highest == null)
            return "tie";
        return highest;
    }

    // Input

    // PLAY
    $(function() {
        $(".button").click(function(event) {
            event.preventDefault();

            $.post("/play", $("#players").serialize(), function (response) {
                started = true;
                powerUpTimer = Math.floor(Math.random() * 4) + 1;
                countdown = 16;
                var data = JSON.parse(response)
                players = [];
                eggs = [];
                powerUps = [];
                portals = [];
                startingPositions = [{x:0,   y:0,  direction:"right"}, // mara
                    {x:23,   y:1, direction:"left"}, // nagini
                    {x:0,  y:30,  direction:"right"}, // unicorn
                    {x:23,  y:31, direction:"left"}, // chuck
                    {x: 0, y:15,  direction:"right"}, // hyda
                    {x: 23, y:16, direction:"left"}, // kaa
                    {x: 16,  y:0, direction:"down"}, // toothpick
                    {x: 15, y:25, direction:"up"}]; // benj
                for(var i = 0; i < data.length; i++)
                {
                    players.push(new Snake(data[i].name, data[i].food, data[i].color, i, data[i].game_id, 8));
                }
                init(players);
            });

        });
    });

    $('.player_snake').change(function () {
        var data = $(this).val().split('_');
        var snakeName = data[0];
        var color = data[1];
        var food = data[2];
        var playerIdName = $(this).attr('id');
        var playerId = playerIdName.charAt(playerIdName.length - 1);
        $('#head_' + playerId).attr("src", findBodyPartPath(snakeName, "head"));
        $('.body_' + playerId).attr("src", findBodyPartPath(snakeName, "straight"));
        $('#tail_' + playerId).attr("src", findBodyPartPath(snakeName, "tail"));
        $(this).parent().css("border", '3px solid ' + color);
        $(this).parent().css("color", color);
        $('#player_food_image_' + playerId).css('border', '2px solid ' + color);
        $('#player_food_' + playerId).val(food);
        $('#player_food_image_' + playerId).css('background-image', 'url(' + getFoodImage($('#player_food_' + playerId).val()) + ')');
        $.ajax({
            type: 'get',
            url: '/' + snakeName + '/stats',
            success: function(response){
                data = JSON.parse(response)
                $('#player_snake_' + playerId + '_strength').html('<div class="strength">Strength: ' + '<canvas id="strength_' + playerId + '" width="80" height="10"></canvas></div>');
                fillInStatMeter(data['strength'], '#strength_' + playerId, "red")
                $('#player_snake_' + playerId + '_personality').html('<div class="personality">Personality: ' + '<canvas id="personality_' + playerId + '" width="80" height="10"></canvas></div>');
                fillInStatMeter(data['personality'], '#personality_' + playerId, "blue")
                $('#player_snake_' + playerId + '_score').html('0');
            }
        });

    });

    $('.player_food').change(function () {
        var food = $(this).val();
        var playerIdName = $(this).attr('id');
        var playerId = playerIdName.charAt(playerIdName.length - 1);
        $('#player_food_image_' + playerId).css('background-image', 'url(' + getFoodImage(food) + ')');
    });

    function getFoodImage(food)
    {
        var path = '/foods/' + food + '.png';
        return path;
    }

    $(document).keydown(function(e){
        var key = e.which;
        if (players[0]) {
          if(key == "37" && players[0].body[0].direction != "right") players[0].direction = "left";
          else if(key == "38" && players[0].body[0].direction != "down") players[0].direction = "up";
          else if(key == "39" && players[0].body[0].direction != "left") players[0].direction = "right";
          else if(key == "40" && players[0].body[0].direction != "up") players[0].direction = "down";
          else if(key == "16") players[0].usePowerUp();
        }

        if (players[1]) {
          if(key == "65" && players[1].body[0].direction != "right") players[1].direction = "left";
          else if(key == "87" && players[1].body[0].direction != "down") players[1].direction = "up";
          else if(key == "68" && players[1].body[0].direction != "left") players[1].direction = "right";
          else if(key == "83" && players[1].body[0].direction != "up") players[1].direction = "down";
          else if(key == "69") players[1].usePowerUp();
        }

        if (players[2]) {
          if(key == "56" && players[2].body[0].direction != "down") players[2].direction = "up"; // 8
          else if(key == "85" && players[2].body[0].direction != "right") players[2].direction = "left";
          else if(key == "73" && players[2].body[0].direction != "up") players[2].direction = "down";
          else if(key == "79" && players[2].body[0].direction != "left") players[2].direction = "right";
          else if(key == "57") players[2].usePowerUp();
        }

        if (players[3]) {
          if(key == "53" && players[3].body[0].direction != "down") players[3].direction = "up";
          else if(key == "82" && players[3].body[0].direction != "right") players[3].direction = "left";
          else if(key == "84" && players[3].body[0].direction != "up") players[3].direction = "down";
          else if(key == "89" && players[3].body[0].direction != "left") players[3].direction = "right";
          else if(key == "16") players[3].usePowerUp();
        }

        if (players[4]) {
          if(key == "71" && players[4].body[0].direction != "down") players[4].direction = "up";
          else if(key == "86" && players[4].body[0].direction != "right") players[4].direction = "left";
          else if(key == "66" && players[4].body[0].direction != "up") players[4].direction = "down";
          else if(key == "78" && players[4].body[0].direction != "left") players[4].direction = "right";
          else if(key == "16") players[4].usePowerUp();
        }

        if (players[5]) {
          if(key == "75" && players[5].body[0].direction != "down") players[5].direction = "up";
          else if(key == "77" && players[5].body[0].direction != "right") players[5].direction = "left";
          else if(key == "188" && players[5].body[0].direction != "up") players[5].direction = "down";
          else if(key == "190" && players[5].body[0].direction != "left") players[5].direction = "right";
          else if(key == "16") players[5].usePowerUp();
        }

    });

    $('.tabbutton').on('click', function(event){
        event.preventDefault();

        var elementId = $(this).attr('id');
        $('#' + elementId + '_canvas').show();
        $('#' + elementId + '_canvas').siblings().hide();

    });

    $("li").click(function(e) {
        e.preventDefault();
        $("li").removeClass("selected");
        $(this).addClass("selected");
    });

    // Dynamic player form

    function fillInStatMeter(value, stat_bar_id, color) {

        var stat_meter = $(stat_bar_id)[0];
        var ctx = stat_meter.getContext("2d");
        var width = $(stat_bar_id).width();
        var height = $(stat_bar_id).height();

        var cellWidth = 10;
        ctx.fillStyle = "grey";
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = "black";
        ctx.strokeRect(0, 0, width, height);

        for(var i = 0; i <= value; i++)
        {
            ctx.fillStyle = color;
            ctx.fillRect(i*cellWidth, 0, cellWidth, cellWidth);
            ctx.strokeStyle = "white";
            ctx.strokeRect(i*cellWidth, 0, cellWidth, cellWidth);
        }
    }

    //Player setup
    $('div.player_setup').block({ message: "Add Player" });
    $('div.player_setup').on('click', function(){
        $(this).unblock();
    });

    $('.remove_player').on('click', function() {
        var playerIdName = $(this).attr('id');
        var playerId = playerIdName.charAt(playerIdName.length - 1);
        resetPlayerSnakeForm(this, playerId);
    });

    function resetPlayerSnakeForm(form, id) {
        form = $('#player_setup_' + id);
        $(form).css('color', 'grey');
        $(form).css('border', '3px solid #4A4A4A');
        $('#player_snake_' + id).prop('selectedIndex',0);
        $('#player_powerup_image_' + id).css('background-image', '')
        $('#player_food_' + id).prop('selectedIndex', 0);
        $('#player_food_image_' + id).css('background-image', '');
        $('#player_food_image_' + id).css('border', '');
        $('#head_' + id).attr("src", '');
        $('.body_' + id).attr("src", '');
        $('#tail_' + id).attr("src", '');
        $('#strength_' + id).remove();
        $('#personality_' + id).remove();
        $('#player_snake_' + id + '_score').empty();
    }

    String.prototype.capitalize = function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    }
    init();
});
