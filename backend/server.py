from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Slideo API", description="AI-Powered Presentation Builder")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Import routes
from routes import auth, presentations, templates, ai, slides, chat

# Add routes to API router
api_router.include_router(auth.router)
api_router.include_router(presentations.router)
api_router.include_router(templates.router)
api_router.include_router(ai.router)
api_router.include_router(slides.router)
api_router.include_router(chat.router)

# Basic health check
@api_router.get("/")
async def root():
    return {"message": "Slideo API is running", "version": "1.0.0"}

# Include the API router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()