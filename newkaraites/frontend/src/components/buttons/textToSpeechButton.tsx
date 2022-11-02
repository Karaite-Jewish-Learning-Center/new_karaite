import React, {FC} from "react";
import IconButton from "@material-ui/core/IconButton";
import {ButtonPropsOnOff} from './types';
import {useTheme} from '@material-ui/core/styles';
import textToSpeechOnBlack from '../../img/record_voice_over_black_24dp.svg'
import textToSpeechOffBlack from '../../img/voice_over_off_black_24dp.svg'
import textToSpeechOnWhite from '../../img/record_voice_over_white_24dp.svg'
import textToSpeechOffWhite from '../../img/voice_over_off_white_24dp.svg'


export const TextToSpeechButton: FC<ButtonPropsOnOff> = ({onClick, color, onOff}) => {
    const theme = useTheme()
    if (theme.palette.type === 'dark') {
        return (
            <IconButton aria-label="Close"
                        component="span"
                        onClick={onClick}>
                {(onOff ? <img src={textToSpeechOnWhite} width={24} height={24} alt="Speech on"/> :
                    <img src={textToSpeechOffWhite} width={24} height={24} alt="Speech off"/>)}
            </IconButton>
        )
    }
    return (
        <IconButton aria-label="Close"
                    component="span"
                    onClick={onClick}>
            {(onOff ? <img src={textToSpeechOnBlack} width={24} height={24} alt="Speech on"/> :
                <img src={textToSpeechOffBlack} width={24} height={24} alt="Speech off"/>)}
        </IconButton>
    )
}