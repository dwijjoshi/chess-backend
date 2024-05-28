import { WebSocket } from "ws";
import { Game } from "./Game";

export class GameManager {
  private games: any;
  private pendingUser: WebSocket | null;
  private users: WebSocket[];

  constructor() {
    this.games = {};
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

      // if (message.type === "init_game") {
      //   if (this.pendingUser) {
      //     const game = new Game(this.pendingUser, socket);
      //     this.games.push(game);
      //     this.pendingUser = null;
      //   } else {
      //     this.pendingUser = socket;
      //   }
      // }
      if (message.type === "create") {
        const code = "dwij2";
        this.games[code] = {
          code,
          player1: socket,
          player2: null,
        };
        socket.send(JSON.stringify({ type: "created", code }));
      }

      if (message.type === "join") {
        const code = message.code;
        const game = this.games[code];
        if (game && !game.player2) {
          game.player2 = socket;
          game.player1!.send(JSON.stringify({ type: "joined", code }));
          game.player2.send(JSON.stringify({ type: "joined", code }));
        } else {
          socket.send(
            JSON.stringify({
              type: "error",
              message: "Invalid code or game already full",
            })
          );
        }
      }

      // if (message.type === "move") {
      //   const game = this.games.find(
      //     (game) => game.player1 === socket || game.player2 === socket
      //   );
      //   if (game) {
      //     game.makeMove(socket, message.move);
      //   }
      // }
    });
  }
}
