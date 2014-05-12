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