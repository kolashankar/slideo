#!/usr/bin/env python3
"""
Quick test for the critical slide endpoints that were added to fix 404 errors
"""

import asyncio
import aiohttp
import json

BACKEND_URL = "https://pres-fetch-debug.preview.emergentagent.com/api"
TEST_USER_EMAIL = "test.critical@slideo.com"
TEST_USER_PASSWORD = "TestPassword123!"

async def test_critical_endpoints():
    """Test the critical endpoints"""
    session = aiohttp.ClientSession()
    
    try:
        # 1. Register/Login
        print("🔐 Authenticating...")
        auth_data = {
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD,
            "name": "Critical Test User",
            "workspace_name": "Critical Testing"
        }
        
        async with session.post(f"{BACKEND_URL}/auth/signup", json=auth_data) as response:
            if response.status == 200:
                auth_response = await response.json()
                token = auth_response["access_token"]
                print("✅ Authentication successful")
            else:
                # Try login
                login_data = {"email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD}
                async with session.post(f"{BACKEND_URL}/auth/login", json=login_data) as login_response:
                    if login_response.status == 200:
                        auth_response = await login_response.json()
                        token = auth_response["access_token"]
                        print("✅ Login successful")
                    else:
                        print("❌ Authentication failed")
                        return
        
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        
        # 2. Create test presentation
        print("\n📋 Creating test presentation...")
        pres_data = {
            "title": "Critical Test Presentation",
            "description": "Testing critical slide endpoints"
        }
        
        async with session.post(f"{BACKEND_URL}/presentations", json=pres_data, headers=headers) as response:
            if response.status == 200:
                pres_response = await response.json()
                presentation_id = pres_response["id"]
                print(f"✅ Created presentation: {presentation_id}")
            else:
                print(f"❌ Failed to create presentation: {response.status}")
                return
        
        # 3. Test POST /api/presentations/{id}/slides
        print(f"\n➕ Testing POST /api/presentations/{presentation_id}/slides...")
        slide_data = {
            "slide_number": 1,
            "layout": "blank",
            "title": "Critical Test Slide",
            "elements": [],
            "background": {"type": "solid", "color": "#ffffff"}
        }
        
        async with session.post(f"{BACKEND_URL}/presentations/{presentation_id}/slides", 
                               json=slide_data, headers=headers) as response:
            response_text = await response.text()
            print(f"Status: {response.status}")
            print(f"Response: {response_text[:500]}...")
            
            if response.status == 200:
                slide_response = await response.json()
                if slide_response.get("success"):
                    print("✅ POST slide endpoint working")
                    slide_id = slide_response.get("data", {}).get("id")
                else:
                    print("❌ POST slide endpoint returned success=false")
            else:
                print(f"❌ POST slide endpoint failed: {response.status}")
        
        # 4. Test GET /api/presentations/{id}/slides
        print(f"\n📋 Testing GET /api/presentations/{presentation_id}/slides...")
        async with session.get(f"{BACKEND_URL}/presentations/{presentation_id}/slides", 
                              headers=headers) as response:
            response_text = await response.text()
            print(f"Status: {response.status}")
            print(f"Response: {response_text[:500]}...")
            
            if response.status == 200:
                slides_response = await response.json()
                if slides_response.get("success"):
                    slides = slides_response.get("data", [])
                    count = slides_response.get("count", 0)
                    print(f"✅ GET slides endpoint working - {count} slides retrieved")
                else:
                    print("❌ GET slides endpoint returned success=false")
            else:
                print(f"❌ GET slides endpoint failed: {response.status}")
        
        # 5. Test authentication requirements
        print(f"\n🔐 Testing authentication requirements...")
        async with session.get(f"{BACKEND_URL}/presentations/{presentation_id}/slides") as response:
            if response.status == 401:
                print("✅ Authentication properly required")
            else:
                print(f"❌ Should require authentication, got: {response.status}")
        
        # 6. Test 404 handling
        print(f"\n🚫 Testing 404 handling...")
        async with session.get(f"{BACKEND_URL}/presentations/invalid-id/slides", 
                              headers=headers) as response:
            if response.status == 404:
                print("✅ 404 properly returned for invalid presentation ID")
            else:
                print(f"❌ Should return 404, got: {response.status}")
        
    finally:
        await session.close()

if __name__ == "__main__":
    asyncio.run(test_critical_endpoints())