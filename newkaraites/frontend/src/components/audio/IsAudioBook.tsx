import React, {FC, MouseEventHandler} from 'react';
import {AudiobookBottom} from '../buttons/audiobookBottom';
import {TextToSpeechButton} from '../buttons/textToSpeechButton';

interface AudioBookProps {
    isAudioBook: boolean;
    flip: boolean[];
    isSpeechError: boolean;
    onAudioBookOnOff: MouseEventHandler;
    audioBookPlaying: boolean;
    onSpeakOnOffHe: MouseEventHandler;
}

export const IsAudioBook: FC<AudioBookProps> = ({
                                                    isAudioBook,
                                                    flip,
                                                    isSpeechError,
                                                    onAudioBookOnOff,
                                                    audioBookPlaying,
                                                    onSpeakOnOffHe,
                                                }) =>
    (isAudioBook ?
            <AudiobookBottom onClick={onAudioBookOnOff} onOff={audioBookPlaying} isSpeechError={isSpeechError}/>
            :
            <TextToSpeechButton onClick={onSpeakOnOffHe} onOff={flip[0]} isSpeechError={isSpeechError}/>
    );