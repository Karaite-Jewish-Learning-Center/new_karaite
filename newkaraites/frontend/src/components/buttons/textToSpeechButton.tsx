import React, {FC} from "react";
import IconButton from "@material-ui/core/IconButton";
import {ButtonPropsTTS} from './types';
import textToSpeechOn from '../../img/text-to-speech.svg';
import textToSpeechOff from '../../img/text-to-speech-off.svg';



export const TextToSpeechButton: FC<ButtonPropsTTS> = ({onClick, color, onOff}) =>
    <IconButton aria-label="Close"
                component="span"
                color={color}
                onClick={onClick}>

        {(onOff ? <img src={textToSpeechOn} width={24} height={24}/> : <img src={textToSpeechOff} width={24} height={24}/>)}
    </IconButton>

