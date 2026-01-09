#!/usr/bin/env python3
"""
Backend Testing Suite for Slideo AI-Powered Presentation Builder
Tests Phase 3 (AI Integration) and Phase 4 (Slide Data Model)
"""

import asyncio
import aiohttp
import json
import os
import sys
from datetime import datetime
from typing import Dict, Any, Optional

# Configuration
BACKEND_URL = "https://pres-fetch-debug.preview.emergentagent.com/api"
TEST_USER_EMAIL = "test.user.ai@slideo.com"
TEST_USER_PASSWORD = "TestPassword123!"
TEST_USER_NAME = "AI Test User"
TEST_WORKSPACE = "AI Testing Workspace"

class SlideoTester:
    def __init__(self):
        self.session = None
        self.auth_token = None
        self.test_user_id = None
        self.test_presentation_id = None
        self.test_slide_id = None
        self.results = {
            "total_tests": 0,
            "passed": 0,
            "failed": 0,
            "errors": []
        }

    async def setup(self):
        """Initialize HTTP session"""
        self.session = aiohttp.ClientSession()
        print(f"🚀 Starting Slideo Backend Tests")
        print(f"📡 Backend URL: {BACKEND_URL}")
        print("=" * 60)

    async def cleanup(self):
        """Clean up resources"""
        if self.session:
            await self.session.close()

    def log_test(self, test_name: str, success: bool, message: str = "", details: str = ""):
        """Log test result"""
        self.results["total_tests"] += 1
        status = "✅ PASS" if success else "❌ FAIL"
        
        if success:
            self.results["passed"] += 1
            print(f"{status} {test_name}")
            if message:
                print(f"    📝 {message}")
        else:
            self.results["failed"] += 1
            print(f"{status} {test_name}")
            if message:
                print(f"    ❌ {message}")
            if details:
                print(f"    🔍 {details}")
            self.results["errors"].append({
                "test": test_name,
                "message": message,
                "details": details
            })

    async def make_request(self, method: str, endpoint: str, data: Dict = None, 
                          auth_required: bool = True) -> tuple[bool, Dict, str]:
        """Make HTTP request with error handling"""
        url = f"{BACKEND_URL}{endpoint}"
        headers = {"Content-Type": "application/json"}
        
        if auth_required and self.auth_token:
            headers["Authorization"] = f"Bearer {self.auth_token}"
        
        try:
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response_text = await response.text()
                
                try:
                    response_data = json.loads(response_text) if response_text else {}
                except json.JSONDecodeError:
                    response_data = {"raw_response": response_text}
                
                success = 200 <= response.status < 300
                return success, response_data, f"Status: {response.status}"
                
        except Exception as e:
            return False, {}, f"Request failed: {str(e)}"

    # ==================== AUTHENTICATION TESTS ====================
    
    async def test_user_registration(self):
        """Test user registration"""
        data = {
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD,
            "name": TEST_USER_NAME,
            "workspace_name": TEST_WORKSPACE
        }
        
        success, response, details = await self.make_request("POST", "/auth/signup", data, auth_required=False)
        
        if success and "access_token" in response:
            self.auth_token = response["access_token"]
            self.test_user_id = response.get("user", {}).get("id")
            self.log_test("User Registration", True, f"User created with ID: {self.test_user_id}")
        else:
            # Try login if user already exists
            if "already registered" in str(response):
                await self.test_user_login()
            else:
                self.log_test("User Registration", False, "Failed to create user", details)

    async def test_user_login(self):
        """Test user login"""
        data = {
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        }
        
        success, response, details = await self.make_request("POST", "/auth/login", data, auth_required=False)
        
        if success and "access_token" in response:
            self.auth_token = response["access_token"]
            self.test_user_id = response.get("user", {}).get("id")
            self.log_test("User Login", True, f"Logged in with token: {self.auth_token[:20]}...")
        else:
            self.log_test("User Login", False, "Failed to login", details)

    # ==================== AI SERVICE TESTS ====================
    
    async def test_ai_health_check(self):
        """Test AI service health check"""
        success, response, details = await self.make_request("GET", "/ai/health", auth_required=False)
        
        if success and response.get("success"):
            services = response.get("services", {})
            gemini_text = services.get("gemini_text") == "available"
            gemini_image = services.get("gemini_image") == "available"
            
            if gemini_text and gemini_image:
                self.log_test("AI Health Check", True, "All AI services available")
            else:
                self.log_test("AI Health Check", False, f"Services status: {services}")
        else:
            self.log_test("AI Health Check", False, "Health check failed", details)

    async def test_ai_presentation_generation(self):
        """Test AI presentation generation"""
        data = {
            "topic": "Introduction to Artificial Intelligence",
            "audience": "educational",
            "tone": "educational",
            "slide_count": 8,
            "additional_context": "Focus on practical applications and benefits"
        }
        
        print("    🤖 Generating AI presentation (this may take 10-20 seconds)...")
        success, response, details = await self.make_request("POST", "/ai/generate-presentation", data)
        
        if success and response.get("success"):
            presentation_data = response.get("data", {})
            slides = presentation_data.get("slides", [])
            
            if len(slides) >= 5:
                # Verify slide structure
                first_slide = slides[0]
                required_fields = ["slide_number", "title", "content", "layout", "speaker_notes"]
                has_all_fields = all(field in first_slide for field in required_fields)
                
                if has_all_fields:
                    self.log_test("AI Presentation Generation", True, 
                                f"Generated {len(slides)} slides with proper structure")
                else:
                    self.log_test("AI Presentation Generation", False, 
                                f"Missing required fields in slides: {required_fields}")
            else:
                self.log_test("AI Presentation Generation", False, 
                            f"Expected at least 5 slides, got {len(slides)}")
        else:
            self.log_test("AI Presentation Generation", False, "Failed to generate presentation", details)

    async def test_ai_outline_generation(self):
        """Test AI outline generation"""
        data = {
            "topic": "Climate Change Solutions",
            "slide_count": 10
        }
        
        print("    🤖 Generating AI outline...")
        success, response, details = await self.make_request("POST", "/ai/generate-outline", data)
        
        if success and response.get("success"):
            outline_data = response.get("data", {})
            outline = outline_data.get("outline", [])
            
            if len(outline) >= 5:
                first_item = outline[0]
                if "title" in first_item and "description" in first_item:
                    self.log_test("AI Outline Generation", True, 
                                f"Generated outline with {len(outline)} items")
                else:
                    self.log_test("AI Outline Generation", False, "Outline items missing required fields")
            else:
                self.log_test("AI Outline Generation", False, 
                            f"Expected at least 5 outline items, got {len(outline)}")
        else:
            self.log_test("AI Outline Generation", False, "Failed to generate outline", details)

    async def test_ai_slide_content_generation(self):
        """Test AI slide content generation"""
        data = {
            "slide_title": "Benefits of Renewable Energy",
            "presentation_context": "Educational presentation about sustainable energy"
        }
        
        print("    🤖 Generating AI slide content...")
        success, response, details = await self.make_request("POST", "/ai/generate-slide-content", data)
        
        if success and response.get("success"):
            slide_data = response.get("data", {})
            required_fields = ["title", "content", "speaker_notes"]
            has_all_fields = all(field in slide_data for field in required_fields)
            
            if has_all_fields:
                self.log_test("AI Slide Content Generation", True, "Generated slide content with all fields")
            else:
                self.log_test("AI Slide Content Generation", False, 
                            f"Missing required fields: {required_fields}")
        else:
            self.log_test("AI Slide Content Generation", False, "Failed to generate slide content", details)

    async def test_ai_content_improvement(self):
        """Test AI content improvement"""
        data = {
            "current_content": "AI is good. It helps people. AI makes things better.",
            "improvement_type": "clarity",
            "context": "Make this more professional and detailed"
        }
        
        print("    🤖 Improving content with AI...")
        success, response, details = await self.make_request("POST", "/ai/improve-content", data)
        
        if success and response.get("success"):
            improved_data = response.get("data", {})
            improved_content = improved_data.get("improved_content", "")
            
            if len(improved_content) > len(data["current_content"]):
                self.log_test("AI Content Improvement", True, "Content successfully improved")
            else:
                self.log_test("AI Content Improvement", False, "Improved content not significantly better")
        else:
            self.log_test("AI Content Improvement", False, "Failed to improve content", details)

    # ==================== PRESENTATION SETUP FOR SLIDE TESTS ====================
    
    async def create_test_presentation(self):
        """Create a test presentation for slide operations"""
        data = {
            "title": "Test Presentation for Slides",
            "description": "Testing slide CRUD operations"
        }
        
        success, response, details = await self.make_request("POST", "/presentations", data)
        
        if success and "id" in response:
            self.test_presentation_id = response["id"]
            self.log_test("Create Test Presentation", True, f"Created presentation: {self.test_presentation_id}")
            return True
        else:
            self.log_test("Create Test Presentation", False, "Failed to create test presentation", details)
            return False

    # ==================== SLIDE CRUD TESTS ====================
    
    async def test_create_slide(self):
        """Test slide creation"""
        if not self.test_presentation_id:
            self.log_test("Create Slide", False, "No test presentation available")
            return
        
        data = {
            "presentation_id": self.test_presentation_id,
            "slide_number": 1,
            "title": "Test Slide",
            "layout": "content"
        }
        
        success, response, details = await self.make_request(
            "POST", f"/slides/presentations/{self.test_presentation_id}/slides", data)
        
        if success and response.get("success"):
            slide_data = response.get("data", {})
            self.test_slide_id = slide_data.get("id")
            self.log_test("Create Slide", True, f"Created slide: {self.test_slide_id}")
        else:
            self.log_test("Create Slide", False, "Failed to create slide", details)

    async def test_list_slides(self):
        """Test listing slides for a presentation"""
        if not self.test_presentation_id:
            self.log_test("List Slides", False, "No test presentation available")
            return
        
        success, response, details = await self.make_request(
            "GET", f"/slides/presentations/{self.test_presentation_id}/slides")
        
        if success and response.get("success"):
            slides = response.get("data", [])
            count = response.get("count", 0)
            self.log_test("List Slides", True, f"Retrieved {count} slides")
        else:
            self.log_test("List Slides", False, "Failed to list slides", details)

    async def test_get_single_slide(self):
        """Test getting a single slide"""
        if not self.test_slide_id:
            self.log_test("Get Single Slide", False, "No test slide available")
            return
        
        success, response, details = await self.make_request("GET", f"/slides/slides/{self.test_slide_id}")
        
        if success and response.get("success"):
            slide_data = response.get("data", {})
            if slide_data.get("id") == self.test_slide_id:
                self.log_test("Get Single Slide", True, "Retrieved slide successfully")
            else:
                self.log_test("Get Single Slide", False, "Slide ID mismatch")
        else:
            self.log_test("Get Single Slide", False, "Failed to get slide", details)

    async def test_update_slide(self):
        """Test updating a slide"""
        if not self.test_slide_id:
            self.log_test("Update Slide", False, "No test slide available")
            return
        
        data = {
            "title": "Updated Test Slide",
            "notes": "These are updated speaker notes",
            "elements": [
                {
                    "id": "elem-1",
                    "type": "text",
                    "position": {"x": 10, "y": 20, "width": 80, "height": 30, "z_index": 1},
                    "content": {"text": "Updated slide content"},
                    "style": {"font_size": 24, "color": "#333333"}
                }
            ]
        }
        
        success, response, details = await self.make_request("PUT", f"/slides/slides/{self.test_slide_id}", data)
        
        if success and response.get("success"):
            updated_slide = response.get("data", {})
            if updated_slide.get("title") == "Updated Test Slide":
                self.log_test("Update Slide", True, "Slide updated successfully")
            else:
                self.log_test("Update Slide", False, "Slide not properly updated")
        else:
            self.log_test("Update Slide", False, "Failed to update slide", details)

    async def test_duplicate_slide(self):
        """Test duplicating a slide"""
        if not self.test_slide_id:
            self.log_test("Duplicate Slide", False, "No test slide available")
            return
        
        success, response, details = await self.make_request("POST", f"/slides/slides/{self.test_slide_id}/duplicate")
        
        if success and response.get("success"):
            duplicated_slide = response.get("data", {})
            if duplicated_slide.get("id") != self.test_slide_id:
                self.log_test("Duplicate Slide", True, f"Duplicated slide: {duplicated_slide.get('id')}")
            else:
                self.log_test("Duplicate Slide", False, "Duplicate has same ID as original")
        else:
            self.log_test("Duplicate Slide", False, "Failed to duplicate slide", details)

    async def test_reorder_slides(self):
        """Test reordering slides"""
        if not self.test_slide_id:
            self.log_test("Reorder Slides", False, "No test slide available")
            return
        
        data = {
            "slide_id": self.test_slide_id,
            "new_position": 2
        }
        
        success, response, details = await self.make_request("PUT", "/slides/slides/reorder", data)
        
        if success and response.get("success"):
            self.log_test("Reorder Slides", True, "Slide reordered successfully")
        else:
            self.log_test("Reorder Slides", False, "Failed to reorder slide", details)

    async def test_delete_slide(self):
        """Test deleting a slide"""
        if not self.test_slide_id:
            self.log_test("Delete Slide", False, "No test slide available")
            return
        
        success, response, details = await self.make_request("DELETE", f"/slides/slides/{self.test_slide_id}")
        
        if success and response.get("success"):
            self.log_test("Delete Slide", True, "Slide deleted successfully")
        else:
            self.log_test("Delete Slide", False, "Failed to delete slide", details)

    # ==================== ERROR CASE TESTS ====================
    
    async def test_unauthorized_access(self):
        """Test accessing AI endpoints without authentication"""
        # Temporarily remove auth token
        original_token = self.auth_token
        self.auth_token = None
        
        success, response, details = await self.make_request("POST", "/ai/generate-presentation", {
            "topic": "Test",
            "slide_count": 5
        })
        
        # Restore auth token
        self.auth_token = original_token
        
        if not success and "401" in details:
            self.log_test("Unauthorized Access Test", True, "Properly rejected unauthorized request")
        else:
            self.log_test("Unauthorized Access Test", False, "Should have rejected unauthorized request")

    async def test_invalid_presentation_id(self):
        """Test accessing slides with invalid presentation ID"""
        success, response, details = await self.make_request("GET", "/slides/presentations/invalid-id/slides")
        
        if not success and ("404" in details or "not found" in str(response).lower()):
            self.log_test("Invalid Presentation ID Test", True, "Properly handled invalid presentation ID")
        else:
            self.log_test("Invalid Presentation ID Test", False, "Should have returned 404 for invalid ID")

    async def test_invalid_slide_id(self):
        """Test accessing invalid slide ID"""
        success, response, details = await self.make_request("GET", "/slides/slides/invalid-slide-id")
        
        if not success and ("404" in details or "not found" in str(response).lower()):
            self.log_test("Invalid Slide ID Test", True, "Properly handled invalid slide ID")
        else:
            self.log_test("Invalid Slide ID Test", False, "Should have returned 404 for invalid slide ID")

    # ==================== AI PRESENTATION FLOW TESTS ====================
    
    async def test_ai_presentation_flow(self):
        """Test the complete AI presentation generation flow"""
        print("\n🎯 TESTING AI PRESENTATION GENERATION FLOW")
        print("-" * 50)
        
        # Step 1: Generate AI presentation data
        ai_data = await self.test_ai_generation_for_flow()
        if not ai_data:
            return
        
        # Step 2: Create presentation from AI data
        presentation_id = await self.test_create_from_ai_data(ai_data)
        if not presentation_id:
            return
        
        # Step 3: Test preview functionality
        await self.test_preview_endpoint(presentation_id)
    
    async def test_ai_generation_for_flow(self):
        """Test AI presentation generation and return data for flow"""
        data = {
            "topic": "Introduction to Artificial Intelligence",
            "audience": "general",
            "tone": "professional", 
            "slide_count": 5,
            "additional_context": "Focus on basics and real-world applications"
        }
        
        print("    🤖 Step 1: Generating AI presentation structure...")
        success, response, details = await self.make_request("POST", "/ai/generate-presentation", data)
        
        if success and response.get("success"):
            presentation_data = response.get("data", {})
            slides = presentation_data.get("slides", [])
            
            # Verify structure
            required_fields = ["title", "description", "slides"]
            has_all_fields = all(field in presentation_data for field in required_fields)
            
            if has_all_fields and len(slides) >= 5:
                # Verify slide structure
                first_slide = slides[0]
                slide_fields = ["title", "content", "layout", "speaker_notes"]
                slide_has_fields = all(field in first_slide for field in slide_fields)
                
                if slide_has_fields:
                    self.log_test("AI Generation for Flow", True, 
                                f"Generated presentation with {len(slides)} slides")
                    return presentation_data
                else:
                    self.log_test("AI Generation for Flow", False, 
                                f"Slides missing required fields: {slide_fields}")
            else:
                self.log_test("AI Generation for Flow", False, 
                            f"Missing presentation fields or insufficient slides")
        else:
            self.log_test("AI Generation for Flow", False, "Failed to generate AI presentation", details)
        
        return None
    
    async def test_create_from_ai_data(self, ai_data):
        """Test creating presentation from AI data"""
        print("    💾 Step 2: Creating presentation from AI data...")
        
        success, response, details = await self.make_request("POST", "/presentations/from-ai", ai_data)
        
        if success and "id" in response:
            presentation_id = response["id"]
            title = response.get("title", "")
            
            self.log_test("Create Presentation from AI Data", True, 
                        f"Created presentation: {presentation_id} - '{title}'")
            return presentation_id
        else:
            self.log_test("Create Presentation from AI Data", False, 
                        "Failed to create presentation from AI data", details)
            return None
    
    async def test_preview_endpoint(self, presentation_id):
        """Test preview endpoint with created presentation"""
        print("    👁️  Step 3: Testing preview endpoint...")
        
        success, response, details = await self.make_request(
            "GET", f"/export/preview/{presentation_id}", auth_required=False)
        
        if success:
            presentation = response.get("presentation", {})
            slides = response.get("slides", [])
            
            if presentation and slides:
                # Verify slides have elements
                slides_with_elements = [s for s in slides if s.get("elements")]
                
                if len(slides_with_elements) > 0:
                    # Check if elements have proper structure
                    first_slide = slides_with_elements[0]
                    elements = first_slide.get("elements", [])
                    
                    if elements and len(elements) >= 1:
                        # Check element structure
                        first_element = elements[0]
                        element_fields = ["type", "position", "content"]
                        has_element_fields = all(field in first_element for field in element_fields)
                        
                        if has_element_fields:
                            self.log_test("Preview Endpoint Test", True, 
                                        f"Preview working - {len(slides)} slides with positioned elements")
                        else:
                            self.log_test("Preview Endpoint Test", False, 
                                        "Elements missing required fields")
                    else:
                        self.log_test("Preview Endpoint Test", False, 
                                    "Slides have no elements")
                else:
                    self.log_test("Preview Endpoint Test", False, 
                                "No slides contain elements")
            else:
                self.log_test("Preview Endpoint Test", False, 
                            "Preview response missing presentation or slides data")
        else:
            if "404" in details:
                self.log_test("Preview Endpoint Test", False, 
                            "Preview returned 404 - presentation not found", details)
            else:
                self.log_test("Preview Endpoint Test", False, 
                            "Preview endpoint failed", details)

    # ==================== CRITICAL 404 FIX TESTS ====================
    
    async def test_critical_slide_endpoints(self):
        """Test the critical endpoints that were added to fix 404 errors"""
        print("\n🎯 TESTING CRITICAL SLIDE ENDPOINTS (404 FIX)")
        print("-" * 50)
        
        # Create test presentation first
        if not await self.create_test_presentation():
            return
        
        # Test the specific endpoints mentioned in review request
        await self.test_get_presentation_slides_endpoint()
        await self.test_create_slide_for_presentation_endpoint()
        await self.test_slide_endpoints_authentication()
        await self.test_slide_endpoints_error_handling()
    
    async def test_get_presentation_slides_endpoint(self):
        """Test GET /api/presentations/{presentation_id}/slides endpoint"""
        if not self.test_presentation_id:
            self.log_test("GET Presentation Slides Endpoint", False, "No test presentation available")
            return
        
        print("    📋 Testing GET /api/presentations/{id}/slides...")
        
        # First create 2-3 slides for testing
        slide_ids = []
        for i in range(1, 4):
            slide_data = {
                "slide_number": i,
                "layout": "content" if i > 1 else "title-slide",
                "title": f"Test Slide {i}",
                "elements": [
                    {
                        "type": "text",
                        "position": {"x": 10, "y": 10, "width": 80, "height": 20, "z_index": 1},
                        "content": {"text": f"Content for slide {i}"},
                        "style": {"font_size": 18, "color": "#333333"}
                    }
                ],
                "background": {"type": "solid", "color": "#ffffff"}
            }
            
            success, response, details = await self.make_request(
                "POST", f"/presentations/{self.test_presentation_id}/slides", slide_data)
            
            if success and response.get("success"):
                slide_ids.append(response.get("data", {}).get("id"))
        
        # Now test GET endpoint
        success, response, details = await self.make_request(
            "GET", f"/presentations/{self.test_presentation_id}/slides")
        
        if success and response.get("success"):
            slides = response.get("data", [])
            count = response.get("count", 0)
            
            # Verify response format
            if "success" in response and "data" in response and "count" in response:
                # Verify slides are ordered by slide_number
                slide_numbers = [slide.get("slide_number", 0) for slide in slides]
                is_ordered = slide_numbers == sorted(slide_numbers)
                
                if is_ordered and count == len(slides) and len(slides) >= 3:
                    self.log_test("GET Presentation Slides Endpoint", True, 
                                f"Retrieved {count} slides in correct order")
                else:
                    self.log_test("GET Presentation Slides Endpoint", False, 
                                f"Slides not properly ordered or count mismatch. Got {len(slides)} slides, count: {count}")
            else:
                self.log_test("GET Presentation Slides Endpoint", False, 
                            "Response missing required fields (success, data, count)")
        else:
            self.log_test("GET Presentation Slides Endpoint", False, 
                        "Failed to retrieve slides", details)
    
    async def test_create_slide_for_presentation_endpoint(self):
        """Test POST /api/presentations/{presentation_id}/slides endpoint"""
        if not self.test_presentation_id:
            self.log_test("POST Create Slide Endpoint", False, "No test presentation available")
            return
        
        print("    ➕ Testing POST /api/presentations/{id}/slides...")
        
        # Test slide creation with proper payload
        slide_data = {
            "slide_number": 1,
            "layout": "blank",
            "title": "Test Slide Creation",
            "elements": [],
            "background": {"type": "solid", "color": "#ffffff"}
        }
        
        success, response, details = await self.make_request(
            "POST", f"/presentations/{self.test_presentation_id}/slides", slide_data)
        
        if success and response.get("success"):
            slide_data_response = response.get("data", {})
            
            # Verify response format
            if "success" in response and "data" in response and "message" in response:
                # Verify slide was created with correct data
                if (slide_data_response.get("title") == "Test Slide Creation" and
                    slide_data_response.get("layout") == "blank" and
                    slide_data_response.get("slide_number") == 1):
                    
                    # Store slide ID for further testing
                    self.test_slide_id = slide_data_response.get("id")
                    
                    self.log_test("POST Create Slide Endpoint", True, 
                                f"Created slide with ID: {self.test_slide_id}")
                    
                    # Test creating another slide to verify slide_number increments
                    await self.test_slide_number_increment()
                else:
                    self.log_test("POST Create Slide Endpoint", False, 
                                "Slide data doesn't match input")
            else:
                self.log_test("POST Create Slide Endpoint", False, 
                            "Response missing required fields (success, data, message)")
        else:
            self.log_test("POST Create Slide Endpoint", False, 
                        "Failed to create slide", details)
    
    async def test_slide_number_increment(self):
        """Test that slide numbers increment properly"""
        slide_data = {
            "slide_number": 2,
            "layout": "content",
            "title": "Second Test Slide",
            "elements": [],
            "background": {"type": "solid", "color": "#ffffff"}
        }
        
        success, response, details = await self.make_request(
            "POST", f"/presentations/{self.test_presentation_id}/slides", slide_data)
        
        if success and response.get("success"):
            slide_data_response = response.get("data", {})
            if slide_data_response.get("slide_number") == 2:
                self.log_test("Slide Number Increment", True, "Slide numbers increment correctly")
            else:
                self.log_test("Slide Number Increment", False, 
                            f"Expected slide_number 2, got {slide_data_response.get('slide_number')}")
        else:
            self.log_test("Slide Number Increment", False, "Failed to create second slide", details)
    
    async def test_slide_endpoints_authentication(self):
        """Test authentication requirements for slide endpoints"""
        print("    🔐 Testing authentication requirements...")
        
        # Store original token
        original_token = self.auth_token
        self.auth_token = None
        
        # Test GET without authentication
        success, response, details = await self.make_request(
            "GET", f"/presentations/{self.test_presentation_id}/slides")
        
        if not success and "401" in details:
            self.log_test("GET Slides - Auth Required", True, "Properly rejected unauthorized GET request")
        else:
            self.log_test("GET Slides - Auth Required", False, "Should require authentication for GET")
        
        # Test POST without authentication
        slide_data = {"slide_number": 1, "layout": "blank", "title": "Test"}
        success, response, details = await self.make_request(
            "POST", f"/presentations/{self.test_presentation_id}/slides", slide_data)
        
        if not success and "401" in details:
            self.log_test("POST Slides - Auth Required", True, "Properly rejected unauthorized POST request")
        else:
            self.log_test("POST Slides - Auth Required", False, "Should require authentication for POST")
        
        # Restore token
        self.auth_token = original_token
    
    async def test_slide_endpoints_error_handling(self):
        """Test error handling for slide endpoints"""
        print("    🚫 Testing error handling...")
        
        # Test with non-existent presentation ID
        fake_id = "non-existent-presentation-id"
        
        # Test GET with invalid presentation ID
        success, response, details = await self.make_request(
            "GET", f"/presentations/{fake_id}/slides")
        
        if not success and "404" in details:
            self.log_test("GET Slides - Invalid ID", True, "Properly returned 404 for invalid presentation ID")
        else:
            self.log_test("GET Slides - Invalid ID", False, "Should return 404 for invalid presentation ID")
        
        # Test POST with invalid presentation ID
        slide_data = {"slide_number": 1, "layout": "blank", "title": "Test"}
        success, response, details = await self.make_request(
            "POST", f"/presentations/{fake_id}/slides", slide_data)
        
        if not success and "404" in details:
            self.log_test("POST Slides - Invalid ID", True, "Properly returned 404 for invalid presentation ID")
        else:
            self.log_test("POST Slides - Invalid ID", False, "Should return 404 for invalid presentation ID")

    # ==================== MAIN TEST RUNNER ====================
    
    async def run_all_tests(self):
        """Run all tests in sequence"""
        await self.setup()
        
        try:
            print("🔐 AUTHENTICATION TESTS")
            print("-" * 30)
            await self.test_user_registration()
            if not self.auth_token:
                await self.test_user_login()
            
            if not self.auth_token:
                print("❌ Cannot proceed without authentication")
                return
            
            # PRIORITY: Test the critical endpoints that fix 404 errors
            await self.test_critical_slide_endpoints()
            
            # Focus on AI Presentation Generation Flow as requested
            await self.test_ai_presentation_flow()
            
            print("\n🤖 ADDITIONAL AI SERVICE TESTS")
            print("-" * 30)
            await self.test_ai_health_check()
            await self.test_ai_outline_generation()
            await self.test_ai_slide_content_generation()
            await self.test_ai_content_improvement()
            
            print("\n📊 PRESENTATION & SLIDE TESTS")
            print("-" * 30)
            if await self.create_test_presentation():
                await self.test_create_slide()
                await self.test_list_slides()
                await self.test_get_single_slide()
                await self.test_update_slide()
                await self.test_duplicate_slide()
                await self.test_reorder_slides()
                await self.test_delete_slide()
            
            print("\n🚫 ERROR HANDLING TESTS")
            print("-" * 30)
            await self.test_unauthorized_access()
            await self.test_invalid_presentation_id()
            await self.test_invalid_slide_id()
            
        finally:
            await self.cleanup()
            self.print_summary()

    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📋 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.results['total_tests']}")
        print(f"✅ Passed: {self.results['passed']}")
        print(f"❌ Failed: {self.results['failed']}")
        
        if self.results['failed'] > 0:
            print(f"\n🔍 FAILED TESTS:")
            for error in self.results['errors']:
                print(f"  • {error['test']}: {error['message']}")
        
        success_rate = (self.results['passed'] / self.results['total_tests']) * 100 if self.results['total_tests'] > 0 else 0
        print(f"\n📊 Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 90:
            print("🎉 Excellent! Backend is working well.")
        elif success_rate >= 70:
            print("⚠️  Good, but some issues need attention.")
        else:
            print("🚨 Multiple issues detected. Review required.")

async def main():
    """Main entry point"""
    tester = SlideoTester()
    await tester.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())