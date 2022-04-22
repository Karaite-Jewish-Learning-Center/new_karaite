import React, {useState} from "react";
import Keyboard from "react-simple-keyboard";
import Draggable from 'react-draggable';
import "react-simple-keyboard/build/css/index.css";
import "./index.css";

export const Vkeybord = () => {
    const [input, setInput] = useState('')
    const [layoutName, setLayoutName] = useState("default")

    const onChange = (e) => {
        setInput(e)
    };

    const onKeyPress = (e) => {
        /**
         * If you want to handle the shift and caps lock buttons
         */
        // if (e.shiftKey === 'shift' || e.lock === "{lock}") handleShift();
    };

    // const handleShift = () => {
    //     setLayoutName(layoutName === "default" ? "shift" : "default")
    // };

    const onChangeInput = (event) => {
        const input = event.target.value;
        setInput(input);
        // this.keyboard.setInput(input);
    };


    return (
        <Draggable
            defaultPosition={{x: 100, y: 500}}
            axis="x"
            handle=".handle"
            position={null}
            grid={[25, 25]}
            scale={1}
        >
            <div >
                <input
                    value={input}
                    placeholder={"Tap on the virtual keyboard to start"}
                    onChange={onChangeInput}
                />
                <Keyboard
                    // keyboardRef={r => (this.keyboard = r)}
                    layoutName={layoutName}
                    onChange={onChange}
                    onKeyPress={onKeyPress}
                />
            </div>
        </Draggable>
    );
}


