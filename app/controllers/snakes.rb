get '/:snake_name/stats' do
  {strength: strength(Snake.find_by_name(params[:snake_name])).to_s,
  personality: personality(Snake.find_by_name(params[:snake_name])).to_s}.to_json
end

post '/game/:game_id/snake/:snake_name/win' do
  winner = Snake.find_by_name(params[:snake_name])
  game = Game.find(params[:game_id])
  game.winner = winner
  game.save
end