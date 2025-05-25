import { useState } from "react";

export function VideoUploader() {
  const [video, setVideo] = useState(null);
  const [status, setStatus] = useState("");

  const handleFileChange = (e: any) => {
    setVideo(e.target.files[0]);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!video) {
      alert("Please select a video file first.");
      return;
    }

    const formData = new FormData();
    formData.append("video", video);

    setStatus("⏳ Uploading and streaming...");

    try {
      const response = await fetch("http://localhost:4000/stream", {
        method: "POST",
        body: formData,
      });

      const text = await response.text();

      if (response.ok) {
        setStatus(`✅ Success: ${text}`);
      } else {
        setStatus(`❌ Error: ${text}`);
      }
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center p-8">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">📤 Upload & Stream Video</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="p-2 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-800"
          />

          <button 
            type="submit" 
            className="py-3 px-4 bg-indigo-600 text-white rounded-lg cursor-pointer transition-colors hover:bg-indigo-700"
          >
            Upload & Stream
          </button>
        </form>

        {status && (
          <p className="mt-6 p-4 text-sm text-gray-700 bg-gray-50 rounded-lg text-center">
            {status}
          </p>
        )}
      </div>
    </div>
  );
}

export default VideoUploader;
