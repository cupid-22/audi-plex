from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from diart.inference import StreamingInference
from diart.models import SegmentationModel
from diart.config import DiarizationConfig
from diart.sources import WebSocketAudioSource

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.websocket("/ws/audio")
async def audio_endpoint(websocket: WebSocket):
    await websocket.accept()
    config = DiarizationConfig(segmentation=SegmentationModel.from_pretrained("pyannote/segmentation"))
    source = WebSocketAudioSource(websocket)
    inference = StreamingInference(config, source)
    inference()
