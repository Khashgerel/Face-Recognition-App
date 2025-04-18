"use client";
import { useRef, useState, useEffect } from "react";
import axios from "axios";
import cameraIcon from "./camera-icon.png";
import { X } from "lucide-react";


const FaceRecognition = () => {
  const [cameraOpen, setCameraOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showMakeupIdeas, setShowMakeupIdeas] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      streamRef.current = stream;
      setCameraOpen(true);
    } catch (err) {
      setError("Камер нээх боломжгүй байна. Та зөвшөөрөл өгсөн эсэхээ шалгана уу.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  };

  const captureAndSend = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64Image = canvas.toDataURL("image/jpeg");

        try {
          const response = await axios.post("http://localhost:8000/recognize-face", {
            image: base64Image,
          });
          const faces = response.data.faces_detected;
          setResult(`Нийт илэрсэн царай: ${faces}`);
        } catch (err: any) {
          console.error("Backend error:", err.response?.data || err.message);
          setError("Царай танихад алдаа гарлаа.");
        }
      }
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowMakeupIdeas(true), 30000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`flex h-screen transition-colors duration-500 ${darkMode ? "bg-gray-900 text-white" : "bg-pink-100 text-black"}`}>
      {/* Sidebar */}
      <aside className={`w-64 p-6 flex flex-col gap-4 shadow-lg transition-all duration-500 ${darkMode ? "bg-gray-800" : "bg-pink-200"}`}>
        <h1 className="text-3xl font-extrabold tracking-wide">NIRAN</h1>
        <button onClick={startCamera} className="bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-md shadow-md transition">Камер нээх</button>
        {cameraOpen && (
          <button onClick={stopCamera} className="bg-red-500 hover:bg-red-600 text-white py-2 rounded-md shadow-md transition">Камер хаах</button>
        )}
        <button onClick={captureAndSend} className="bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-md shadow-md transition">Царай таних</button>
        <button onClick={() => setDarkMode(!darkMode)} className="bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-md shadow-md transition">
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
        {error && <p className="text-red-400 font-semibold mt-2">{error}</p>}
        {result && <p className="text-green-400 font-semibold mt-2">{result}</p>}
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Camera section */}
        {!cameraOpen ? (
          <div className="text-center">
            <div className="flex flex-col items-center">
              <div className="w-28 h-28 border-2 border-gray-400 rounded-full flex justify-center items-center relative">
                <img src={cameraIcon.src} alt="Camera Icon" className="w-16 opacity-50" />
                <div className="absolute w-28 h-28 border-2 border-black rounded-full transform rotate-45"></div>
              </div>
              <p className="mt-4 text-gray-500">Камер хаалттай байна.</p>
            </div>
          </div>
        ) : (
          <video ref={videoRef} autoPlay className="rounded-lg shadow-xl w-[720px] h-[540px] object-cover border-2 border-pink-400" />
        )}
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {/* Makeup Ideas Sliding Column */}
        <div className={`absolute top-0 right-0 h-full w-72 bg-white shadow-lg p-4 transform ${showMakeupIdeas ? "translate-x-0" : "translate-x-full"} transition-transform duration-1000 ease-in-out`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-pink-500">Makeup Ideas</h2>
            <button onClick={() => setShowMakeupIdeas(false)} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
          <div className="flex flex-col gap-4">
            <div className="p-3 rounded-lg shadow hover:shadow-lg transition border border-pink-200">
              <h3 className="font-semibold text-pink-600">Natural Glow</h3>
              <p className="text-sm text-gray-500">Minimal makeup for a fresh look.</p>
            </div>
            <div className="p-3 rounded-lg shadow hover:shadow-lg transition border border-pink-200">
              <h3 className="font-semibold text-pink-600">Glam Night</h3>
              <p className="text-sm text-gray-500">Perfect for a night out.</p>
            </div>
            <div className="p-3 rounded-lg shadow hover:shadow-lg transition border border-pink-200">
              <h3 className="font-semibold text-pink-600">Soft Smokey</h3>
              <p className="text-sm text-gray-500">Elegant and chic style.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FaceRecognition;
