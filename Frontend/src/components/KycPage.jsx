import React from "react";
import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { useReactMediaRecorder } from "react-media-recorder";
import {
  Camera, Mic, Upload, RefreshCw,
  ShieldCheck, Square, StopCircle
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const KYC = () => {
  const navigate = useNavigate();

  const webcamRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const {
    status: audioStatus,       
    startRecording,
    stopRecording,
    mediaBlobUrl,             
    clearBlobUrl,
  } = useReactMediaRecorder({ audio: true, video: false });

  const [uploading, setUploading] = useState(false);

  // ─────────────────────────────────────────
  //  IMAGE FUNCTIONS (react-webcam)
  // ─────────────────────────────────────────
  const handleStartCamera = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first.", { position: "top-right", autoClose: 3000 });
      navigate("/");
      return;
    }
    setCapturedImage(null);
    setImageFile(null);
    setShowCamera(true);
  };

  const handleCapture = useCallback(() => {
    // react-webcam: getScreenshot() returns base64 image
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      toast.error("Failed to capture image. Try again.", { position: "top-right", autoClose: 3000 });
      return;
    }
    setCapturedImage(imageSrc);
    setShowCamera(false);

    // Convert base64 to File
    fetch(imageSrc)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], `kyc_image_${Date.now()}.png`, { type: "image/png" });
        setImageFile(file);
      });

    toast.success("Photo captured!", { position: "top-right", autoClose: 2000 });
  }, [webcamRef]);

  const handleRetake = () => {
    setCapturedImage(null);
    setImageFile(null);
    setShowCamera(true);
  };

  
  const handleStartAudio = () => {
    if (!capturedImage) {
      toast.info("Please capture your photo first.", { position: "top-right", autoClose: 3000 });
      return;
    }
    clearBlobUrl();
    startRecording();
    toast.info("Recording started...", { position: "top-right", autoClose: 2000 });
  };

  const handleStopAudio = () => {
    stopRecording();
    toast.success("Audio recorded!", { position: "top-right", autoClose: 2000 });
  };

  const handleRerecord = () => {
    clearBlobUrl();
  };

  
  const handleUpload = async () => {
    if (!imageFile) {
      toast.error("Please capture your photo first.", { position: "top-right", autoClose: 3000 });
      return;
    }
    if (!mediaBlobUrl) {
      toast.error("Please record your audio first.", { position: "top-right", autoClose: 3000 });
      return;
    }

    const token = localStorage.getItem("token");
    setUploading(true);

    try {
      // Convert mediaBlobUrl to File
      const audioBlob = await fetch(mediaBlobUrl).then((r) => r.blob());
      const audioFile = new File([audioBlob], `kyc_audio_${Date.now()}.webm`, { type: "audio/webm" });

      const formData = new FormData();
      formData.append("kycImage", imageFile);
      formData.append("kycAudio", audioFile);

      const res = await fetch("http://localhost:3000/users/kyc", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      toast.success("KYC submitted successfully! Redirecting...", {
        position: "top-right", autoClose: 2000,
      });
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error) {
      toast.error(error.message || "Upload failed. Try again.", {
        position: "top-right", autoClose: 4000,
      });
    } finally {
      setUploading(false);
    }
  };

  // ─────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-purple-950 flex items-center justify-center p-4 relative overflow-hidden">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="dark"
        toastStyle={{
          backgroundColor: "#2e1065",
          border: "1px solid #7e22ce",
          color: "#e9d5ff",
          borderRadius: "12px",
        }}
      />

      {/* Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-700 rounded-full opacity-20 blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-600 rounded-full opacity-20 blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 w-full max-w-2xl">
        <div className="rounded-2xl p-[1px] bg-gradient-to-br from-purple-500 via-violet-500 to-fuchsia-500 shadow-2xl shadow-purple-900/60">
          <div className="bg-purple-950 rounded-2xl px-8 py-10">

            {/* Header */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="text-center mb-2">
              <h1 className="text-3xl font-bold text-white tracking-tight">KYC Verification</h1>
              <p className="text-purple-300 text-sm mt-2">
                Complete Step 1 (Photo) then Step 2 (Audio)
              </p>
            </div>

            {/* Library badge */}
            <div className="flex justify-center gap-2 mb-8 mt-4">
              <span className="text-xs bg-purple-800 text-purple-300 px-3 py-1 rounded-full border border-purple-600">
                📷 react-webcam
              </span>
              <span className="text-xs bg-purple-800 text-purple-300 px-3 py-1 rounded-full border border-purple-600">
                🎙 react-media-recorder
              </span>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-3 mb-8">
              <div className={`flex-1 flex items-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all
                ${capturedImage ? "bg-green-900/40 border-green-600 text-green-300" : "bg-purple-900/50 border-purple-700 text-purple-300"}`}>
                <Camera className="w-4 h-4 shrink-0" />
                Step 1: Photo {capturedImage ? "✔" : ""}
              </div>
              <div className="w-6 h-px bg-purple-700 shrink-0" />
              <div className={`flex-1 flex items-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all
                ${mediaBlobUrl ? "bg-green-900/40 border-green-600 text-green-300" : "bg-purple-900/50 border-purple-700 text-purple-300"}`}>
                <Mic className="w-4 h-4 shrink-0" />
                Step 2: Audio {mediaBlobUrl ? "✔" : ""}
              </div>
            </div>

            {/* ── STEP 1: IMAGE BUTTON (react-webcam) ── */}
            <div className="mb-6 p-5 rounded-xl bg-purple-900/40 border border-purple-700/60">
              <h2 className="text-white font-semibold mb-1 flex items-center gap-2">
                <Camera className="w-4 h-4 text-purple-400" /> Image Button
              </h2>
              <p className="text-xs text-purple-500 mb-4">Library: <span className="text-purple-300">react-webcam</span></p>

              {/* Webcam / preview */}
              <div className="rounded-xl overflow-hidden bg-purple-900 border border-purple-700 aspect-video flex items-center justify-center mb-4">
                {!showCamera && !capturedImage && (
                  <div className="text-center text-purple-500">
                    <Camera className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-xs">Click "Start Camera" to begin</p>
                  </div>
                )}

                {/* react-webcam component */}
                {showCamera && (
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/png"
                    videoConstraints={{ facingMode: "user", width: 1280, height: 720 }}
                    className="w-full h-full object-cover"
                    mirrored={true}
                  />
                )}

                {capturedImage && !showCamera && (
                  <img src={capturedImage} alt="KYC Capture" className="w-full h-full object-cover" />
                )}
              </div>

              {/* Image action buttons */}
              <div className="flex gap-3">
                {!showCamera && !capturedImage && (
                  <button
                    onClick={handleStartCamera}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:opacity-90 text-white font-semibold text-sm transition-all"
                  >
                    <Camera className="w-4 h-4" /> Start Camera
                  </button>
                )}
                {showCamera && (
                  <>
                    <button
                      onClick={handleCapture}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:opacity-90 text-white font-semibold text-sm transition-all"
                    >
                      <Camera className="w-4 h-4" /> Capture Photo
                    </button>
                    <button
                      onClick={() => setShowCamera(false)}
                      className="px-4 py-2.5 rounded-xl border border-purple-600 text-purple-300 hover:bg-purple-800 text-sm font-semibold transition-all"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {capturedImage && !showCamera && (
                  <button
                    onClick={handleRetake}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-purple-600 text-purple-300 hover:bg-purple-800 text-sm font-semibold transition-all"
                  >
                    <RefreshCw className="w-4 h-4" /> Retake
                  </button>
                )}
              </div>
            </div>

            {/* ── STEP 2: AUDIO BUTTON (react-media-recorder) ── */}
            <div className="mb-6 p-5 rounded-xl bg-purple-900/40 border border-purple-700/60">
              <h2 className="text-white font-semibold mb-1 flex items-center gap-2">
                <Mic className="w-4 h-4 text-purple-400" /> Video Button
                <span className="text-xs text-purple-400 font-normal">(Audio recording)</span>
              </h2>
              <p className="text-xs text-purple-500 mb-4">Library: <span className="text-purple-300">react-media-recorder</span></p>

              {/* Audio status display */}
              <div className="rounded-xl bg-purple-900 border border-purple-700 p-5 flex items-center justify-center mb-4 min-h-24">
                {audioStatus === "idle" && !mediaBlobUrl && (
                  <div className="text-center text-purple-500">
                    <Mic className="w-8 h-8 mx-auto mb-1 opacity-40" />
                    <p className="text-xs">{capturedImage ? "Ready to record audio" : "Complete Step 1 first"}</p>
                  </div>
                )}

                {audioStatus === "recording" && (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-red-400 rounded-full animate-pulse" />
                      <span className="text-red-300 font-semibold">Recording...</span>
                    </div>
                    {/* Animated bars */}
                    <div className="flex items-end gap-1 h-8">
                      {[...Array(14)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1.5 bg-purple-400 rounded-full animate-bounce"
                          style={{ height: `${(i % 3 + 1) * 10}px`, animationDelay: `${i * 0.07}s` }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* react-media-recorder provides mediaBlobUrl for playback */}
                {mediaBlobUrl && audioStatus === "stopped" && (
                  <div className="w-full">
                    <audio controls src={mediaBlobUrl} className="w-full" />
                  </div>
                )}
              </div>

              {/* Audio status badge */}
              <div className="mb-3">
                <span className={`text-xs px-2 py-1 rounded-full font-medium
                  ${audioStatus === "recording" ? "bg-red-900 text-red-300 border border-red-700"
                  : audioStatus === "stopped" ? "bg-green-900 text-green-300 border border-green-700"
                  : "bg-purple-800 text-purple-400 border border-purple-600"}`}>
                  Status: {audioStatus}
                </span>
              </div>

              {/* Audio action buttons */}
              <div className="flex gap-3">
                {audioStatus === "idle" && !mediaBlobUrl && (
                  <button
                    onClick={handleStartAudio}
                    disabled={!capturedImage}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 text-white font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Mic className="w-4 h-4" /> Start Recording
                  </button>
                )}

                {audioStatus === "recording" && (
                  <button
                    onClick={handleStopAudio}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-red-700 to-rose-600 hover:opacity-90 text-white font-semibold text-sm transition-all"
                  >
                    <Square className="w-4 h-4" /> Stop Recording
                  </button>
                )}

                {mediaBlobUrl && audioStatus === "stopped" && (
                  <button
                    onClick={handleRerecord}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-purple-600 text-purple-300 hover:bg-purple-800 text-sm font-semibold transition-all"
                  >
                    <RefreshCw className="w-4 h-4" /> Re-record
                  </button>
                )}
              </div>
            </div>

            {/* ── SUBMIT BUTTON ── */}
            <button
              onClick={handleUpload}
              disabled={uploading || !imageFile || !mediaBlobUrl}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-green-700 to-emerald-600 hover:opacity-90 text-white font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  {!imageFile && !mediaBlobUrl ? "Complete both steps to submit"
                    : !imageFile ? "Capture photo to submit"
                    : !mediaBlobUrl ? "Record audio to submit"
                    : "Submit KYC"}
                </>
              )}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default KYC;