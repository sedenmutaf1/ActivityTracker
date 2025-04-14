import { useState, useEffect } from "react";

export const useUserMedia = (constraints) => {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (stream) return;

    let didCancel = false;

    const getUserMedia = async () => {
      if (!didCancel) {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
          setStream(mediaStream);
        } catch (e) {
          setError(e);
        }
      }
    };

    getUserMedia();

    return () => {
      didCancel = true;
      if (!stream) return;
      if (stream?.getVideoTracks) {
        stream.getVideoTracks().forEach((track) => track.stop());
      }
      if (stream?.getAudioTracks) {
        stream.getAudioTracks().forEach((track) => track.stop());
      }
      if (stream?.stop) {
        stream.stop();
      }
    };
  }, [constraints, stream]);

  return { stream, error };
};
