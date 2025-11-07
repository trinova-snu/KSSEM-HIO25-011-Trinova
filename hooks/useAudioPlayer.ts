import { useState, useCallback, useRef, useEffect } from 'react';
import { generateSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audio';

export const useAudioPlayer = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

    const stop = useCallback(() => {
        if (sourceNodeRef.current) {
            try {
                sourceNodeRef.current.stop();
            } catch (e) {
                console.warn("Audio could not be stopped, it might have already finished.", e);
            }
        }
    }, []);

    const play = useCallback(async (text: string) => {
        if (isPlaying) {
            stop();
        }
        setIsLoading(true);
        setError(null);

        try {
            const base64Audio = await generateSpeech(text);

            if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            const ctx = audioContextRef.current;
            
            const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                ctx,
                24000,
                1
            );

            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            
            source.onended = () => {
                setIsPlaying(false);
                sourceNodeRef.current = null;
            };

            source.start();
            sourceNodeRef.current = source;
            setIsPlaying(true);
        } catch (e) {
            console.error("Audio generation/playback error:", e);
            setError("Failed to generate or play audio.");
            setIsPlaying(false);
        } finally {
            setIsLoading(false);
        }
    }, [isPlaying, stop]);

    useEffect(() => {
        return () => {
            stop();
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, [stop]);

    return { play, stop, isLoading, isPlaying, error };
};
