import { useEffect, useRef, useState } from "react";

export default function Home() {
  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    socketRef.current = new WebSocket("ws://localhost:8000/ws/audio");

    socketRef.current.onopen = () => console.log("WebSocket connected");
    socketRef.current.onclose = () => console.log("WebSocket closed");
    socketRef.current.onerror = (err) => console.error("WebSocket error", err);
  }, []);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);

    source.connect(processor);
    processor.connect(audioContext.destination);

    processor.onaudioprocess = (e) => {
      const input = e.inputBuffer.getChannelData(0);
      const buffer = new Int16Array(input.length);
      for (let i = 0; i < input.length; i++) {
        buffer[i] = Math.max(-1, Math.min(1, input[i])) * 32767;
      }
      socketRef.current.send(buffer);
    };

    mediaRecorderRef.current = { processor, source, stream };
    setIsRecording(true);
  };

  const stopRecording = () => {
    const { processor, source, stream } = mediaRecorderRef.current;
    processor.disconnect();
    source.disconnect();
    stream.getTracks().forEach((track) => track.stop());
    setIsRecording(false);
  };

  return (
    <div>
      <h1>Voice Separation App</h1>
      {!isRecording ? (
        <button onClick={startRecording}>Start</button>
      ) : (
        <button onClick={stopRecording}>Stop</button>
      )}
    </div>
  );
}
