"use client";
import { useRef, useState } from "react";
import axios from "axios";

const FaceRecognition = () => {
  const [cameraOpen, setCameraOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startCamera = async () => {
    try {
      setError(null); // Reset error
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraOpen(true);
    } catch (err) {
      setError("Камер нээх боломжгүй байна. Та зөвшөөрөл өгсөн эсэхээ шалгана уу.");
      console.error("Camera error:", err);
    }
  };

  return (
    <div className="flex h-screen bg-pink-100">
      {/* Sidebar */}
      <aside className="w-64 bg-pink-200 p-6 flex flex-col gap-4 shadow-md">
        <h1 className="text-pink-600 text-3xl font-bold">NIRAN</h1>
        <button onClick={startCamera} className="bg-pink-500 text-white py-2 rounded hover:bg-pink-600">
          Камер нээх
        </button>
        <button className="bg-pink-500 text-white py-2 rounded hover:bg-pink-600">
          Холбоо барих
        </button>
        <button className="bg-pink-500 text-white py-2 rounded hover:bg-pink-600">
          Санал болгох
        </button>
        <button className="bg-pink-500 text-white py-2 rounded hover:bg-pink-600">
          NIRAN зочлох
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex justify-center items-center bg-white rounded-lg shadow-md m-6">
        {!cameraOpen ? (
          <div className="text-center">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 flex justify-center items-center border rounded-full border-gray-500 relative">
                <img src="./camera-icon.png" alt="Camera Icon" className="w-16 opacity-50" />
                <div className="absolute w-24 h-24 border-2 border-black rounded-full transform rotate-45"></div>
              </div>
              <p className="mt-4 text-gray-700">Камер хаалттай байна.</p>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            className="border rounded-lg shadow-lg w-[720px] h-[540px]"
          ></video>
        )}
      </main>
    </div>
  );
};

export default FaceRecognition;
