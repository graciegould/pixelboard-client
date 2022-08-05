
import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import jSuites from "jsuites";

import "jsuites/dist/jsuites.css";
import "./css/pixelboard.css"

const connectionOptions = {
    "force new connection": true,
    "forceBase64": true,
    "reconnectionAttempts": "Infinity", //avoid having user reconnect manually in order to prevent dead clients after a server restart
    "timeout": 10000, //before connect_error and connect_timeout are emitted.
    "transports": ["websocket"]
};

let socket = io.connect("https://localhost:4001/", connectionOptions)
const createElms = () => {
    let s = []
    let rectSize = 16;
    for (let x = 0; x < 1600; x += rectSize) {
        let newSize = { row: x }
        for (let y = 0; y < 900; y += rectSize) {
            newSize = { ...newSize, col: y, l: x + "px", t: y + "px" };
            s = [...s, newSize]
        }
    }
    return s;
}


export default function Chat() {
    const [sizes, setSizes] = useState(createElms())
    const [color, setColor] = useState("black")
    const [picked, setPicked] = useState([])
    const handleColorPickerChange = (element, color) => {
        setColor(color);
      };
    const handleClick = (e) => {
        e.target.style.backgroundColor = color
        const id = e.target.id.split("-")
        let choice = { pos: id, color: color }
        socket.emit("choice", choice)
    } 

    const getPicked = async () => {
        return new Promise(function () {
            socket.off("connected")
            fetch('https://localhost:4001/')
                .then(response => response.json())
                .then((d) => {
                    setPicked(d)
                })

        });
    }

    useEffect(() => {
        socket.on('connect', () => {
            console.log("connected")
        })
        getPicked()
        return () => {
            socket.off("connected");
        };
    }, [])
    useEffect(() => {
        socket.on("addChoice", (data) => {
            let id = data.pos[0] + "-" + data.pos[1];
            document.getElementById(id).style.backgroundColor = data.color
        })
        return () => {
            socket.off("addChoice");
        };
    })
    return (
        <div>
            <div className="color">
                color:
                <ColorPicker
                options={{
                    value: color,
                    onchange: handleColorPickerChange,
                    fullscreen: true
                  }}
                
                />
                  socket.io pixel board 
            </div>
            <div className="container"  >
                {Object.keys(picked).length < 5600 ? null :
                    sizes.map((s, i) => {
                        return (
                            <div className="squares" id={s.row + "-" + s.col} key={"elm" + i} style={{ left: s.l, top: s.t, backgroundColor: picked[s.row + "-" + s.col].color }} onClick={handleClick}>

                            </div>
                        )
                    })}
            </div>
        </div>
    )
}

 function ColorPicker({ options }) {
    const colorPickerRef = useRef(null);
   
    useEffect(() => {
      jSuites.color(colorPickerRef.current, options);
    }, [options]);
   
    return <input ref={colorPickerRef} />;
  }
