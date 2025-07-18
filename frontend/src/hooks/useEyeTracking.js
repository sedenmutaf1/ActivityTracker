import { useState, useEffect, useRef } from "react";

export function useEyeTracking(stream, sessionId, sessionEnded) {
  const socketRef = useRef(null);
  const canvasRef = useRef(null);             // Canvas over video for bounding box
  const videoRef = useRef(null);              // Internal video element
  const [faceBox, setFaceBox] = useState(null);
  const [gazePoint, setGazePoint] = useState(null);
  const [socketReady, setSocketReady] = useState(false);

  // --- WebSocket setup ---
  useEffect(() => {
    if (!sessionId) return;

    const socket = new WebSocket(`ws://localhost:8000/ws/session/${sessionId}/track`);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");
      setSocketReady(true);

    };
    socket.onclose = () => {
      console.log("WebSocket disconnected");
      setSocketReady(false);
    };
    socket.onerror = (e) => console.error("WebSocket error", e);

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.face) setFaceBox(data.face);
        if (data.horizontal !== undefined && data.vertical !== undefined) {
          setGazePoint({ x: data.horizontal, y: data.vertical });
        }
      } catch (err) {
        console.error("Error parsing websocket data", err);
      }
    };

    return () => {
      socket.close();
  
    };
  }, [sessionId]);

  // --- Setup video stream + draw face box ---
  useEffect(() => {
    if (!stream || !canvasRef.current) return;

    const video = document.createElement("video");
    video.srcObject = stream;
    video.autoplay = true;
    videoRef.current = video;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const updateCanvasSize = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    };

    const drawFaceBox = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (faceBox) {
        ctx.strokeStyle = "limegreen";
        ctx.lineWidth = 3;
        ctx.strokeRect(faceBox.x, faceBox.y, faceBox.w, faceBox.h);
      }
    };

    let drawInterval;

    video.addEventListener("loadedmetadata", () => {
      updateCanvasSize();
      drawInterval = setInterval(drawFaceBox, 100);
    });

    return () => {
      clearInterval(drawInterval);
      video.pause();
      video.srcObject = null;
    };
  }, [stream, faceBox]);

  // --- Send frame to backend ---
  useEffect(() => {
    if (!stream || sessionEnded || !canvasRef.current || !socketReady) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const sendFrame = () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2 || socketRef.current?.readyState !== WebSocket.OPEN) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
      socketRef.current.send(JSON.stringify({ image: dataUrl, timestamp: Date.now() }));
    };

    const intervalId = setInterval(sendFrame, 100);

    return () => clearInterval(intervalId);
  }, [stream, sessionEnded, socketReady]);

  // --- Draw gaze point on fullscreen overlay ---
  useEffect(() => {
    if (!gazePoint) return;

    const canvas = document.getElementById("fullscreen-gaze-overlay");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    const x = gazePoint.x * width;
    const y = gazePoint.y * height;

    const radius = 50;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, "rgba(0, 150, 255, 0.5)");
    gradient.addColorStop(1, "rgba(0, 150, 255, 0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
  }, [gazePoint]);

  return { canvasRef };
}
