import React, {FC, MouseEventHandler} from 'react';
import {AudiobookBottom} from '../buttons/audiobookBottom';
import {TextToSpeechButton} from '../buttons/textToSpeechButton';

interface AudioBookProps {
    isAudioBook: boolean;
    flip: boolean[];
    onAudioBookOnOff: MouseEventHandler;
    audioBookPlaying: boolean;
    onSpeakOnOffHe: MouseEventHandler;
    audioBookAvailable: boolean;
}


// todo: audioBookAvailable is needed ?

export const IsAudioBook: FC<AudioBookProps> = ({
                                                    isAudioBook,
                                                    flip,
                                                    onAudioBookOnOff,
                                                    audioBookPlaying,
                                                    onSpeakOnOffHe,
                                                    audioBookAvailable
                                                }) =>
    (isAudioBook ?
            <AudiobookBottom onClick={onAudioBookOnOff} onOff={audioBookPlaying} />
            :
            <TextToSpeechButton onClick={onSpeakOnOffHe} onOff={flip[0]}/>
    );