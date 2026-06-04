"use client";

import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faCamera,
  faCameraRotate,
  faArrowsRotate,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import ModalPortal from "../ui/modalPortal";

const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [cameraError, setCameraError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const startCamera = async (mode) => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraError(null);
    } catch {
      setCameraError("Camera not available. Please grant camera permission.");
    }
  };

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const flipCamera = () => {
    const next = facingMode === "environment" ? "user" : "environment";
    setFacingMode(next);
    setCapturedImage(null);
    startCamera(next);
  };

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    setCapturedImage(canvas.toDataURL("image/jpeg", 0.92));
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
  };

  const retake = () => {
    setCapturedImage(null);
    startCamera(facingMode);
  };

  const usePhoto = async () => {
    if (!capturedImage) return;
    setUploading(true);
    try {
      const blob = await (await fetch(capturedImage)).blob();
      const formData = new FormData();
      formData.append("file", blob, "capture.jpg");
      formData.append("upload_preset", "kumasocialmedia");

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();

      if (!data.secure_url) throw new Error("Upload failed");
      onCapture(data);
      onClose();
    } catch {
      setCameraError("Upload failed. Please try again.");
      setUploading(false);
    }
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
        {/* Card: full-screen on mobile, capped on desktop */}
        <div className="relative w-full h-full sm:w-[420px] sm:h-auto sm:rounded-2xl sm:overflow-hidden flex flex-col bg-black">

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>

          {cameraError ? (
            <div className="flex flex-1 items-center justify-center px-8 py-20 text-center">
              <p className="text-white/70 text-sm">{cameraError}</p>
            </div>
          ) : (
            <>
              {/* Viewfinder */}
              <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${capturedImage ? "hidden" : "block"}`}
                />
                {capturedImage && (
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-full h-full object-contain"
                  />
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-8 py-8 bg-black flex-shrink-0">
                {!capturedImage ? (
                  <>
                    {/* Flip camera */}
                    <button
                      onClick={flipCamera}
                      className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                      title="Flip camera"
                    >
                      <FontAwesomeIcon icon={faCameraRotate} size="lg" />
                    </button>

                    {/* Shutter */}
                    <button
                      onClick={capture}
                      className="w-18 h-18 w-[4.5rem] h-[4.5rem] flex items-center justify-center rounded-full bg-white hover:bg-gray-100 transition-colors shadow-xl ring-4 ring-white/30"
                      title="Take photo"
                    >
                      <FontAwesomeIcon icon={faCamera} size="xl" className="text-black" />
                    </button>

                    {/* Spacer to balance layout */}
                    <div className="w-12 h-12" />
                  </>
                ) : (
                  <>
                    {/* Retake */}
                    <button
                      onClick={retake}
                      disabled={uploading}
                      className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      <FontAwesomeIcon icon={faArrowsRotate} />
                      <span>Retake</span>
                    </button>

                    {/* Use Photo */}
                    <button
                      onClick={usePhoto}
                      disabled={uploading}
                      className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#FF4E02] hover:bg-[#e04300] text-white text-sm font-medium transition-colors disabled:opacity-60 shadow-lg"
                    >
                      <FontAwesomeIcon icon={faCheck} />
                      <span>{uploading ? "Uploading…" : "Use Photo"}</span>
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </ModalPortal>
  );
};

export default CameraCapture;
