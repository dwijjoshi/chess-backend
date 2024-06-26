import { WebSocket } from "ws";
import { Chess } from "chess.js";

export class Game {
  public player1: WebSocket;
  public player2: WebSocket | null;
  private board: Chess;
  public code: String;
  private moves: string[];
  private moveCount = 0;
  constructor(player1: WebSocket, player2: WebSocket | null, code: String) {
    this.player1 = player1;
    this.player2 = player2;
    this.code = code;
    this.board = new Chess();
    this.moves = [];
    // this.player1.send(
    //   JSON.stringify({
    //     type: "init_game",
    //     payload: {
    //       color: "white",
    //     },
    //   })
    // );
    // this.player2.send(
    //   JSON.stringify({
    //     type: "init_game",
    //     payload: {
    //       color: "black",
    //     },
    //   })
    // );
  }

  makeMove(
    socket: WebSocket,
    move: {
      from: string;
      to: string;
    }
  ) {
    if (this.moveCount % 2 === 0 && socket !== this.player1) {
      return;
    }

    if (this.moveCount % 2 === 1 && socket !== this.player2) {
      return;
    }
    try {
      this.board.move(move);
      if (this.board.isGameOver()) {
        this.player1.send(
          JSON.stringify({
            type: "gameover",
            payload: {
              winner: this.board.turn() === "w" ? "black" : "white",
            },
          })
        );
        return;
      }

      if (this.moveCount % 2 === 0) {
        if (this.player2) {
          this.player2.send(
            JSON.stringify({
              type: "move",
              payload: move,
            })
          );
        }
      } else {
        this.player1.send(
          JSON.stringify({
            type: "move",
            payload: move,
          })
        );
      }
      this.moveCount++;
    } catch (e) {
      console.log(e);
    }
  }
}
