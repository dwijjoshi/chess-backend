import { WebSocket } from "ws";
import { Game } from "./Game";

export class GameManager {
  private games: Game[];
  private pendingUser: WebSocket | null;
  private users: WebSocket[];
  constructor() {
    this.games = [];
    this.pendingUser = null;
    this.users = [];
  }

  addUser(socket: WebSocket) {
    this.users.push(socket);
    this.addHandler(socket);
  }

  removeUser(socket: WebSocket) {
    this.users = this.users.filter((user) => user !== socket);
  }

  private handleMessage() {}

  private addHandler(socket: WebSocket) {
    socket.on("message", (data) => {
      const message = JSON.parse(data.toString());

      if (message.type === "create") {
        const code = "dwij2";
        const game = new Game(socket, null, code);
        this.games.push(game);
        socket.send(JSON.stringify({ type: "created", code }));
      }

      if (message.type === "join") {
        const code = message.code;
        const game = this.games.find((game: any) => game.code === code);
        console.log(game, "Accepted");
        if (game && !game.player2) {
          game.player2 = socket;
          game.player1!.send(
            JSON.stringify({ type: "Game started", message: "You are white" })
          );
          game.player2.send(
            JSON.stringify({ type: "Game started", message: "You are black" })
          );
        } else {
          socket.send(
            JSON.stringify({
              type: "error",
              message: "Invalid code or game already full",
            })
          );
        }
      }

      if (message.type === "move") {
        const game = this.games.find(
          (game) => game.player1 === socket || game.player2 === socket
        );
        if (game) {
          game.makeMove(socket, message.move);
        }
      }
    });
  }
}
