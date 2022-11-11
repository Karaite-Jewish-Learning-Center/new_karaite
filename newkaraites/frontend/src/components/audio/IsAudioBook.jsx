import React from 'react';
import {AudiobookBottom} from '../buttons/audiobookBottom';
import {TextToSpeechButton} from '../buttons/textToSpeechButton';


export const IsAudioBook = ({isAudioBook, flip, onAudioBookOnOff, audioBookPlaying, onSpeakOnOffHe}) => {
    debugger
    if (isAudioBook) {
        return (
            <AudiobookBottom
                onClick={onAudioBookOnOff}
                onOff={audioBookPlaying}
            />
        )
    } else {
        return (
            <TextToSpeechButton
                onClick={onSpeakOnOffHe}
                onOff={flip[0]}
            />
        )
    }

}