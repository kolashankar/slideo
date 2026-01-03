"""Seed database with initial templates"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

TEMPLATES = [
    {
        "id": "template-modern-business",
        "name": "Modern Business",
        "category": "Business",
        "description": "Clean, professional design with blue and grey palette",
        "thumbnail_url": "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop",
        "color_scheme": {
            "primary": "#2563EB",
            "secondary": "#64748B",
            "background": "#FFFFFF",
            "text": "#1E293B"
        },
        "font_family": "Inter",
        "slide_layouts": [
            {"type": "title", "layout": "center"},
            {"type": "content", "layout": "two-column"},
            {"type": "image", "layout": "full"}
        ]
    },
    {
        "id": "template-bold-pitch",
        "name": "Bold Pitch",
        "category": "Business",
        "description": "High contrast, large text, attention-grabbing design",
        "thumbnail_url": "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop",
        "color_scheme": {
            "primary": "#DC2626",
            "secondary": "#000000",
            "background": "#FFFFFF",
            "text": "#000000"
        },
        "font_family": "Manrope",
        "slide_layouts": [
            {"type": "title", "layout": "left"},
            {"type": "content", "layout": "single-column"},
            {"type": "quote", "layout": "center"}
        ]
    },
    {
        "id": "template-minimal-white",
        "name": "Minimal White",
        "category": "Minimal",
        "description": "Simple, lots of whitespace, elegant and refined",
        "thumbnail_url": "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400&h=300&fit=crop",
        "color_scheme": {
            "primary": "#000000",
            "secondary": "#6B7280",
            "background": "#FFFFFF",
            "text": "#111827"
        },
        "font_family": "Playfair Display",
        "slide_layouts": [
            {"type": "title", "layout": "center"},
            {"type": "content", "layout": "minimal"},
            {"type": "image", "layout": "side"}
        ]
    },
    {
        "id": "template-dark-elegance",
        "name": "Dark Elegance",
        "category": "Premium",
        "description": "Dark background with gold accents, premium feel",
        "thumbnail_url": "https://images.unsplash.com/photo-1579226905180-636b76d96082?w=400&h=300&fit=crop",
        "color_scheme": {
            "primary": "#D97706",
            "secondary": "#F59E0B",
            "background": "#1F2937",
            "text": "#F9FAFB"
        },
        "font_family": "Cormorant Garamond",
        "slide_layouts": [
            {"type": "title", "layout": "center"},
            {"type": "content", "layout": "elegant"},
            {"type": "image", "layout": "overlay"}
        ]
    },
    {
        "id": "template-gradient-flow",
        "name": "Gradient Flow",
        "category": "Creative",
        "description": "Smooth gradients, modern tech-focused design",
        "thumbnail_url": "https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=300&fit=crop",
        "color_scheme": {
            "primary": "#8B5CF6",
            "secondary": "#3B82F6",
            "background": "#FFFFFF",
            "text": "#1E293B"
        },
        "font_family": "Inter",
        "slide_layouts": [
            {"type": "title", "layout": "gradient"},
            {"type": "content", "layout": "modern"},
            {"type": "image", "layout": "split"}
        ]
    },
    {
        "id": "template-educational",
        "name": "Educational",
        "category": "Education",
        "description": "Clear hierarchy, easy to read, organized content",
        "thumbnail_url": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop",
        "color_scheme": {
            "primary": "#0EA5E9",
            "secondary": "#10B981",
            "background": "#F8FAFC",
            "text": "#0F172A"
        },
        "font_family": "Inter",
        "slide_layouts": [
            {"type": "title", "layout": "header"},
            {"type": "content", "layout": "structured"},
            {"type": "diagram", "layout": "center"}
        ]
    },
    {
        "id": "template-creative-burst",
        "name": "Creative Burst",
        "category": "Creative",
        "description": "Colorful, playful, energetic design",
        "thumbnail_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
        "color_scheme": {
            "primary": "#EC4899",
            "secondary": "#F59E0B",
            "background": "#FFFFFF",
            "text": "#1F2937"
        },
        "font_family": "Nunito",
        "slide_layouts": [
            {"type": "title", "layout": "playful"},
            {"type": "content", "layout": "asymmetric"},
            {"type": "image", "layout": "collage"}
        ]
    },
    {
        "id": "template-startup-pitch",
        "name": "Startup Pitch",
        "category": "Business",
        "description": "Dynamic, innovative, venture-ready presentation",
        "thumbnail_url": "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop",
        "color_scheme": {
            "primary": "#6366F1",
            "secondary": "#14B8A6",
            "background": "#FFFFFF",
            "text": "#111827"
        },
        "font_family": "Manrope",
        "slide_layouts": [
            {"type": "title", "layout": "bold"},
            {"type": "metrics", "layout": "grid"},
            {"type": "roadmap", "layout": "timeline"}
        ]
    }
]

async def seed_templates():
    """Insert templates into database if they don't exist"""
    print("Seeding templates...")
    
    for template in TEMPLATES:
        existing = await db.templates.find_one({"id": template["id"]})
        if not existing:
            from datetime import datetime, timezone
            template['created_at'] = datetime.now(timezone.utc).isoformat()
            await db.templates.insert_one(template)
            print(f"✅ Added template: {template['name']}")
        else:
            print(f"⏭️  Template already exists: {template['name']}")
    
    print("\n✅ Template seeding complete!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_templates())