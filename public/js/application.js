$(document).ready(function() {
    //Board stuff

    var board = document.getElementById("board_canvas");
    var context = board.getContext("2d");
    var width = $("#board_canvas").width();
    var height = $("#board_canvas").height();
    var cellWidth = 20;
    var countdown = 0;
    var finished = false;
    var players = [];
    var winner;
    var titleScreenNo = 1;
    var started = false;
    var startingPositions = [{x:0,   y:0,  direction:"right"}, // mara
                             {x:23,   y:1, direction:"left"}, // nagini
                             {x:0,  y:30,  direction:"right"}, // unicorn
                             {x:23,  y:31, direction:"left"}, // chuck
                             {x: 0, y:15,  direction:"right"}, // hyda
                             {x: 23, y:16, direction:"left"}, // kaa
                             {x: 16,  y:0, direction:"down"}, // toothpick
                             {x: 15, y:25, direction:"up"} // benj
    ];
    var favoriteFoods = ["harry", "chicken", "bear", "coconut", "worm", "tardis", "crustacean", "rainbow"];




    //Player
    function Snake(name, foodType, color, id, gameId, length) {
        this.startingPosition = startingPositions.shift();
        this.name = name;
        this.id = id;
        this.gameId = gameId;
        this.color = color;
        this.score = 0;
        this.foodType = foodType;
        this.direction = this.startingPosition.direction;
        this.array = [];
        this.alive = true;
        this.food = {};
        this.head = {};
        this.toGrow = 0;
        this.toShrink = 0;
        this.color = this.getColor();

        if (this.direction == "right")
        {
            for(var i = this.startingPosition.x+length-1; i>=this.startingPosition.x; i--)
            {
                this.array.push({x: i, y:this.startingPosition.y, direction:this.direction});
            }
        }
        else if (this.direction == "left")
        {
            for(var i = this.startingPosition.x; i<=this.startingPosition.x+length-1; i++)
            {
                this.array.push({x: i, y:this.startingPosition.y, direction:this.direction});
            }
        }
        else if (this.direction == "down")
        {
            for(var i = this.startingPosition.y+length-1; i>=this.startingPosition.y; i--)
            {
                this.array.push({x: this.startingPosition.x, y:i, direction:this.direction});
            }
        }
        else if (this.direction == "up")
        {
            for(var i = this.startingPosition.y; i<=this.startingPosition.y+length-1; i++)
            {
                this.array.push({x: this.startingPosition.x, y:i, direction:this.direction});
            }
        }

        $('#player_snake_' + this.id + '_score').html(this.score);
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
//        console.log(path);
        var imageObj = new Image();
        imageObj.src = path;
        return imageObj;
    };

    Snake.prototype.getDirection = function(index) {
        if (index == this.array.length - 1)
        {
            return this.array[index - 1].direction;
        }
        else
        {
            return this.array[index].direction;
        }
    }


    Snake.prototype.getBodyPart = function(index) {
        var thisPart = this.array[index];
        var nextPart;
        if (index == 0)
        {
            return "head";
        }
        nextPart = this.array[index - 1];

        if (index == this.array.length - 1)
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
    };

    Snake.prototype.moveOne = function() {
        this.head.x = this.array[0].x;
        this.head.y = this.array[0].y;

        if(this.direction == "right") this.head.x++;
        else if(this.direction == "left") this.head.x--;
        else if(this.direction == "up") this.head.y--;
        else if(this.direction == "down") this.head.y++;
        if (this.hasCollision())
        {
            this.alive = false;
        }
        else
        {
            this.checkForFood();
            if (this.toShrink > 0)
            {
                this.array.pop();
                this.toShrink = false;
                this.toShrink -= 1;
            }
            if (this.toGrow == 0)
            {
                this.array.pop();
            }
            else
            {
                this.toGrow -= 1;
            }

            this.array.unshift({x:this.head.x, y:this.head.y, direction:this.direction});
        }
    };

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

    Snake.prototype.createFood = function() {
        this.food = {
            x: Math.round(Math.random()*(width-cellWidth)/cellWidth),
            y: Math.round(Math.random()*(height-cellWidth)/cellWidth)
        };
    };

    Snake.prototype.foodTypeImage = function() {

        var path = '/foods/' + this.foodType + '.png';
        console.log(path);
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
    };

    Snake.prototype.hasCollision = function() {
        if(checkBorderCollision(this.head.x, this.head.y) || checkSnakeCollision(this.head.x, this.head.y))
        {
            return true;
        }
        return false;
    };

    function checkBorderCollision(x, y)
    {
        if (x == -1 || x == width/cellWidth || y == -1 || y == height/cellWidth)
        {
            return true;
        }
        return false;
    }

    function checkSnakeCollision(x, y)
    {
        for(var playerIndex = 0; playerIndex < players.length; playerIndex++)
        {
            for(var index = 0; index < players[playerIndex].array.length; index++)
            {
                if(players[playerIndex].array[index].x == x && players[playerIndex].array[index].y == y)
                {
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
        context.fillStyle = "grey";
        context.fillRect(0, 0, width, height);
    }

    function paintSnakes()
    {

        for(var playerIndex = 0; playerIndex < players.length; playerIndex++)
        {
            paintSnake(players[playerIndex]);
        }

    }

    function paintSnake(player)
    {
        for(var index = 0; index < player.array.length; index++)
        {
            var pattern = context.createPattern(player.findBodyPartImage(index), "repeat");
            var cell = player.array[index];
            paintCell(cell, pattern);
        }

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
                paintCell(player.food, pattern);
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
            game_loop = setInterval(round, 120);
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
                paintBoard();
                paintSnakes();
                paintFood();
                players.forEach(function(player) {
                    player.move();
                });
                if (checkForWin())
                {
                    winner = findWinner();
                    winner.win();
                }
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
        if (players.length > 1)
        {
            var alivePlayer = {};
            var aliveCount = 0;
            players.forEach(function(player) {
                if (player.alive)
                {
                    alivePlayer = player;
                    aliveCount++;
                }
            });
            if (aliveCount == 0 || (aliveCount == 1 && alivePlayer.hasHighestScore()))
                return true;
            return false;
        }
        else
        {
            return !players[0].alive;
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
                countdown = 16;
                var data = JSON.parse(response)
                players = [];
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
        console.log(data);
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
                $('#player_snake_' + playerId + '_strength').html('<div class="strength">Strength: ' + '<canvas id="strength_' + snakeName + '" width="80" height="10"></canvas></div>');
                fillInStatMeter(data['strength'], '#strength_' + snakeName, "red")
                $('#player_snake_' + playerId + '_personality').html('<div class="personality">Personality: ' + '<canvas id="personality_' + snakeName + '" width="80" height="10"></canvas></div>');
                fillInStatMeter(data['personality'], '#personality_' + snakeName, "blue")
                $('#player_snake_' + playerId + '_score').html('0');
            }
        });

    });

    $('.player_food').change(function () {
        var food = $(this).val();
        console.log(food);
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
        if(key == "37" && players[0].direction != "right") players[0].direction = "left";
        else if(key == "38" && players[0].direction != "down") players[0].direction = "up";
        else if(key == "39" && players[0].direction != "left") players[0].direction = "right";
        else if(key == "40" && players[0].direction != "up") players[0].direction = "down";

        else if(key == "65" && players[1].direction != "right") players[1].direction = "left";
        else if(key == "87" && players[1].direction != "down") players[1].direction = "up";
        else if(key == "68" && players[1].direction != "left") players[1].direction = "right";
        else if(key == "83" && players[1].direction != "up") players[1].direction = "down";

        else if(key == "56" && players[2].direction != "down") players[2].direction = "up";
        else if(key == "85" && players[2].direction != "right") players[2].direction = "left";
        else if(key == "73" && players[2].direction != "up") players[2].direction = "down";
        else if(key == "79" && players[2].direction != "left") players[2].direction = "right";

        else if(key == "53" && players[3].direction != "down") players[3].direction = "up";
        else if(key == "82" && players[3].direction != "right") players[3].direction = "left";
        else if(key == "84" && players[3].direction != "up") players[3].direction = "down";
        else if(key == "89" && players[3].direction != "left") players[3].direction = "right";

        else if(key == "71" && players[4].direction != "down") players[4].direction = "up";
        else if(key == "86" && players[4].direction != "right") players[4].direction = "left";
        else if(key == "66" && players[4].direction != "up") players[4].direction = "down";
        else if(key == "78" && players[4].direction != "left") players[4].direction = "right";

        else if(key == "75" && players[5].direction != "down") players[5].direction = "up";
        else if(key == "77" && players[5].direction != "right") players[5].direction = "left";
        else if(key == "188" && players[5].direction != "up") players[5].direction = "down";
        else if(key == "190" && players[5].direction != "left") players[5].direction = "right";

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

    String.prototype.capitalize = function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    }
    init();
});
