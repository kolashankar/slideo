# Slideo - AI-Powered Presentation Builder
## Complete MVP Implementation Plan

**Project Name:** Slideo  
**Tech Stack:** FastAPI + React + MongoDB + Gemini APIs  
**Inspiration:** Gamma, Kimi  
**Status:** Planning Complete | Phase 1: IN PROGRESS

---

## 🎯 PROJECT OVERVIEW

Slideo is an AI-powered presentation builder that enables users to create professional presentations using AI. Key features include:
- AI-generated presentations from text prompts
- Intelligent slide editor with drag-and-drop
- Template library with professional designs
- AI chat assistant for content creation
- Real-time preview and editing
- Export to PDF/PPTX
- Image generation for slides using Gemini Nano Banana
- Multi-slide management with outline view

---

## 📋 COMPLETE FEATURE LIST

### Core Features
1. **User Authentication & Workspace**
   - Email/Password authentication
   - User workspace dashboard
   - Presentation management (create, view, delete)

2. **AI Presentation Generation**
   - Prompt-based generation (describe topic → AI creates full deck)
   - Outline-based generation (structure → content)
   - Template selection
   - Auto-generate 5-15 slides based on content

3. **Slide Editor**
   - Canvas-based slide editing
   - Text elements with rich formatting
   - Image integration
   - Layout templates
   - Drag-and-drop elements
   - Undo/Redo functionality

4. **AI Chat Assistant**
   - Contextual chat for presentation improvement
   - Content suggestions
   - Slide refinement
   - Image generation requests

5. **Template Library**
   - Business presentations
   - Educational content
   - Marketing pitches
   - Minimalist designs
   - Creative layouts

6. **Export & Sharing**
   - PDF export
   - Download presentation
   - View-only sharing links
   - Presentation preview mode

7. **Media Management**
   - AI image generation (Gemini Nano Banana)
   - Image upload
   - Image library

---

## 🗂️ DATABASE SCHEMA

### Collections

#### users
```javascript
{
  id: String (UUID),
  email: String (unique),
  password: String (hashed),
  name: String,
  created_at: DateTime,
  workspace_name: String
}
```

#### presentations
```javascript
{
  id: String (UUID),
  user_id: String,
  title: String,
  description: String,
  template: String,
  thumbnail_url: String,
  slides: Array of Slide IDs,
  created_at: DateTime,
  updated_at: DateTime,
  is_public: Boolean,
  view_count: Integer
}
```

#### slides
```javascript
{
  id: String (UUID),
  presentation_id: String,
  slide_number: Integer,
  layout: String,
  elements: Array [{
    type: String (text/image/shape),
    content: Object,
    position: {x, y, width, height},
    style: Object
  }],
  background: Object,
  notes: String,
  created_at: DateTime
}
```

#### templates
```javascript
{
  id: String (UUID),
  name: String,
  category: String,
  thumbnail_url: String,
  slide_layouts: Array,
  color_scheme: Object,
  font_family: String,
  created_at: DateTime
}
```

#### ai_generations
```javascript
{
  id: String (UUID),
  user_id: String,
  presentation_id: String,
  prompt: String,
  type: String (text/image/presentation),
  result: Object,
  created_at: DateTime
}
```

---

## 📁 FILE STRUCTURE

```
/app/
├── backend/
│   ├── server.py (Main FastAPI app)
│   ├── requirements.txt
│   ├── .env
│   ├── models/
│   │   ├── user.py
│   │   ├── presentation.py
│   │   ├── slide.py
│   │   └── template.py
│   ├── routes/
│   │   ├── auth.py
│   │   ├── presentations.py
│   │   ├── slides.py
│   │   ├── ai.py
│   │   └── templates.py
│   ├── services/
│   │   ├── gemini_service.py (AI text + image generation)
│   │   ├── presentation_generator.py
│   │   └── export_service.py
│   └── utils/
│       ├── auth_utils.py
│       └── validators.py
│
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.css
│   │   ├── pages/
│   │   │   ├── Landing.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Editor.js
│   │   │   └── Preview.js
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.js
│   │   │   │   └── SignupForm.js
│   │   │   ├── dashboard/
│   │   │   │   ├── PresentationCard.js
│   │   │   │   ├── CreateNew.js
│   │   │   │   └── TemplateSelector.js
│   │   │   ├── editor/
│   │   │   │   ├── Canvas.js
│   │   │   │   ├── Toolbar.js
│   │   │   │   ├── SlideList.js
│   │   │   │   ├── ElementEditor.js
│   │   │   │   └── AIChat.js
│   │   │   ├── templates/
│   │   │   │   └── TemplateGallery.js
│   │   │   ├── common/
│   │   │   │   ├── Navbar.js
│   │   │   │   ├── Sidebar.js
│   │   │   │   └── Loading.js
│   │   │   └── ui/ (shadcn components)
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── usePresentation.js
│   │   │   └── useAI.js
│   │   └── utils/
│   │       ├── api.js
│   │       └── constants.js
│   └── package.json
│
└── implementation.md (this file)
```

---

## 🚀 IMPLEMENTATION PHASES

---

### **PHASE 1: Foundation & Authentication** ✅ COMPLETED
**Goal:** Set up backend infrastructure, authentication, and basic dashboard

#### Files Created/Modified:
1. ✅ `/app/backend/.env` - Added Gemini API keys + JWT secrets
2. ✅ `/app/backend/requirements.txt` - Added emergentintegrations, passlib, python-jose
3. ✅ `/app/backend/models/user.py` - User data model with Pydantic
4. ✅ `/app/backend/routes/auth.py` - Complete auth endpoints
5. ✅ `/app/backend/utils/auth_utils.py` - JWT & password utilities (bcrypt)
6. ✅ `/app/backend/server.py` - Updated with auth routes
7. ✅ `/app/frontend/src/pages/Landing.js` - Beautiful landing page
8. ✅ `/app/frontend/src/pages/Dashboard.js` - User dashboard
9. ✅ `/app/frontend/src/components/auth/LoginForm.js` - Login form with validation
10. ✅ `/app/frontend/src/components/auth/SignupForm.js` - Signup form with validation
11. ✅ `/app/frontend/src/hooks/useAuth.js` - Auth context & hooks
12. ✅ `/app/frontend/src/utils/api.js` - Axios client with interceptors
13. ✅ `/app/frontend/src/App.js` - Routing with protected routes
14. ✅ `/app/frontend/src/index.css` - Updated design tokens (Manrope + Inter fonts)
15. ✅ `/app/frontend/src/App.css` - Custom animations and styles

#### API Endpoints Implemented:
- ✅ `POST /api/auth/signup` - Register new user (returns JWT + user data)
- ✅ `POST /api/auth/login` - Login user (validates credentials, returns JWT)
- ✅ `GET /api/auth/me` - Get current user (requires Bearer token)

#### Features Implemented:
- [x] User registration with email/password validation
- [x] Secure password hashing with bcrypt
- [x] JWT token generation (30-day expiry)
- [x] JWT token validation and decoding
- [x] Protected routes (redirects to login if not authenticated)
- [x] Public routes (redirects to dashboard if already authenticated)
- [x] Beautiful landing page with feature highlights
- [x] Tab-based auth UI (Login/Signup)
- [x] Dashboard with user workspace
- [x] Logout functionality
- [x] Modern UI with Manrope (headings) + Inter (body)
- [x] Responsive design with gradient backgrounds
- [x] Loading states
- [x] Error handling and display
- [x] LocalStorage token persistence
- [x] Axios interceptors for automatic token injection

#### Test Results:
- ✅ Backend API running: `Slideo API is running - Version 1.0.0`
- ✅ Signup endpoint: Successfully creates user and returns JWT token
- ✅ Login endpoint: Successfully authenticates and returns JWT token
- ✅ Auth /me endpoint: Successfully retrieves user data with valid token
- ✅ Frontend loads correctly with beautiful landing page
- ✅ Auth forms display properly with tabbed interface

#### AI Prompts Used:
- N/A (Pure authentication implementation)

**Status:** ✅ COMPLETED (2026-01-03)

**Completion Time:** ~15 minutes  
**Files Created:** 15 files  
**Lines of Code:** ~1,100 lines

---

### **PHASE 2: Dashboard & Presentation Management**
**Goal:** Create workspace dashboard, presentation CRUD, and basic templates

#### Files to Create/Modify:
1. `/app/backend/models/presentation.py` - Presentation model
2. `/app/backend/models/template.py` - Template model
3. `/app/backend/routes/presentations.py` - Presentation CRUD
4. `/app/backend/routes/templates.py` - Template endpoints
5. `/app/backend/server.py` - Add new routes
6. `/app/frontend/src/pages/Dashboard.js` - Main dashboard
7. `/app/frontend/src/components/dashboard/PresentationCard.js` - Presentation cards
8. `/app/frontend/src/components/dashboard/CreateNew.js` - Create modal
9. `/app/frontend/src/components/dashboard/TemplateSelector.js` - Template picker
10. `/app/frontend/src/components/common/Navbar.js` - Navigation bar
11. `/app/frontend/src/hooks/usePresentation.js` - Presentation hook

#### API Endpoints:
- `GET /api/presentations` - List user presentations
- `POST /api/presentations` - Create presentation
- `GET /api/presentations/{id}` - Get single presentation
- `PUT /api/presentations/{id}` - Update presentation
- `DELETE /api/presentations/{id}` - Delete presentation
- `GET /api/templates` - List available templates

#### Features to Implement:
- [ ] User workspace dashboard
- [ ] Grid/List view of presentations
- [ ] Create new presentation modal
- [ ] Template selection (5+ templates)
- [ ] Presentation card with thumbnail, title, date
- [ ] Delete presentation
- [ ] Search/filter presentations
- [ ] Recent presentations
- [ ] Presentation metadata (view count, last edited)

#### AI Prompts Used:
- N/A (CRUD operations)

**Status:** NOT STARTED

---

### **PHASE 3: AI Integration - Text Generation**
**Goal:** Integrate Gemini 3 Flash for presentation content generation

#### Files to Create/Modify:
1. `/app/backend/services/gemini_service.py` - Gemini API wrapper
2. `/app/backend/services/presentation_generator.py` - AI presentation logic
3. `/app/backend/routes/ai.py` - AI generation endpoints
4. `/app/backend/server.py` - Add AI routes
5. `/app/frontend/src/hooks/useAI.js` - AI generation hook
6. `/app/frontend/src/components/dashboard/AIGenerator.js` - AI generation UI

#### API Endpoints:
- `POST /api/ai/generate-presentation` - Generate full presentation from prompt
- `POST /api/ai/generate-outline` - Generate outline from topic
- `POST /api/ai/generate-slide-content` - Generate content for single slide
- `POST /api/ai/improve-content` - Refine existing content

#### Features to Implement:
- [ ] Gemini 3 Flash integration (emergentintegrations)
- [ ] Prompt-based presentation generation
- [ ] Generate 5-15 slides with titles and content
- [ ] Smart slide structure (intro, body, conclusion)
- [ ] Topic analysis and content expansion
- [ ] Loading states with progress
- [ ] Error handling and retry logic

#### AI Prompts Used:
**System Prompt for Presentation Generation:**
```
You are an expert presentation designer. Given a topic and optional outline, create a professional presentation with the following structure:

1. Analyze the topic and determine optimal slide count (5-15 slides)
2. Create an engaging title slide
3. Generate content slides with clear, concise points
4. Include a conclusion/thank you slide
5. Each slide should have:
   - Clear title (5-8 words)
   - 3-5 bullet points or 2-3 paragraphs
   - Suggested visuals (describe what images would work)

Format response as JSON with slides array.
```

**User Prompt Template:**
```
Create a presentation about: {user_topic}
Target audience: {audience}
Presentation length: {slide_count} slides
Tone: {professional/casual/educational}
```

**Status:** NOT STARTED

---

### **PHASE 4: Slide Data Model & Storage**
**Goal:** Create slide structure and database operations

#### Files to Create/Modify:
1. `/app/backend/models/slide.py` - Slide model with elements
2. `/app/backend/routes/slides.py` - Slide CRUD endpoints
3. `/app/backend/server.py` - Add slide routes

#### API Endpoints:
- `GET /api/presentations/{id}/slides` - Get all slides
- `POST /api/presentations/{id}/slides` - Add new slide
- `PUT /api/slides/{id}` - Update slide
- `DELETE /api/slides/{id}` - Delete slide
- `POST /api/slides/{id}/duplicate` - Duplicate slide
- `PUT /api/slides/{id}/reorder` - Reorder slides

#### Features to Implement:
- [ ] Slide model with elements (text, images, shapes)
- [ ] Element positioning (x, y, width, height)
- [ ] Element styling (font, color, size)
- [ ] Slide backgrounds
- [ ] Slide notes
- [ ] Slide ordering

**Status:** NOT STARTED

---

### **PHASE 5: Slide Editor - Canvas & Toolbar**
**Goal:** Build interactive slide editor with canvas

#### Files to Create/Modify:
1. `/app/frontend/src/pages/Editor.js` - Main editor page
2. `/app/frontend/src/components/editor/Canvas.js` - Slide canvas
3. `/app/frontend/src/components/editor/Toolbar.js` - Editor toolbar
4. `/app/frontend/src/components/editor/SlideList.js` - Slide thumbnails
5. `/app/frontend/src/components/editor/ElementEditor.js` - Properties panel
6. `/app/frontend/src/hooks/useEditor.js` - Editor state management

#### Features to Implement:
- [ ] Canvas rendering with zoom controls
- [ ] Element selection and manipulation
- [ ] Text editing (inline)
- [ ] Drag-and-drop positioning
- [ ] Resize handles
- [ ] Toolbar with text/image/shape tools
- [ ] Property panel (font, size, color, alignment)
- [ ] Slide navigation sidebar
- [ ] Undo/Redo functionality
- [ ] Keyboard shortcuts
- [ ] Auto-save functionality

**Status:** NOT STARTED

---

### **PHASE 6: AI Image Generation**
**Goal:** Integrate Gemini Nano Banana for slide images

#### Files to Create/Modify:
1. `/app/backend/services/gemini_service.py` - Add image generation
2. `/app/backend/routes/ai.py` - Add image endpoints
3. `/app/frontend/src/components/editor/ImageGenerator.js` - Image gen UI
4. `/app/frontend/src/components/editor/ImageLibrary.js` - Generated images

#### API Endpoints:
- `POST /api/ai/generate-image` - Generate image from prompt
- `POST /api/ai/generate-slide-image` - Generate contextual image for slide
- `GET /api/ai/image-history` - Get user's generated images

#### Features to Implement:
- [ ] Gemini Nano Banana integration (emergentintegrations)
- [ ] Image generation from text prompt
- [ ] Contextual image suggestions based on slide content
- [ ] Image preview before adding to slide
- [ ] Image library modal
- [ ] Download generated images
- [ ] Image caching

#### AI Prompts Used:
**Image Generation Prompt Template:**
```
Create a professional, high-quality image for a presentation slide about: {slide_content}

Style: {modern/minimalist/corporate/creative}
Color scheme: {primary_colors}
Mood: {professional/inspiring/educational}
Image type: {illustration/photograph/abstract}

The image should be suitable for a business presentation and visually support the slide content.
```

**Status:** NOT STARTED

---

### **PHASE 7: AI Chat Assistant**
**Goal:** Build chat interface for presentation improvements

#### Files to Create/Modify:
1. `/app/backend/routes/ai.py` - Add chat endpoints
2. `/app/backend/services/gemini_service.py` - Chat service
3. `/app/frontend/src/components/editor/AIChat.js` - Chat interface
4. `/app/frontend/src/hooks/useChat.js` - Chat management

#### API Endpoints:
- `POST /api/ai/chat` - Send chat message
- `GET /api/ai/chat-history/{presentation_id}` - Get chat history
- `POST /api/ai/apply-suggestion` - Apply AI suggestion to slide

#### Features to Implement:
- [ ] Chat interface in editor sidebar
- [ ] Context-aware responses (current slide)
- [ ] Suggestions for improvements
- [ ] Content generation within chat
- [ ] Apply suggestions directly to slides
- [ ] Chat history per presentation
- [ ] Quick actions (improve content, add slide, generate image)

#### AI Prompts Used:
**Chat System Prompt:**
```
You are an AI presentation assistant. Help users improve their presentations by:
1. Suggesting better wording and structure
2. Recommending visual elements
3. Providing content ideas
4. Offering design tips
5. Answering questions about their presentation

Current presentation context: {presentation_title}
Current slide: {current_slide_content}
User question: {user_message}

Provide concise, actionable advice.
```

**Status:** NOT STARTED

---

### **PHASE 8: Templates & Styling**
**Goal:** Create template library and styling system

#### Files to Create/Modify:
1. `/app/backend/routes/templates.py` - Template management
2. `/app/frontend/src/components/templates/TemplateGallery.js` - Template browser
3. `/app/frontend/src/utils/templateEngine.js` - Apply templates

#### Features to Implement:
- [ ] 10+ professional templates
- [ ] Template categories (Business, Education, Creative, Minimal)
- [ ] Template preview
- [ ] Apply template to existing presentation
- [ ] Custom color schemes
- [ ] Font pairing system
- [ ] Save custom templates

#### Templates to Create:
1. **Modern Business** - Clean, professional, blue/grey palette
2. **Bold Pitch** - High contrast, large text, attention-grabbing
3. **Minimal White** - Simple, lots of whitespace, elegant
4. **Dark Elegance** - Dark background, gold accents, premium feel
5. **Gradient Flow** - Smooth gradients, modern, tech-focused
6. **Educational** - Clear hierarchy, easy to read, organized
7. **Creative Burst** - Colorful, playful, energetic
8. **Corporate Standard** - Traditional, trustworthy, formal
9. **Startup Pitch** - Dynamic, innovative, venture-ready
10. **Portfolio** - Image-focused, stylish, personal brand

**Status:** NOT STARTED

---

### **PHASE 9: Export & Preview**
**Goal:** PDF export and presentation preview mode

#### Files to Create/Modify:
1. `/app/backend/services/export_service.py` - Export logic
2. `/app/backend/routes/export.py` - Export endpoints
3. `/app/frontend/src/pages/Preview.js` - Presentation preview
4. `/app/frontend/src/components/preview/SlideShow.js` - Slideshow component

#### API Endpoints:
- `POST /api/export/pdf/{presentation_id}` - Export to PDF
- `GET /api/presentations/{id}/preview` - Get preview data
- `POST /api/presentations/{id}/share` - Generate share link

#### Features to Implement:
- [ ] PDF export with proper layout
- [ ] Full-screen preview mode
- [ ] Slide navigation (arrows, keyboard)
- [ ] Presentation timer
- [ ] Speaker notes view
- [ ] Public share links
- [ ] Download presentation
- [ ] Print-friendly format

**Status:** NOT STARTED

---

### **PHASE 10: Polish & Optimization**
**Goal:** UI/UX refinements, performance, and final touches

#### Features to Implement:
- [ ] Loading skeletons
- [ ] Toast notifications
- [ ] Error boundaries
- [ ] Keyboard shortcuts guide
- [ ] Onboarding tutorial
- [ ] Empty states
- [ ] Responsive design improvements
- [ ] Performance optimization (lazy loading, caching)
- [ ] Accessibility improvements
- [ ] Analytics tracking
- [ ] User feedback mechanism

**Status:** NOT STARTED

---

## 🎨 DESIGN SYSTEM

### Color Palette
- **Primary:** #2563EB (Blue) - Actions, links, primary buttons
- **Secondary:** #10B981 (Green) - Success states, create actions
- **Accent:** #8B5CF6 (Purple) - AI features, highlights
- **Background:** #FFFFFF (White) - Main background
- **Surface:** #F9FAFB (Light Grey) - Cards, panels
- **Border:** #E5E7EB (Grey) - Dividers, borders
- **Text Primary:** #111827 (Dark Grey) - Main text
- **Text Secondary:** #6B7280 (Medium Grey) - Secondary text

### Typography
- **Headings:** Manrope (700, 600, 500)
- **Body:** Inter (400, 500)
- **Monospace:** Source Code Pro (for code/technical)

### Spacing Scale
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- 3xl: 64px

---

## 🔧 TECHNICAL DECISIONS

### Backend
- **Framework:** FastAPI (async for AI requests)
- **Database:** MongoDB (flexible schema for slides)
- **Auth:** JWT tokens with httpOnly cookies
- **AI Integration:** emergentintegrations library
- **File Storage:** Base64 encoding for images in MongoDB (MVP)

### Frontend
- **Framework:** React 19
- **Routing:** React Router v7
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** React hooks + Context API
- **API Client:** Axios
- **Canvas:** HTML Canvas API / SVG
- **Icons:** Lucide React

### AI Integration
- **Text Generation:** Gemini 3 Flash via emergentintegrations
- **Image Generation:** Gemini Nano Banana via emergentintegrations
- **API Key:** EMERGENT_LLM_KEY (mock for development)

---

## 📊 SUCCESS METRICS

### Phase 1 Success Criteria:
- [x] User can register and login
- [x] JWT authentication working
- [x] Protected routes functional
- [x] Landing page displays correctly
- [x] Auth forms validate input

### MVP Success Criteria:
- [ ] User can generate a presentation from a prompt in < 30 seconds
- [ ] Generated presentations have 5-15 slides with relevant content
- [ ] User can edit slide content (text)
- [ ] User can add AI-generated images to slides
- [ ] User can export presentation to PDF
- [ ] Dashboard shows all user presentations
- [ ] Templates can be applied to presentations
- [ ] AI chat provides helpful suggestions

---

## 🚀 DEPLOYMENT NOTES

### Environment Variables Required:
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=slideo_db
JWT_SECRET=<generate_secure_secret>
JWT_ALGORITHM=HS256
EMERGENT_LLM_KEY=sk-emergent-2188dD9BeD455274a8
CORS_ORIGINS=*
```

### Production Considerations:
- Move to cloud MongoDB (Atlas)
- Implement rate limiting for AI endpoints
- Add request caching for repeated prompts
- Image CDN for generated images
- WebSocket for real-time collaboration (future)
- Redis for session management (future)

---

## 📝 NOTES

- Using mock Gemini credentials during development
- Focus on core features first, advanced editing later
- Template system should be extensible
- Keep AI prompts in constants file for easy tuning
- Consider export quality vs. file size tradeoffs
- Future: Real-time collaboration, version history, comments

---

**Last Updated:** 2025-01-03
**Current Phase:** Phase 1 - Foundation & Authentication
**Next Phase:** Phase 2 - Dashboard & Presentation Management
