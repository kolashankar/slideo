#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: |
  Slideo - AI-Powered Presentation Builder MVP
  
  Implementation of Phase 3 (AI Integration - Text Generation) and Phase 4 (Slide Data Model & Storage)
  
  Phase 3 includes:
  - Gemini 3 Flash integration for text generation
  - Gemini Nano Banana integration for image generation
  - Full presentation generation from prompts
  - Outline generation
  - Single slide content generation
  - Content improvement
  - Frontend AI generator modal
  
  Phase 4 includes:
  - Complete slide data model with elements
  - Slide CRUD operations
  - Slide reordering and duplication
  - Element positioning and styling

backend:
  - task: "AI Service - Gemini Integration"
    implemented: true
    working: "NA"
    file: "/app/backend/services/gemini_service.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Implemented Gemini 3 Flash and Gemini Nano Banana integration using emergentintegrations library. Need to test text and image generation."

  - task: "AI Service - Presentation Generator"
    implemented: true
    working: "NA"
    file: "/app/backend/services/presentation_generator.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Implemented business logic for AI presentation generation including full presentations, outlines, single slides, and content improvement. Need to test all generation endpoints."

  - task: "AI Routes - API Endpoints"
    implemented: true
    working: "NA"
    file: "/app/backend/routes/ai.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Implemented 5 AI endpoints: generate-presentation, generate-outline, generate-slide-content, improve-content, generate-image, plus health check. Need to test with authentication."

  - task: "Slide Model - Data Structure"
    implemented: true
    working: "NA"
    file: "/app/backend/models/slide.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Implemented complete slide model with ElementPosition, TextStyle, ShapeStyle, ImageStyle, SlideElement, SlideBackground, and Slide. Includes all request/response models."

  - task: "Slide Routes - CRUD Operations"
    implemented: true
    working: "NA"
    file: "/app/backend/routes/slides.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Implemented 7 slide endpoints: list slides, create slide, get slide, update slide, delete slide, duplicate slide, reorder slides. Need to test all CRUD operations with ownership verification."

  - task: "Auth Utils - User Dependency"
    implemented: true
    working: "NA"
    file: "/app/backend/utils/auth_utils.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Added get_current_user dependency function to extract and verify JWT tokens. Need to verify it works with all new endpoints."

frontend:
  - task: "AI Hook - useAI"
    implemented: true
    working: "NA"
    file: "/app/frontend/src/hooks/useAI.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Implemented React hook for AI operations with loading states, progress tracking, and error handling. Frontend testing not required yet as it's not integrated into the UI flow."

  - task: "AI Generator Component"
    implemented: true
    working: "NA"
    file: "/app/frontend/src/components/dashboard/AIGenerator.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Implemented beautiful AI generator modal with multi-step flow (topic input, options selection, generation). Frontend testing not required yet as it's not integrated into Dashboard."

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 0
  run_ui: false

test_plan:
  current_focus:
    - "AI Service - Gemini Integration"
    - "AI Service - Presentation Generator"
    - "AI Routes - API Endpoints"
    - "Slide Routes - CRUD Operations"
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
  - agent: "main"
    message: |
      Phase 3 and Phase 4 implementation complete. 
      
      Backend implementation includes:
      1. Gemini service with text and image generation
      2. Presentation generator with multiple generation modes
      3. 5 AI API endpoints + health check
      4. Complete slide data model with elements
      5. 7 slide CRUD endpoints
      6. Updated authentication utilities
      
      Frontend implementation includes:
      1. useAI hook for AI operations
      2. AIGenerator modal component (not yet integrated)
      
      TESTING PRIORITY:
      1. Test AI health endpoint
      2. Test AI presentation generation (requires authentication)
      3. Test slide CRUD operations (requires authentication and presentation)
      4. Verify all endpoints return proper error messages
      
      Note: User login/signup flow from Phase 1 should be working.
      Note: Presentation CRUD from Phase 2 should be working.
      
      IMPORTANT: All AI and slide endpoints require authentication (Bearer token).