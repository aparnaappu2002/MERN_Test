import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { useReactMediaRecorder } from "react-media-recorder";
import { Camera, Mic, Upload, RefreshCw, ShieldCheck, Square } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUploadToCloudinaryMutation,useUploadAudioMutation,useSubmitKycMutation } from "../hooks/userCustomHooks";

const KYC = () => {
  const navigate = useNavigate();

  const webcamRef = useRef<Webcam>(null);
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string | null>(null);

  const uploadMutation = useUploadToCloudinaryMutation();
  const uploadAudioMutation = useUploadAudioMutation();  
  const submitKycMutation = useSubmitKycMutation();
    


  const {
    status: audioStatus,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    clearBlobUrl,
  } = useReactMediaRecorder({ audio: true, video: false });

  // ── STEP 1: Camera ──
  const handleStartCamera = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first.");
      navigate("/");
      return;
    }
    setCapturedImage(null);
    setUploadedImageUrl(null);
    setShowCamera(true);
  };

  const handleCapture = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      toast.error("Failed to capture image. Try again.");
      return;
    }

    setCapturedImage(imageSrc);
    setShowCamera(false);
    toast.info("Uploading photo to Cloudinary...");

    try {
      const blob = await fetch(imageSrc).then((r) => r.blob());
      const file = new File([blob], `kyc_image_${Date.now()}.png`, { type: "image/png" });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

      const response = await uploadMutation.mutateAsync(formData);
      setUploadedImageUrl(response.secure_url);
      toast.success("Photo uploaded!");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image.");
      setCapturedImage(null);
    }
  }, [webcamRef, uploadMutation]);

  const handleRetake = () => {
    setCapturedImage(null);
    setUploadedImageUrl(null);
    setShowCamera(true);
  };

  // ── STEP 2: Audio ──
  const handleStartAudio = () => {
    if (!uploadedImageUrl) {
      toast.info("Please capture your photo first.");
      return;
    }
    clearBlobUrl();
    setUploadedAudioUrl(null);
    startRecording();
    toast.info("Recording started...");
  };

  const handleStopAudio = () => {
    stopRecording();
    toast.success("Audio recorded! Click upload to save.");
  };

  const handleUploadAudio = async () => {
  if (!mediaBlobUrl) return;
  toast.info("Uploading audio to Cloudinary...");

  try {
    const audioBlob = await fetch(mediaBlobUrl).then((r) => r.blob());
    const audioFile = new File([audioBlob], `kyc_audio_${Date.now()}.webm`, {
      type: "audio/webm",
    });

    const formData = new FormData();
    formData.append("file", audioFile);
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    const response = await uploadAudioMutation.mutateAsync(formData); // ✅ uses video/upload URL
    setUploadedAudioUrl(response.secure_url);
    toast.success("Audio uploaded!");
  } catch (error: any) {
    toast.error(error.message || "Failed to upload audio.");
  }
};
  const handleRerecord = () => {
    clearBlobUrl();
    setUploadedAudioUrl(null);
  };

  // ── SUBMIT: send Cloudinary URLs to backend ──
  const handleSubmit = async () => {
  if (!uploadedImageUrl || !uploadedAudioUrl) return;

  try {
    const data = await submitKycMutation.mutateAsync({
      imageUrl: uploadedImageUrl,   // ✅ matches backend { imageUrl, audioUrl }
      audioUrl: uploadedAudioUrl,
    });
    toast.success(data.message || "KYC submitted successfully!");
    setTimeout(() => navigate("/dashboard"), 2000);
  } catch (error: any) {
    toast.error(error.message || "Submission failed. Try again.");
  }
};

  const isUploading = uploadMutation.isPending;

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
        <div className="rounded-2xl p-px bg-linear-to-br from-purple-500 via-violet-500 to-fuchsia-500 shadow-2xl shadow-purple-900/60">
          <div className="bg-purple-950 rounded-2xl px-8 py-10">

            {/* Header */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white tracking-tight">KYC Verification</h1>
              <p className="text-purple-300 text-sm mt-2">Complete Step 1 (Photo) then Step 2 (Audio)</p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-3 mb-8">
              <div className={`flex-1 flex items-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all
                ${uploadedImageUrl ? "bg-green-900/40 border-green-600 text-green-300"
                  : isUploading && capturedImage ? "bg-yellow-900/40 border-yellow-600 text-yellow-300"
                  : "bg-purple-900/50 border-purple-700 text-purple-300"}`}>
                <Camera className="w-4 h-4 shrink-0" />
                Step 1: Photo {uploadedImageUrl ? "✔" : isUploading && capturedImage ? "⏳" : ""}
              </div>
              <div className="w-6 h-px bg-purple-700 shrink-0" />
              <div className={`flex-1 flex items-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all
                ${uploadedAudioUrl ? "bg-green-900/40 border-green-600 text-green-300"
                  : isUploading && mediaBlobUrl ? "bg-yellow-900/40 border-yellow-600 text-yellow-300"
                  : "bg-purple-900/50 border-purple-700 text-purple-300"}`}>
                <Mic className="w-4 h-4 shrink-0" />
                Step 2: Audio {uploadedAudioUrl ? "✔" : isUploading && mediaBlobUrl ? "⏳" : ""}
              </div>
            </div>

            {/* ── STEP 1: IMAGE ── */}
            <div className="mb-6 p-5 rounded-xl bg-purple-900/40 border border-purple-700/60">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Camera className="w-4 h-4 text-purple-400" /> Step 1: Capture Photo
              </h2>

              <div className="rounded-xl overflow-hidden bg-purple-900 border border-purple-700 aspect-video flex items-center justify-center mb-4">
                {!showCamera && !capturedImage && (
                  <div className="text-center text-purple-500">
                    <Camera className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-xs">Click "Start Camera" to begin</p>
                  </div>
                )}
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
                  <div className="relative w-full h-full">
                    <img src={capturedImage} alt="KYC Capture" className="w-full h-full object-cover" />
                    {isUploading && !uploadedImageUrl && (
                      <div className="absolute inset-0 bg-purple-950/70 flex items-center justify-center">
                        <div className="text-white text-sm flex items-center gap-2">
                          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          Uploading to Cloudinary...
                        </div>
                      </div>
                    )}
                    {uploadedImageUrl && (
                      <div className="absolute top-2 right-2 bg-green-700 text-white text-xs px-2 py-1 rounded-full">
                        ✔ Uploaded
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {!showCamera && !capturedImage && (
                  <button onClick={handleStartCamera}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-linear-to-r from-purple-600 to-violet-600 hover:opacity-90 text-white font-semibold text-sm transition-all">
                    <Camera className="w-4 h-4" /> Start Camera
                  </button>
                )}
                {showCamera && (
                  <>
                    <button onClick={handleCapture}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-linear-to-r from-fuchsia-600 to-purple-600 hover:opacity-90 text-white font-semibold text-sm transition-all">
                      <Camera className="w-4 h-4" /> Capture & Upload
                    </button>
                    <button onClick={() => setShowCamera(false)}
                      className="px-4 py-2.5 rounded-xl border border-purple-600 text-purple-300 hover:bg-purple-800 text-sm font-semibold transition-all">
                      Cancel
                    </button>
                  </>
                )}
                {capturedImage && !showCamera && !isUploading && (
                  <button onClick={handleRetake}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-purple-600 text-purple-300 hover:bg-purple-800 text-sm font-semibold transition-all">
                    <RefreshCw className="w-4 h-4" /> Retake
                  </button>
                )}
              </div>
            </div>

            {/* ── STEP 2: AUDIO ── */}
            <div className="mb-6 p-5 rounded-xl bg-purple-900/40 border border-purple-700/60">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Mic className="w-4 h-4 text-purple-400" /> Step 2: Record Audio
              </h2>

              <div className="rounded-xl bg-purple-900 border border-purple-700 p-5 flex items-center justify-center mb-4 min-h-24">
                {audioStatus === "idle" && !mediaBlobUrl && (
                  <div className="text-center text-purple-500">
                    <Mic className="w-8 h-8 mx-auto mb-1 opacity-40" />
                    <p className="text-xs">{uploadedImageUrl ? "Ready to record" : "Complete Step 1 first"}</p>
                  </div>
                )}
                {audioStatus === "recording" && (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-red-400 rounded-full animate-pulse" />
                      <span className="text-red-300 font-semibold">Recording...</span>
                    </div>
                    <div className="flex items-end gap-1 h-8">
                      {[...Array(14)].map((_, i) => (
                        <div key={i} className="w-1.5 bg-purple-400 rounded-full animate-bounce"
                          style={{ height: `${(i % 3 + 1) * 10}px`, animationDelay: `${i * 0.07}s` }} />
                      ))}
                    </div>
                  </div>
                )}
                {mediaBlobUrl && audioStatus === "stopped" && (
                  <div className="w-full space-y-3">
                    <audio controls src={mediaBlobUrl} className="w-full" />
                    {!uploadedAudioUrl && !isUploading && (
                      <button onClick={handleUploadAudio}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-linear-to-r from-violet-700 to-purple-700 hover:opacity-90 text-white text-sm font-semibold transition-all">
                        <Upload className="w-4 h-4" /> Upload Audio to Cloudinary
                      </button>
                    )}
                    {isUploading && (
                      <div className="text-center text-yellow-300 text-xs flex items-center justify-center gap-2">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Uploading audio...
                      </div>
                    )}
                    {uploadedAudioUrl && (
                      <p className="text-center text-green-400 text-xs font-semibold">✔ Audio uploaded to Cloudinary</p>
                    )}
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

              <div className="flex gap-3">
                {audioStatus === "idle" && !mediaBlobUrl && (
                  <button onClick={handleStartAudio} disabled={!uploadedImageUrl}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-linear-to-r from-violet-600 to-purple-600 hover:opacity-90 text-white font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                    <Mic className="w-4 h-4" /> Start Recording
                  </button>
                )}
                {audioStatus === "recording" && (
                  <button onClick={handleStopAudio}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-linear-to-r from-red-700 to-rose-600 hover:opacity-90 text-white font-semibold text-sm transition-all">
                    <Square className="w-4 h-4" /> Stop Recording
                  </button>
                )}
                {mediaBlobUrl && audioStatus === "stopped" && (
                  <button onClick={handleRerecord}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-purple-600 text-purple-300 hover:bg-purple-800 text-sm font-semibold transition-all">
                    <RefreshCw className="w-4 h-4" /> Re-record
                  </button>
                )}
              </div>
            </div>

            {/* ── SUBMIT ── */}
            <button
              onClick={handleSubmit}
              disabled={submitKycMutation.isPending || !uploadedImageUrl || !uploadedAudioUrl}

              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-linear-to-r from-green-700 to-emerald-600 hover:opacity-90 text-white font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
            >
              {submitKycMutation.isPending ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  {!uploadedImageUrl && !uploadedAudioUrl ? "Complete both steps to submit"
                    : !uploadedImageUrl ? "Upload photo to submit"
                    : !uploadedAudioUrl ? "Upload audio to submit"
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