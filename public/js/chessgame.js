

const socket = io();
const chess = new Chess();
const boradElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
    const board = chess.board();
    
    boradElement.innerHTML = "";

    board.forEach((row, rowindex) => {

        row.forEach((square, squareindex) => {

            const squareElement = document.createElement("div");

            squareElement.classList.add("square",
                (rowindex + squareindex) % 2 === 0 ? "light" : "dark"
            );

            squareElement.dataset.row = rowindex;
            squareElement.dataset.col = squareindex;

            if (square) {
                const pieceElement = document.createElement("div");

                pieceElement.classList.add("piece",
                    square.color === "w" ? "white" : "black"
                );
    
                pieceElement.innerText = getPieceunicode(square);
    
                pieceElement.draggable = playerRole === square.color;
    
    
                pieceElement.addEventListener("dragstart", (e) => {
                    if (pieceElement.draggable) {
                        draggedPiece = pieceElement;
                        sourceSquare = { row: rowindex, col: squareindex };
    
                        e.dataTransfer.setData("text/plain", "");
                    }
                });
    
                pieceElement.addEventListener("dragend", (e) => {
                    draggedPiece = null;
                    sourceSquare = null;
    
                });
    
                squareElement.appendChild(pieceElement);
    
            }

            squareElement.addEventListener("dragover", (e) => {
                e.preventDefault();
            });
    
            squareElement.addEventListener("drop", (e) => {
                e.preventDefault();
    
                if (draggedPiece) {
                    const targetSource = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col),
                    };
    
                    handleMove(sourceSquare, targetSource);
                }
                
                 
            });

            boradElement.appendChild(squareElement)
        });
        
    });

    if (playerRole === "b") {
        boradElement.classList.add("flipped");
    }
    else {
        boradElement.classList.remove("flipped");
    }
   

};


const handleMove = (source, target) => { 
    const move = {
        from:`${String.fromCharCode(97 + source.col)}${8-source.row}` ,
        to: `${String.fromCharCode(97 + target.col)}${8-target.row}`  ,
        promotion:"q",
    }; 
  
    socket.emit("move", move);
};

const getPieceunicode = (piece) => { 
    const unicodePieces = {
        p: "♙",
        r: "♜",
        n: "♞",
        b: "♝",
        q: "♛",
        k: "♚",
        P: "♙",
        R: "♖",
        N: "♘",
        B: "♗",
        Q: "♛",
        K: "♔"
    };

    return unicodePieces[piece.type] || "";
};

socket.on("playerRole", function (role) {
    playerRole = role;
    renderBoard();
});

socket.on("SpectatorRole", function () {
    playerRole = null;
    renderBoard();
});

socket.on("boardState", function (fen) {
    chess.load(fen);
    renderBoard();
});


socket.on("move", function (move) {
    chess.move(move);
    renderBoard();
});

renderBoard();
 
