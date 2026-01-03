import { useState } from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { SignupForm } from '../components/auth/SignupForm';
import { Sparkles, Presentation, Wand2, Image, MessageSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50" data-testid="landing-page">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left: Branding & Features */}
          <div className="flex-1 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900">
                  Slideo
                </h1>
              </div>
              <p className="text-xl text-gray-600 max-w-xl">
                Create stunning presentations in seconds with AI. 
                Just describe your topic, and watch the magic happen.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4 max-w-2xl">
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200" data-testid="feature-ai-generation">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Wand2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI Generation</h3>
                  <p className="text-sm text-gray-600">Full decks from prompts</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200" data-testid="feature-smart-editor">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Presentation className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Smart Editor</h3>
                  <p className="text-sm text-gray-600">Intuitive drag & drop</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200" data-testid="feature-ai-images">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Image className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI Images</h3>
                  <p className="text-sm text-gray-600">Generate visuals instantly</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200" data-testid="feature-ai-assistant">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI Assistant</h3>
                  <p className="text-sm text-gray-600">Chat for improvements</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Auth Forms */}
          <div className="w-full lg:w-[440px]">
            <Card className="shadow-xl border-gray-200">
              <CardHeader>
                <CardTitle className="text-2xl">Get Started</CardTitle>
                <CardDescription>
                  Create your account or sign in to continue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login" data-testid="login-tab">Login</TabsTrigger>
                    <TabsTrigger value="signup" data-testid="signup-tab">Sign Up</TabsTrigger>
                  </TabsList>
                  <TabsContent value="login" className="mt-6">
                    <LoginForm />
                  </TabsContent>
                  <TabsContent value="signup" className="mt-6">
                    <SignupForm />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};